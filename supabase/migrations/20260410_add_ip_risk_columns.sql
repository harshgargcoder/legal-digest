alter table if exists public.user_ip_logs
  add column if not exists risk_level text default 'trusted',
  add column if not exists risk_reason text;

create index if not exists idx_user_ip_logs_risk_seen_at
  on public.user_ip_logs (risk_level, seen_at desc);
