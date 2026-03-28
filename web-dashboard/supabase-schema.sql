-- ClaudeBoost Database Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Profiles table (extends Supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  created_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Boost history table
create table if not exists public.boost_history (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  timestamp timestamptz default now(),
  domain text not null check (domain in ('data_science', 'data_engineering', 'business_analytics', 'general_coding', 'documentation', 'devops', 'other')),
  original text not null,
  boosted text not null,
  chosen text check (chosen in ('boosted', 'original') or chosen is null),
  rating smallint check (rating between 1 and 5 or rating is null),
  feedback text default '',
  original_score jsonb,
  boosted_score jsonb
);

create index if not exists idx_boost_history_user_id on public.boost_history(user_id);
create index if not exists idx_boost_history_domain on public.boost_history(user_id, domain);
create index if not exists idx_boost_history_timestamp on public.boost_history(user_id, timestamp desc);

-- 3. User constraints table
create table if not exists public.user_constraints (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  domain text not null check (domain in ('data_science', 'data_engineering', 'business_analytics', 'general_coding', 'documentation', 'devops', 'other')),
  constraint_text text default '',
  unique(user_id, domain)
);

create index if not exists idx_user_constraints_user_id on public.user_constraints(user_id);

-- 4. User settings table
create table if not exists public.user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  boost_level text default 'medium' check (boost_level in ('light', 'medium', 'full')),
  auto_boost boolean default true
);

-- 5. Row Level Security (RLS) — users can only access their own data

alter table public.profiles enable row level security;
alter table public.boost_history enable row level security;
alter table public.user_constraints enable row level security;
alter table public.user_settings enable row level security;

-- Profiles: users can read/update their own profile
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Boost history: users can CRUD their own entries
create policy "Users can view own history" on public.boost_history for select using (auth.uid() = user_id);
create policy "Users can insert own history" on public.boost_history for insert with check (auth.uid() = user_id);
create policy "Users can update own history" on public.boost_history for update using (auth.uid() = user_id);
create policy "Users can delete own history" on public.boost_history for delete using (auth.uid() = user_id);

-- Constraints: users can CRUD their own constraints
create policy "Users can view own constraints" on public.user_constraints for select using (auth.uid() = user_id);
create policy "Users can insert own constraints" on public.user_constraints for insert with check (auth.uid() = user_id);
create policy "Users can update own constraints" on public.user_constraints for update using (auth.uid() = user_id);

-- Settings: users can CRUD their own settings
create policy "Users can view own settings" on public.user_settings for select using (auth.uid() = user_id);
create policy "Users can insert own settings" on public.user_settings for insert with check (auth.uid() = user_id);
create policy "Users can update own settings" on public.user_settings for update using (auth.uid() = user_id);

-- 6. Auto-create default settings on signup
create or replace function public.handle_new_user_settings()
returns trigger as $$
begin
  insert into public.user_settings (user_id) values (new.id);
  -- Insert default empty constraints for all domains
  insert into public.user_constraints (user_id, domain) values
    (new.id, 'data_science'),
    (new.id, 'data_engineering'),
    (new.id, 'business_analytics'),
    (new.id, 'general_coding'),
    (new.id, 'documentation'),
    (new.id, 'devops'),
    (new.id, 'other');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_settings on auth.users;
create trigger on_auth_user_settings
  after insert on auth.users
  for each row execute procedure public.handle_new_user_settings();
