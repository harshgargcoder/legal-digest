create extension if not exists pgcrypto;

create table if not exists public.user_ip_logs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  ip_address text not null,
  user_agent text,
  seen_at timestamptz not null default now()
);

create index if not exists idx_user_ip_logs_user_seen_at
  on public.user_ip_logs (user_id, seen_at desc);
