-- =============================================================
-- Ascal Plast — richer customer/store info
-- Run in Supabase → SQL Editor (after earlier migrations).
-- =============================================================

alter table public.customers add column if not exists contact_person text;
alter table public.customers add column if not exists email          text;
alter table public.customers add column if not exists notes          text;
alter table public.customers add column if not exists maps_url       text;  -- Google Maps / location link
