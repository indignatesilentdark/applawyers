create table if not exists public.flagged_brokers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  aliases jsonb not null default '[]'::jsonb,
  domains jsonb not null default '[]'::jsonb,
  emails jsonb not null default '[]'::jsonb,
  phones jsonb not null default '[]'::jsonb,
  country text,
  risk_level text not null default 'alto',
  status text not null default 'observacion',
  source_type text not null default 'internal',
  source_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists flagged_brokers_normalized_name_idx
  on public.flagged_brokers (normalized_name);

drop trigger if exists set_flagged_brokers_updated_at on public.flagged_brokers;
create trigger set_flagged_brokers_updated_at
before update on public.flagged_brokers
for each row
execute function public.set_current_timestamp_updated_at();

create table if not exists public.broker_signals (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id) on delete cascade,
  user_id uuid not null references public.portal_users(id) on delete cascade,
  signal_type text not null,
  signal_value text not null,
  normalized_value text not null,
  country text,
  fraud_type text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists broker_signals_normalized_value_idx
  on public.broker_signals (normalized_value);

create table if not exists public.external_broker_feeds (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  source_type text not null,
  source_url text not null unique,
  title text not null,
  broker_name text not null,
  normalized_broker_name text not null,
  risk_level text not null default 'medio',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists external_broker_feeds_broker_idx
  on public.external_broker_feeds (normalized_broker_name);

drop trigger if exists set_external_broker_feeds_updated_at on public.external_broker_feeds;
create trigger set_external_broker_feeds_updated_at
before update on public.external_broker_feeds
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.flagged_brokers enable row level security;
alter table public.broker_signals enable row level security;
alter table public.external_broker_feeds enable row level security;

drop policy if exists "broker_signals_select_own" on public.broker_signals;
create policy "broker_signals_select_own"
on public.broker_signals
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "broker_signals_insert_own" on public.broker_signals;
create policy "broker_signals_insert_own"
on public.broker_signals
for insert
to authenticated
with check (auth.uid() = user_id);

insert into public.flagged_brokers (
  name,
  normalized_name,
  aliases,
  domains,
  emails,
  phones,
  country,
  risk_level,
  status,
  source_type,
  source_note
)
values
  (
    'Capitalix',
    'capitalix',
    '["Capitalix Pro", "Capitalix Global"]'::jsonb,
    '["capitalix.com"]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'Global',
    'alto',
    'reportado',
    'internal',
    'Entidad cargada como referencia inicial de broker reportado.'
  ),
  (
    'Broker FX Phantom',
    'broker fx phantom',
    '["FX Phantom", "Phantom Broker"]'::jsonb,
    '["fxphantom.co", "brokerfxphantom.com"]'::jsonb,
    '[]'::jsonb,
    '[]'::jsonb,
    'Global',
    'alto',
    'observacion',
    'internal',
    'Registro semilla para alimentar el radar de coincidencias.'
  )
on conflict do nothing;
