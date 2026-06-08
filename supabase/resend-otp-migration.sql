create extension if not exists pgcrypto;

create table if not exists public.portal_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

insert into public.portal_users (id, email)
select distinct id, email
from public.profiles
where email is not null
on conflict (id) do update
set email = excluded.email;

create table if not exists public.access_codes (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  resend_email_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists access_codes_email_created_idx
  on public.access_codes (email, created_at desc);

create table if not exists public.private_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.portal_users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz
);

alter table public.profiles drop constraint if exists profiles_id_fkey;
alter table public.profiles
  add constraint profiles_id_fkey
  foreign key (id) references public.portal_users(id) on delete cascade;

alter table public.cases drop constraint if exists cases_user_id_fkey;
alter table public.cases
  add constraint cases_user_id_fkey
  foreign key (user_id) references public.portal_users(id) on delete cascade;

alter table public.case_evidence drop constraint if exists case_evidence_user_id_fkey;
alter table public.case_evidence
  add constraint case_evidence_user_id_fkey
  foreign key (user_id) references public.portal_users(id) on delete cascade;

alter table public.case_reports drop constraint if exists case_reports_user_id_fkey;
alter table public.case_reports
  add constraint case_reports_user_id_fkey
  foreign key (user_id) references public.portal_users(id) on delete cascade;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "cases_select_own" on public.cases;
drop policy if exists "cases_insert_own" on public.cases;
drop policy if exists "cases_update_own" on public.cases;
drop policy if exists "evidence_select_own" on public.case_evidence;
drop policy if exists "evidence_insert_own" on public.case_evidence;
drop policy if exists "evidence_update_own" on public.case_evidence;
drop policy if exists "reports_select_own" on public.case_reports;
drop policy if exists "reports_insert_own" on public.case_reports;
drop policy if exists "reports_update_own" on public.case_reports;
drop policy if exists "storage_select_own_case_evidence" on storage.objects;
drop policy if exists "storage_insert_own_case_evidence" on storage.objects;
drop policy if exists "storage_update_own_case_evidence" on storage.objects;
drop policy if exists "storage_delete_own_case_evidence" on storage.objects;

alter table public.portal_users enable row level security;
alter table public.access_codes enable row level security;
alter table public.private_sessions enable row level security;
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_evidence enable row level security;
alter table public.case_reports enable row level security;
