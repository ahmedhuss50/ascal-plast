-- =============================================================
-- Ascal Plast — Smart Operations System
-- Initial schema, RLS policies, reporting views, triggers
-- Run in Supabase → SQL Editor (or via the Supabase CLI).
-- =============================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type user_role as enum ('owner','manager','order_desk','production','rep');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum ('draft','confirmed','in_production','ready','delivered','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_source as enum ('whatsapp','rep','manual');
exception when duplicate_object then null; end $$;

do $$ begin
  create type stock_direction as enum ('out','return');
exception when duplicate_object then null; end $$;

-- ---------- Profiles (extends auth.users) ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  role        user_role not null default 'rep',
  area        text,
  monthly_target numeric(12,2),
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Helper: current user's role (SECURITY DEFINER to avoid RLS recursion)
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('owner','manager','order_desk','production')
                   from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_manager()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('owner','manager')
                   from public.profiles where id = auth.uid()), false);
$$;

-- Auto-create a profile row when a new auth user is created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.raw_user_meta_data->>'phone')
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Customers ----------
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text,
  address     text,
  area        text,
  lat         double precision,
  lng         double precision,
  price_tier  text default 'standard',
  created_at  timestamptz not null default now()
);

-- ---------- Products ----------
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  sku         text unique,
  name_ar     text not null,
  name_en     text not null,
  unit        text not null default 'pcs',
  price       numeric(12,2) not null default 0,
  photo_url   text,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Raw materials ----------
create table if not exists public.raw_materials (
  id            uuid primary key default gen_random_uuid(),
  name_ar       text not null,
  name_en       text not null,
  unit          text not null default 'kg',
  stock_qty     numeric(14,3) not null default 0,   -- kept in sync with SMACC later
  reorder_level numeric(14,3) not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------- Bill of materials (Product -> Raw materials) ----------
create table if not exists public.bom (
  id              uuid primary key default gen_random_uuid(),
  product_id      uuid not null references public.products(id) on delete cascade,
  raw_material_id uuid not null references public.raw_materials(id) on delete restrict,
  qty_per_unit    numeric(14,4) not null default 0,
  unique (product_id, raw_material_id)
);

-- ---------- Visits ----------
create table if not exists public.visits (
  id           uuid primary key default gen_random_uuid(),
  rep_id       uuid not null references public.profiles(id) on delete cascade,
  customer_id  uuid not null references public.customers(id) on delete cascade,
  visited_at   timestamptz not null default now(),
  lat          double precision,
  lng          double precision,
  outcome      text,          -- e.g. order / no_order / follow_up
  notes        text
);
create index if not exists idx_visits_rep on public.visits(rep_id);
create index if not exists idx_visits_customer on public.visits(customer_id);
create index if not exists idx_visits_time on public.visits(visited_at);

-- ---------- Rep stock movements ----------
create table if not exists public.rep_stock_movements (
  id          uuid primary key default gen_random_uuid(),
  rep_id      uuid not null references public.profiles(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete restrict,
  qty         numeric(14,3) not null,
  direction   stock_direction not null default 'out',
  moved_at    timestamptz not null default now(),
  notes       text
);
create index if not exists idx_repstock_rep on public.rep_stock_movements(rep_id);

-- ---------- Orders ----------
create table if not exists public.orders (
  id            uuid primary key default gen_random_uuid(),
  customer_id   uuid not null references public.customers(id) on delete restrict,
  rep_id        uuid references public.profiles(id) on delete set null,
  source        order_source not null default 'manual',
  status        order_status not null default 'draft',
  notes         text,
  total         numeric(14,2) not null default 0,
  created_by    uuid references public.profiles(id) on delete set null,
  confirmed_by  uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_time on public.orders(created_at);

-- ---------- Order items ----------
create table if not exists public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete restrict,
  qty         numeric(14,3) not null default 1,
  unit_price  numeric(12,2) not null default 0
);
create index if not exists idx_orderitems_order on public.order_items(order_id);

-- ---------- Production jobs ----------
create table if not exists public.production_jobs (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders(id) on delete cascade,
  status       order_status not null default 'in_production',
  planned_date date,
  produced_qty numeric(14,3) not null default 0,
  created_at   timestamptz not null default now()
);

-- ---------- WhatsApp inbox (populated later by the AI intake worker) ----------
create table if not exists public.whatsapp_messages (
  id             uuid primary key default gen_random_uuid(),
  from_phone     text,
  raw_text       text,
  media_url      text,
  parsed_json    jsonb,
  linked_order_id uuid references public.orders(id) on delete set null,
  status         text not null default 'received',  -- received / parsed / linked / ignored
  created_at     timestamptz not null default now()
);

-- =============================================================
-- Reporting views
-- =============================================================

-- Per-rep monthly summary
create or replace view public.v_rep_monthly_summary as
select
  p.id as rep_id,
  p.full_name as rep_name,
  date_trunc('month', coalesce(v.visited_at, now()))::date as month,
  count(distinct v.id) as visits,
  count(distinct v.customer_id) as customers_visited
from public.profiles p
left join public.visits v on v.rep_id = p.id
where p.role = 'rep'
group by p.id, p.full_name, date_trunc('month', coalesce(v.visited_at, now()));

-- Orders pipeline counts
create or replace view public.v_orders_pipeline as
select status, count(*) as orders, coalesce(sum(total),0) as total_value
from public.orders
group by status;

-- Low stock raw materials
create or replace view public.v_low_stock as
select id, name_ar, name_en, unit, stock_qty, reorder_level
from public.raw_materials
where stock_qty <= reorder_level;

-- =============================================================
-- Row Level Security
-- =============================================================
alter table public.profiles            enable row level security;
alter table public.customers           enable row level security;
alter table public.products            enable row level security;
alter table public.raw_materials       enable row level security;
alter table public.bom                 enable row level security;
alter table public.visits              enable row level security;
alter table public.rep_stock_movements enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.production_jobs     enable row level security;
alter table public.whatsapp_messages   enable row level security;

-- Profiles: everyone can read; you can update yourself; managers manage all
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (true);
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists profiles_manager_all on public.profiles;
create policy profiles_manager_all on public.profiles for all to authenticated
  using (public.is_manager()) with check (public.is_manager());

-- Reference data (customers, products, raw_materials, bom): all authenticated read; staff write
do $$
declare t text;
begin
  foreach t in array array['customers','products','raw_materials','bom'] loop
    execute format('drop policy if exists %I_read on public.%I;', t, t);
    execute format('create policy %I_read on public.%I for select to authenticated using (true);', t, t);
    execute format('drop policy if exists %I_write on public.%I;', t, t);
    execute format('create policy %I_write on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff());', t, t);
  end loop;
end $$;

-- Visits: reps manage their own; staff see/manage all
drop policy if exists visits_read on public.visits;
create policy visits_read on public.visits for select to authenticated
  using (public.is_staff() or rep_id = auth.uid());
drop policy if exists visits_rep_write on public.visits;
create policy visits_rep_write on public.visits for all to authenticated
  using (public.is_staff() or rep_id = auth.uid())
  with check (public.is_staff() or rep_id = auth.uid());

-- Rep stock: same pattern
drop policy if exists repstock_read on public.rep_stock_movements;
create policy repstock_read on public.rep_stock_movements for select to authenticated
  using (public.is_staff() or rep_id = auth.uid());
drop policy if exists repstock_write on public.rep_stock_movements;
create policy repstock_write on public.rep_stock_movements for all to authenticated
  using (public.is_staff() or rep_id = auth.uid())
  with check (public.is_staff() or rep_id = auth.uid());

-- Orders: reps see their own + create; staff manage all
drop policy if exists orders_read on public.orders;
create policy orders_read on public.orders for select to authenticated
  using (public.is_staff() or rep_id = auth.uid());
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders for insert to authenticated
  with check (public.is_staff() or rep_id = auth.uid());
drop policy if exists orders_update on public.orders;
create policy orders_update on public.orders for update to authenticated
  using (public.is_staff() or rep_id = auth.uid())
  with check (public.is_staff() or rep_id = auth.uid());
drop policy if exists orders_delete on public.orders;
create policy orders_delete on public.orders for delete to authenticated
  using (public.is_manager());

-- Order items: readable/writable if the parent order is
drop policy if exists orderitems_read on public.order_items;
create policy orderitems_read on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (public.is_staff() or o.rep_id = auth.uid())));
drop policy if exists orderitems_write on public.order_items;
create policy orderitems_write on public.order_items for all to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id
                 and (public.is_staff() or o.rep_id = auth.uid())))
  with check (exists (select 1 from public.orders o where o.id = order_id
                 and (public.is_staff() or o.rep_id = auth.uid())));

-- Production jobs: staff only
drop policy if exists production_all on public.production_jobs;
create policy production_all on public.production_jobs for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

-- WhatsApp messages: staff only
drop policy if exists whatsapp_all on public.whatsapp_messages;
create policy whatsapp_all on public.whatsapp_messages for all to authenticated
  using (public.is_staff()) with check (public.is_staff());
