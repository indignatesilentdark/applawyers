create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  country text,
  phone text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
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
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  file_type text,
  file_size bigint,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.case_reports (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  report_json jsonb not null,
  report_text text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_evidence enable row level security;
alter table public.case_reports enable row level security;

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "cases_select_own"
on public.cases
for select
to authenticated
using (auth.uid() = user_id);

create policy "cases_insert_own"
on public.cases
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "cases_update_own"
on public.cases
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "evidence_select_own"
on public.case_evidence
for select
to authenticated
using (auth.uid() = user_id);

create policy "evidence_insert_own"
on public.case_evidence
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "evidence_update_own"
on public.case_evidence
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "reports_select_own"
on public.case_reports
for select
to authenticated
using (auth.uid() = user_id);

create policy "reports_insert_own"
on public.case_reports
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "reports_update_own"
on public.case_reports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('case-evidence', 'case-evidence', false)
on conflict (id) do nothing;

create policy "storage_select_own_case_evidence"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'case-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "storage_insert_own_case_evidence"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'case-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "storage_update_own_case_evidence"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'case-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'case-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "storage_delete_own_case_evidence"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'case-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);
