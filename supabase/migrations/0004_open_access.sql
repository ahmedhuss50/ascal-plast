-- =============================================================
-- DEMO: OPEN ACCESS — no login required.
-- Disables Row Level Security so the app shows data without a
-- signed-in user, and grants the public (anon) role access.
--
-- ⚠ This makes all data publicly readable/writable via the anon key.
-- Fine for a demo. To lock it back down later, re-enable RLS:
--   alter table public.<name> enable row level security;
-- (the original policies from 0001–0003 are still defined).
-- =============================================================

do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I disable row level security;', r.tablename);
  end loop;
end $$;

grant usage on schema public to anon;
grant select, insert, update, delete on all tables in schema public to anon;
