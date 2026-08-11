-- OPTIONAL sample production-log data so the dashboards show live numbers.
-- Uses real machines/workers/items you imported. Safe to delete later:
--   delete from public.production_log where notes = 'sample';
insert into public.production_log (log_date,shift,machine_code,worker_code,product_id,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,downtime_reason_code,day_type,wage_factor,notes)
select '2026-08-08','نهار','780','W-001',p.id,1335,1290,20,5.2,1.0,'S-001','عادي',1,'sample' from public.products p where p.sku='02800930';
insert into public.production_log (log_date,shift,machine_code,worker_code,product_id,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,downtime_reason_code,day_type,wage_factor,notes)
select '2026-08-08','ليل','610','W-002',p.id,900,850,12,2.6,0.5,'S-003','عادي',1,'sample' from public.products p where p.sku='02800901';
insert into public.production_log (log_date,shift,machine_code,worker_code,product_id,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,downtime_reason_code,day_type,wage_factor,notes)
select '2026-08-09','نهار','780','W-001',p.id,1335,1310,8,2.0,0.5,'S-002','عادي',1,'sample' from public.products p where p.sku='02800930';
insert into public.production_log (log_date,shift,machine_code,worker_code,product_id,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,downtime_reason_code,day_type,wage_factor,notes)
select '2026-08-09','نهار','610','W-003',p.id,1000,640,30,7.5,3.0,'S-003','عادي',1,'sample' from public.products p where p.sku='02800810';
insert into public.production_log (log_date,shift,machine_code,worker_code,product_id,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,downtime_reason_code,day_type,wage_factor,notes)
select '2026-08-09','ليل','780','W-004',p.id,1335,1180,25,6.3,1.5,'S-001','عادي',1,'sample' from public.products p where p.sku='02800930';
insert into public.production_log (log_date,shift,machine_code,worker_code,product_id,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,downtime_reason_code,day_type,wage_factor,notes)
select '2026-08-10','نهار','780','W-001',p.id,1335,1295,10,2.5,0.5,'S-002','عادي',1,'sample' from public.products p where p.sku='02800930';
insert into public.production_log (log_date,shift,machine_code,worker_code,product_id,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,downtime_reason_code,day_type,wage_factor,notes)
select '2026-08-10','نهار','400','W-005',p.id,1200,1150,18,4.0,1.0,'S-003','عادي',1,'sample' from public.products p where p.sku='02800901';
