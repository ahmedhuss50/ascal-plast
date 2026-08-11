-- =============================================================
-- Ascal Plast — multiple locations/branches per client
-- Run in Supabase → SQL Editor (after earlier migrations).
-- =============================================================

create table if not exists public.customer_locations (
  id             uuid primary key default gen_random_uuid(),
  customer_id    uuid not null references public.customers(id) on delete cascade,
  label          text,          -- اسم الفرع / الموقع
  area           text,
  address        text,
  maps_url       text,          -- Google Maps link
  phone          text,
  contact_person text,
  notes          text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_customer_locations on public.customer_locations(customer_id);

-- Open-mode access (matches the rest of the demo). Re-add RLS later to lock down.
grant select, insert, update, delete on public.customer_locations to anon, authenticated;
