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

alter table public.profiles
  add column if not exists full_name text,
  add column if not exists phone_country text,
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists source text;

alter table public.cases
  add column if not exists lead_id uuid references public.leads(id) on delete set null,
  add column if not exists payment_method text,
  add column if not exists bank_name text,
  add column if not exists reported_to_authorities boolean,
  add column if not exists contacted_lawyers boolean,
  add column if not exists recovery_offer_received boolean,
  add column if not exists recovery_offer_details text,
  add column if not exists ai_report jsonb,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.profiles
set full_name = trim(concat(coalesce(first_name, ''), ' ', coalesce(last_name, '')))
where full_name is null;

update public.profiles
set phone_country = split_part(coalesce(phone, ''), ' ', 1)
where phone_country is null and phone is not null and phone <> '';

update public.cases
set updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where updated_at is null;

drop trigger if exists set_cases_updated_at on public.cases;
create trigger set_cases_updated_at
before update on public.cases
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.leads enable row level security;
alter table public.lead_transfer_tokens enable row level security;
alter table public.portal_users enable row level security;
alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_evidence enable row level security;
alter table public.case_reports enable row level security;

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
