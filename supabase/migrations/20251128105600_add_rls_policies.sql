-- Enable RLS on tables (if not already enabled)
alter table public.social_links enable row level security;
alter table public.projects enable row level security;
alter table public.settings enable row level security;

-- Social Links Policies
-- Drop existing policies to ensure clean state
drop policy if exists "Users can manage their own social links" on public.social_links;

-- Re-create policies
create policy "Users can manage their own social links"
on public.social_links
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Projects Policies
-- Drop existing policies
drop policy if exists "Users can manage their own projects" on public.projects;

-- Re-create policies
create policy "Users can manage their own projects"
on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Settings Policies
-- Drop existing policies
drop policy if exists "Users can update own settings" on public.settings;
drop policy if exists "Users can insert own settings" on public.settings;
drop policy if exists "Users can manage their own settings" on public.settings;

create policy "Users can manage their own settings"
on public.settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
