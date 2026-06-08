create extension if not exists pgcrypto;

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

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

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  first_name text,
  last_name text,
  full_name text,
  email text not null,
  phone text,
  phone_country text,
  country text,
  situation text,
  timeframe text,
  amount numeric,
  evidence text,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists leads_email_idx
  on public.leads (lower(email));

create table if not exists public.lead_transfer_tokens (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by_user_id uuid references public.portal_users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists lead_transfer_tokens_lead_id_idx
  on public.lead_transfer_tokens (lead_id);

create table if not exists public.profiles (
  id uuid primary key references public.portal_users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  full_name text,
  country text,
  phone text,
  phone_country text,
  lead_id uuid references public.leads(id) on delete set null,
  source text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.portal_users(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  company_name text,
  fraud_type text,
  country text,
  start_date text,
  lost_amount numeric,
  currency text,
  payment_method text,
  bank_name text,
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
  reported_to_authorities boolean,
  contacted_lawyers boolean,
  recovery_offer_received boolean,
  recovery_offer_details text,
  ai_report jsonb,
  status text not null default 'Pendiente',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_cases_updated_at on public.cases;
create trigger set_cases_updated_at
before update on public.cases
for each row
execute function public.set_current_timestamp_updated_at();

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

create table if not exists public.investigation_results (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null unique references public.cases(id) on delete cascade,
  blockchain_result jsonb,
  domain_result jsonb,
  regulatory_result jsonb,
  public_intel_result jsonb,
  evidence_result jsonb,
  score_result jsonb,
  findings jsonb,
  sources jsonb,
  timeline jsonb,
  status text not null default 'pending',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

drop trigger if exists set_investigation_results_updated_at on public.investigation_results;
create trigger set_investigation_results_updated_at
before update on public.investigation_results
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.portal_users enable row level security;
alter table public.access_codes enable row level security;
alter table public.private_sessions enable row level security;
alter table public.leads enable row level security;
alter table public.lead_transfer_tokens enable row level security;
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_evidence enable row level security;
alter table public.case_reports enable row level security;
alter table public.investigation_results enable row level security;

drop policy if exists "portal_users_select_own" on public.portal_users;
create policy "portal_users_select_own"
on public.portal_users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "portal_users_insert_own" on public.portal_users;
create policy "portal_users_insert_own"
on public.portal_users
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "portal_users_update_own" on public.portal_users;
create policy "portal_users_update_own"
on public.portal_users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "cases_select_own" on public.cases;
create policy "cases_select_own"
on public.cases
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "cases_insert_own" on public.cases;
create policy "cases_insert_own"
on public.cases
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "cases_update_own" on public.cases;
create policy "cases_update_own"
on public.cases
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "evidence_select_own" on public.case_evidence;
create policy "evidence_select_own"
on public.case_evidence
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "evidence_insert_own" on public.case_evidence;
create policy "evidence_insert_own"
on public.case_evidence
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "evidence_update_own" on public.case_evidence;
create policy "evidence_update_own"
on public.case_evidence
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "reports_select_own" on public.case_reports;
create policy "reports_select_own"
on public.case_reports
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "reports_insert_own" on public.case_reports;
create policy "reports_insert_own"
on public.case_reports
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "reports_update_own" on public.case_reports;
create policy "reports_update_own"
on public.case_reports
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "investigation_select_own" on public.investigation_results;
create policy "investigation_select_own"
on public.investigation_results
for select
to authenticated
using (
  exists (
    select 1
    from public.cases
    where public.cases.id = investigation_results.case_id
      and public.cases.user_id = auth.uid()
  )
);

drop policy if exists "investigation_insert_own" on public.investigation_results;
create policy "investigation_insert_own"
on public.investigation_results
for insert
to authenticated
with check (
  exists (
    select 1
    from public.cases
    where public.cases.id = investigation_results.case_id
      and public.cases.user_id = auth.uid()
  )
);

drop policy if exists "investigation_update_own" on public.investigation_results;
create policy "investigation_update_own"
on public.investigation_results
for update
to authenticated
using (
  exists (
    select 1
    from public.cases
    where public.cases.id = investigation_results.case_id
      and public.cases.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.cases
    where public.cases.id = investigation_results.case_id
      and public.cases.user_id = auth.uid()
  )
);

insert into storage.buckets (id, name, public)
values ('case-evidence', 'case-evidence', false)
on conflict (id) do nothing;

drop policy if exists "storage_select_own_case_evidence" on storage.objects;
create policy "storage_select_own_case_evidence"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'case-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "storage_insert_own_case_evidence" on storage.objects;
create policy "storage_insert_own_case_evidence"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'case-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "storage_update_own_case_evidence" on storage.objects;
create policy "storage_update_own_case_evidence"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'case-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'case-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);

drop policy if exists "storage_delete_own_case_evidence" on storage.objects;
create policy "storage_delete_own_case_evidence"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'case-evidence'
  and auth.uid()::text = (storage.foldername(name))[1]
);
