-- =============================================================
-- Ascal Plast — Production module (from Ascal's Excel systems)
-- Adds: machines, molds, workers, downtime_reasons, product_molds,
--       production_log  + enriches products / raw_materials / bom
-- Run AFTER 0001_init.sql, in Supabase → SQL Editor.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Machines ----------
create table if not exists public.machines (
  code             text primary key,          -- machine number e.g. '780'
  name             text not null,
  type             text,
  capacity_per_day numeric,
  hourly_cost      numeric,
  status           text default 'تعمل',
  created_at       timestamptz not null default now()
);

-- ---------- Molds ----------
create table if not exists public.molds (
  code                 text primary key,       -- mold identifier / name
  name                 text,
  cavities             int,
  cycle_time_s         numeric,
  machine_code         text references public.machines(code) on delete set null,
  daily_capacity       numeric,
  monthly_depreciation numeric,
  status               text default 'جاهز',
  created_at           timestamptz not null default now()
);

-- ---------- Workers (production staff, distinct from sales reps) ----------
create table if not exists public.workers (
  code        text primary key,                -- 'W-001'
  name        text not null,
  department  text,
  shift       text,
  hourly_wage numeric,
  status      text default 'نشط',
  created_at  timestamptz not null default now()
);

-- ---------- Downtime reasons ----------
create table if not exists public.downtime_reasons (
  code       text primary key,                 -- 'S-001'
  reason     text not null,
  category   text,
  created_at timestamptz not null default now()
);

-- ---------- Enrich products (item master, SMACC codes in sku) ----------
alter table public.products add column if not exists unit_weight_g numeric;
alter table public.products add column if not exists pack_qty      numeric;
alter table public.products add column if not exists family        text;
alter table public.products add column if not exists default_color text;

-- ---------- Enrich raw_materials with a code + type ----------
alter table public.raw_materials add column if not exists material_code text;
alter table public.raw_materials add column if not exists type          text;
create unique index if not exists uq_raw_materials_code
  on public.raw_materials(material_code) where material_code is not null;

-- ---------- Product ↔ Mold (capacity) ----------
create table if not exists public.product_molds (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid references public.products(id) on delete cascade,
  mold_code       text references public.molds(code) on delete cascade,
  role            text,                          -- رئيسي / بديل / احتياطي
  pieces_per_unit numeric default 1,
  daily_capacity  numeric
);
create index if not exists idx_product_molds_product on public.product_molds(product_id);

-- ---------- Enrich BOM with weight-percent (their formula) ----------
alter table public.bom add column if not exists percent_of_weight numeric;

-- ---------- Daily production log (core of the production DB) ----------
create table if not exists public.production_log (
  id                   uuid primary key default gen_random_uuid(),
  log_date             date not null,
  shift                text,                    -- نهار / ليل / إضافي
  order_id             uuid references public.orders(id) on delete set null,
  machine_code         text references public.machines(code) on delete set null,
  mold_code            text references public.molds(code) on delete set null,
  worker_code          text references public.workers(code) on delete set null,
  product_id           uuid references public.products(id) on delete set null,
  planned_qty          numeric,
  actual_qty           numeric,
  scrap_pieces         numeric default 0,
  scrap_kg             numeric default 0,
  downtime_hours       numeric default 0,
  downtime_reason_code text references public.downtime_reasons(code) on delete set null,
  day_type             text,
  wage_factor          numeric default 1,
  notes                text,
  created_at           timestamptz not null default now()
);
create index if not exists idx_prodlog_date    on public.production_log(log_date);
create index if not exists idx_prodlog_machine on public.production_log(machine_code);

-- =============================================================
-- Reporting views (mirror their daily / monthly control boards)
-- =============================================================
create or replace view public.v_production_daily as
select
  log_date,
  coalesce(sum(planned_qty),0) as planned,
  coalesce(sum(actual_qty),0)  as actual,
  case when sum(planned_qty) > 0
       then round(100 * sum(actual_qty) / sum(planned_qty), 1) end as achievement_pct,
  coalesce(sum(scrap_pieces),0)   as scrap_pieces,
  coalesce(sum(scrap_kg),0)       as scrap_kg,
  coalesce(sum(downtime_hours),0) as downtime_hours
from public.production_log
group by log_date;

create or replace view public.v_production_monthly as
select
  to_char(log_date,'YYYY-MM') as month,
  coalesce(sum(planned_qty),0) as planned,
  coalesce(sum(actual_qty),0)  as actual,
  case when sum(planned_qty) > 0
       then round(100 * sum(actual_qty) / sum(planned_qty), 1) end as achievement_pct,
  coalesce(sum(scrap_pieces),0)   as scrap_pieces,
  coalesce(sum(scrap_kg),0)       as scrap_kg,
  coalesce(sum(downtime_hours),0) as downtime_hours
from public.production_log
group by to_char(log_date,'YYYY-MM');

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.machines         enable row level security;
alter table public.molds            enable row level security;
alter table public.workers          enable row level security;
alter table public.downtime_reasons enable row level security;
alter table public.product_molds    enable row level security;
alter table public.production_log   enable row level security;

do $$
declare t text;
begin
  foreach t in array array['machines','molds','workers','downtime_reasons','product_molds'] loop
    execute format('drop policy if exists %I_read on public.%I;', t, t);
    execute format('create policy %I_read on public.%I for select to authenticated using (true);', t, t);
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format('create policy %I_write on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff());', t, t);
  end loop;
end $$;

drop policy if exists prodlog_all on public.production_log;
create policy prodlog_all on public.production_log for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
