-- 1. Update settings table
alter table public.settings 
  add column if not exists layout_config jsonb default '{}'::jsonb,
  add column if not exists color_scheme jsonb default '{}'::jsonb,
  add column if not exists section_visibility jsonb default '{
    "about": true,
    "projects": true,
    "experience": true,
    "education": true,
    "skills": true
  }'::jsonb,
  add column if not exists custom_css text,
  add column if not exists is_published boolean default false,
  add column if not exists claimed_at timestamptz,
  add column if not exists published_at timestamptz;

create index if not exists idx_settings_published 
  on public.settings(is_published) 
  where is_published = true;

-- 2. User Sync Trigger
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, username, email, avatar_url, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'user_name',
    new.email,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'full_name'
  )
  on conflict (id) do nothing;
  
  insert into public.settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. RLS Policies
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can update own settings"
  on public.settings for update
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.settings for insert
  with check (auth.uid() = user_id);

-- 4. RPC Function (Cached)
create or replace function public.get_complete_profile(p_username text)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid;
  v_cache_key text;
  v_cached_data jsonb;
  v_user_data jsonb;
  v_customizations jsonb;
  v_projects jsonb;
  v_social_links jsonb;
  v_content jsonb;
  v_platform_profiles jsonb;
  v_result jsonb;
begin
  -- 1. Try Cache First
  v_cache_key := 'complete_profile:' || p_username;
  
  select data into v_cached_data
  from public.api_cache
  where key = v_cache_key;
  
  if v_cached_data is not null then
    return v_cached_data;
  end if;

  -- 2. Cache Miss - Build Profile
  select id, row_to_json(u)::jsonb into v_user_id, v_user_data
  from public.users u
  where username = p_username;

  if v_user_id is null then
    return jsonb_build_object(
      'claimed', false,
      'username', p_username
    );
  end if;

  select row_to_json(s)::jsonb into v_customizations
  from public.settings s
  where s.user_id = v_user_id;

  select jsonb_agg(row_to_json(p)) into v_projects
  from (
    select * from public.projects 
    where user_id = v_user_id 
    order by is_pinned desc, score desc
  ) p;

  select jsonb_agg(row_to_json(sl)) into v_social_links
  from public.social_links sl
  where user_id = v_user_id;

  select jsonb_agg(row_to_json(c)) into v_content
  from (
    select * from public.content 
    where user_id = v_user_id 
    order by published_at desc
  ) c;

  select jsonb_object_agg(platform, row_to_json(pp)) into v_platform_profiles
  from public.platform_profiles pp
  where user_id = v_user_id;

  v_result := jsonb_build_object(
    'claimed', true,
    'user_id', v_user_id,
    'profile', v_user_data,
    'customizations', coalesce(v_customizations, '{}'::jsonb),
    'projects', coalesce(v_projects, '[]'::jsonb),
    'social_links', coalesce(v_social_links, '[]'::jsonb),
    'content', coalesce(v_content, '[]'::jsonb),
    'platform_profiles', coalesce(v_platform_profiles, '{}'::jsonb)
  );

  -- 3. Store in Cache
  insert into public.api_cache (key, data)
  values (v_cache_key, v_result)
  on conflict (key) do update
  set data = excluded.data, updated_at = now();

  return v_result;
end;
$$;

revoke execute on function public.get_complete_profile(text) from public;
grant execute on function public.get_complete_profile(text) to service_role;

-- 5. Cache Invalidation Triggers
create or replace function public.invalidate_profile_cache()
returns trigger
language plpgsql
security definer
as $$
declare
  v_username text;
begin
  -- Find username based on user_id
  select username into v_username
  from public.users
  where id = coalesce(new.user_id, old.user_id);
  
  if v_username is not null then
    delete from public.api_cache
    where key = 'complete_profile:' || v_username;
  end if;
  
  return new;
end;
$$;

-- Apply triggers to all relevant tables
drop trigger if exists on_settings_change on public.settings;
create trigger on_settings_change after insert or update or delete on public.settings
  for each row execute procedure public.invalidate_profile_cache();

drop trigger if exists on_projects_change on public.projects;
create trigger on_projects_change after insert or update or delete on public.projects
  for each row execute procedure public.invalidate_profile_cache();

drop trigger if exists on_social_links_change on public.social_links;
create trigger on_social_links_change after insert or update or delete on public.social_links
  for each row execute procedure public.invalidate_profile_cache();

drop trigger if exists on_content_change on public.content;
create trigger on_content_change after insert or update or delete on public.content
  for each row execute procedure public.invalidate_profile_cache();

drop trigger if exists on_platform_profiles_change on public.platform_profiles;
create trigger on_platform_profiles_change after insert or update or delete on public.platform_profiles
  for each row execute procedure public.invalidate_profile_cache();
