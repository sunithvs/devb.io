-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users Table
create table public.users (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  email text unique,
  full_name text,
  avatar_url text,
  bio text,
  location text,
  website text,
  about_summary text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Platform Profiles Table (Deep Integrations: GitHub, GitLab, etc.)
create table public.platform_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  platform text not null, -- 'github', 'gitlab', 'huggingface'
  platform_username text not null,
  platform_id text, -- External ID
  followers int,
  following int,
  contributions int,
  data jsonb default '{}'::jsonb, -- Store extra metrics like PRs merged, issues closed
  last_fetched_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, platform) -- One profile per platform per user
);

-- 3. Projects Table
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  platform text not null, -- 'github', 'gitlab', 'huggingface', 'manual'
  external_id text,
  name text not null,
  description text,
  url text,
  preview_url text, -- Live demo / Preview link
  languages text[], -- List of languages
  stars int,
  forks int,
  score float,
  is_pinned boolean default false,
  platform_data jsonb default '{}'::jsonb, -- Platform specific metrics
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Social Links Table (Simple Links: Twitter, LinkedIn, etc.)
create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  platform text not null,
  url text not null,
  username text,
  created_at timestamptz default now()
);

-- 5. Content Table (Blogs, Videos)
create table public.content (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade not null,
  source text not null, -- 'medium', 'youtube', 'dev.to'
  type text not null, -- 'blog', 'video'
  title text not null,
  url text not null,
  published_at timestamptz,
  thumbnail_url text,
  preview text,
  categories text[],
  metrics jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- 6. Settings Table
create table public.settings (
  user_id uuid primary key references public.users(id) on delete cascade,
  theme text default 'default',
  auto_update boolean default false,
  update_frequency text default 'weekly',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 7. API Cache Table
create table public.api_cache (
  key text primary key, -- e.g., 'github:sunithvs', 'projects:sunithvs'
  data jsonb not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes for performance
create index idx_users_username on public.users(username);
create index idx_platform_profiles_user_id on public.platform_profiles(user_id);
create index idx_projects_user_id on public.projects(user_id);
create index idx_content_user_id on public.content(user_id);

-- Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.platform_profiles enable row level security;
alter table public.projects enable row level security;
alter table public.social_links enable row level security;
alter table public.content enable row level security;
alter table public.settings enable row level security;

-- Policies (Basic Public Read)
create policy "Public profiles are viewable by everyone"
  on public.users for select
  using (true);

create policy "Public platform profiles are viewable by everyone"
  on public.platform_profiles for select
  using (true);

create policy "Public projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Public social links are viewable by everyone"
  on public.social_links for select
  using (true);

create policy "Public content is viewable by everyone"
  on public.content for select
  using (true);

create policy "Public api cache is viewable by everyone"
  on public.api_cache for select
  using (true);

-- Note: Write policies should be restricted to the service role or the authenticated user themselves.
-- For the fetcher service, we assume it uses the SERVICE_ROLE_KEY which bypasses RLS.
