# Ascal Plast — Smart Operations System

Bilingual (Arabic-first, RTL + English) operations, sales-force, and production system
for Ascal Plast. Built with **Next.js 14 (App Router) + TypeScript + Tailwind CSS**,
backed by **Supabase** (Postgres + Auth), and designed to deploy on **Vercel**.

> SMACC accounting integration is intentionally deferred (see “Later” below). The
> `raw_materials.stock_qty` column and a `whatsapp_messages` table are already in place
> so that layer can be added without a schema change.

## What's included

- **Auth** via Supabase (email + password), role-aware navigation and row-level security.
- **Roles:** owner, manager, order_desk, production, rep.
- **Modules:** Dashboard, Orders (+ order builder), Production board, Visits, Customers,
  Products, Raw materials, Reps (role management), Reports.
- **Bilingual UI:** Arabic (default, RTL) and English (LTR) at `/ar/...` and `/en/...`,
  switchable from the top bar.
- **Database:** full schema, RLS policies, reporting views, and optional seed data in `supabase/`.

---

## 1. Set up the database (Supabase)

1. Open your Supabase project → **SQL Editor**.
2. Run the contents of **`supabase/migrations/0001_init.sql`** (creates tables, roles,
   RLS policies, triggers, and reporting views).
3. *(Optional)* Run **`supabase/seed.sql`** for sample products, materials, and customers.
4. Create your first user: **Authentication → Users → Add user** (email + password).
   A matching row is auto-created in `public.profiles`.
5. Make that user an owner — in the SQL Editor:

   ```sql
   update public.profiles
   set role = 'owner', full_name = 'Ahmed'
   where id = (select id from auth.users where email = 'you@example.com');
   ```

6. From **Project Settings → API**, copy the **Project URL** and the **anon public** key.

## 2. Run locally (optional)

```bash
cp .env.example .env.local     # then paste your Supabase URL + anon key
npm install
npm run dev                     # http://localhost:3000  → redirects to /ar/dashboard
```

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Ascal Plast — initial system"
git branch -M main
git remote add origin https://github.com/<your-username>/ascal-plast.git
git push -u origin main
```

(Create the empty `ascal-plast` repo on GitHub first, without a README.)

## 4. Deploy on Vercel

1. Go to **vercel.com → Add New → Project** and import the `ascal-plast` GitHub repo.
2. Framework preset is auto-detected as **Next.js** — no build settings to change.
3. Under **Environment Variables**, add both (same values as `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**. Every future `git push` to `main` redeploys automatically.
5. In Supabase → **Authentication → URL Configuration**, add your Vercel domain to the
   allowed redirect/site URLs.

---

## Project structure

```
supabase/
  migrations/0001_init.sql   # schema + RLS + views + triggers
  seed.sql                   # optional sample data
src/
  app/[locale]/              # ar + en routes
    login/                   # sign-in
    (app)/                   # authenticated shell (sidebar + topbar)
      dashboard, orders, orders/new, production,
      visits, customers, products, raw-materials, reps, reports
  components/                # Sidebar, Topbar, UI primitives, QuickAddForm
  i18n/                      # locale config + AR/EN dictionaries
  lib/                       # supabase clients, auth, types, formatting
middleware.ts                # session refresh + auth redirects + locale root
```

## Roles & access (enforced by RLS)

| Role        | Can do |
|-------------|--------|
| owner       | Everything, including analytics and user roles |
| manager     | Manage reps, reference data, orders, reports |
| order_desk  | Create/manage orders, reference data |
| production  | Production board, products, raw materials |
| rep         | Own visits, own stock, own orders, customers |

## Later (not in this build)

- **SMACC sync** — swap-in adapter for raw-material stock (in) and orders/invoices (out).
  Start with scheduled CSV/Excel import-export; move to a SMACC-managed connector if available.
- **WhatsApp AI intake** — a webhook writes to `whatsapp_messages`; an AI worker drafts a
  structured order for the order desk to confirm.
- **GPS routes, demand forecasting, commissions** — Phase 4 enhancements.
