alter table if exists public.user_ip_logs
  add column if not exists city text,
  add column if not exists region text,
  add column if not exists country text,
  add column if not exists country_code text,
  add column if not exists isp text;

create index if not exists idx_user_ip_logs_ip_seen_at
  on public.user_ip_logs (ip_address, seen_at desc);
