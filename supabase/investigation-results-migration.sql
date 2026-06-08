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

alter table public.investigation_results enable row level security;

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
