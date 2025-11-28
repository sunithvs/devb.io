-- Add stats columns to users table
alter table public.users add column if not exists issues_closed int default 0;
alter table public.users add column if not exists pull_requests_merged int default 0;
alter table public.users add column if not exists total_contributions int default 0;
