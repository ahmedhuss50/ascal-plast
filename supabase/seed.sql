-- =============================================================
-- Ascal Plast — sample seed data (optional)
-- Run AFTER 0001_init.sql. Safe to skip in production.
-- =============================================================

-- Products (plastic goods)
insert into public.products (sku, name_ar, name_en, unit, price) values
  ('TC-60',  'حاوية قمامة 60 لتر', 'Trash Can 60L', 'pcs', 12.50),
  ('TC-120', 'حاوية قمامة 120 لتر', 'Trash Can 120L', 'pcs', 22.00),
  ('BKT-15', 'دلو بلاستيك 15 لتر', 'Bucket 15L', 'pcs', 4.75),
  ('CRT-A',  'صندوق تخزين', 'Storage Crate', 'pcs', 8.20),
  ('CHR-STD','كرسي بلاستيك', 'Plastic Chair', 'pcs', 9.90)
on conflict (sku) do nothing;

-- Raw materials
insert into public.raw_materials (name_ar, name_en, unit, stock_qty, reorder_level) values
  ('حبيبات بولي إيثيلين HDPE', 'HDPE Pellets', 'kg', 4200, 1000),
  ('حبيبات بولي بروبيلين PP', 'PP Pellets', 'kg', 2600, 800),
  ('صبغة سوداء', 'Black Masterbatch', 'kg', 180, 100),
  ('صبغة زرقاء', 'Blue Masterbatch', 'kg', 90, 100)
on conflict do nothing;

-- Customers
insert into public.customers (name, phone, area, price_tier) values
  ('سوبر ماركت النور', '+96550010001', 'حولي', 'standard'),
  ('مؤسسة الخليج للتنظيف', '+96550010002', 'الفروانية', 'wholesale'),
  ('بلدية المنطقة', '+96550010003', 'العاصمة', 'gov'),
  ('متجر البيت الحديث', '+96550010004', 'الأحمدي', 'standard')
on conflict do nothing;

-- NOTE: Users are created through Supabase Auth (Authentication → Users),
-- which automatically creates a matching row in public.profiles.
-- After creating a user, set their role, e.g.:
--   update public.profiles set role = 'owner', full_name = 'Ahmed'
--   where id = (select id from auth.users where email = 'you@example.com');
