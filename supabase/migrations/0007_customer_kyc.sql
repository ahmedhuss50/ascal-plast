-- =============================================================
-- Ascal Plast — electronic customer account-opening / KYC form
-- One record per client holding the full form as structured JSON.
-- Run in Supabase → SQL Editor (after earlier migrations).
-- =============================================================

create table if not exists public.customer_kyc (
  customer_id uuid primary key references public.customers(id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  status      text not null default 'draft',   -- draft / submitted / approved / rejected
  updated_at  timestamptz not null default now()
);

grant select, insert, update, delete on public.customer_kyc to anon, authenticated;
