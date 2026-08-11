-- =============================================================
-- Ascal Plast — WhatsApp production assistant (sample)
-- Structured reports extracted from group messages.
-- Run AFTER 0002_production.sql in Supabase → SQL Editor.
-- =============================================================

create table if not exists public.whatsapp_reports (
  id          uuid primary key default gen_random_uuid(),
  group_name  text,
  sender      text,
  raw_text    text not null,
  order_no    text,
  line_no     text,
  product     text,
  quantity    numeric,
  unit        text,
  scrap_pct   numeric,
  status      text,           -- مكتمل / قيد التنفيذ / متوقف
  issue       text,
  confidence  numeric,
  created_at  timestamptz not null default now()
);
create index if not exists idx_wa_reports_time on public.whatsapp_reports(created_at desc);

alter table public.whatsapp_reports enable row level security;

drop policy if exists wa_reports_all on public.whatsapp_reports;
create policy wa_reports_all on public.whatsapp_reports for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
