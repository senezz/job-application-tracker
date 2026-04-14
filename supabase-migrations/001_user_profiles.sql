-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- 1. Create user_profiles table
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  contact_email text,
  links jsonb default '[]'::jsonb,
  cv_file_path text,
  cv_file_name text,
  updated_at timestamptz default now()
);

-- 2. Enable Row Level Security
alter table public.user_profiles enable row level security;

-- 3. Policy: users can only access their own profile
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- 4. Create storage bucket for CV files
insert into storage.buckets (id, name, public)
values ('cv-files', 'cv-files', false)
on conflict (id) do nothing;

-- 5. Storage policies
create policy "Users can upload own CV"
  on storage.objects for insert
  with check (bucket_id = 'cv-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own CV"
  on storage.objects for select
  using (bucket_id = 'cv-files' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own CV"
  on storage.objects for delete
  using (bucket_id = 'cv-files' and auth.uid()::text = (storage.foldername(name))[1]);
