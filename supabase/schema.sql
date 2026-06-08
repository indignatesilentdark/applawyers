create extension if not exists pgcrypto;

create table if not exists public.portal_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default timezone('utc', now())
);

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

create index if not exists private_sessions_user_id_idx
  on public.private_sessions (user_id);

create table if not exists public.profiles (
  id uuid primary key references public.portal_users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  country text,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.portal_users(id) on delete cascade,
  company_name text,
  fraud_type text,
  country text,
  start_date text,
  lost_amount numeric,
  currency text,
  contact_method text,
  promise text,
  steps_followed text,
  suspicion_moment text,
  full_description text,
  wallets text,
  transaction_hashes text,
  platform_links text,
  company_emails text,
  phones_or_users text,
  relevant_urls text,
  status text not null default 'Pendiente',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.case_evidence (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.portal_users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.case_reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases(id) on delete cascade,
  user_id uuid not null references public.portal_users(id) on delete cascade,
  report_json jsonb not null,
  report_text text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.portal_users enable row level security;
alter table public.access_codes enable row level security;
alter table public.private_sessions enable row level security;
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_evidence enable row level security;
alter table public.case_reports enable row level security;

insert into storage.buckets (id, name, public)
values ('case-evidence', 'case-evidence', false)
on conflict (id) do nothing;
