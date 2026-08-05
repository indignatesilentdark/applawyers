alter table public.portal_users
  add column if not exists password_hash text;
