import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatusBadge } from "@/components/ui";
import { formatMoney, formatNumber } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ReportsPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();

  const [reps, pipeline, low] = await Promise.all([
    supabase.from("v_rep_monthly_summary").select("*").order("month", { ascending: false }).limit(100),
    supabase.from("v_orders_pipeline").select("*"),
    supabase.from("v_low_stock").select("*"),
  ]);

  const repRows = (reps.data ?? []) as any[];
  const pipeRows = (pipeline.data ?? []) as { status: OrderStatus; orders: number; total_value: number }[];
  const lowRows = (low.data ?? []) as any[];
  const nameCol = params.locale === "ar" ? "name_ar" : "name_en";

  return (
    <>
      <PageHeader title={d.nav.reports} />

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          {params.locale === "ar" ? "ملخص المندوبين الشهري" : "Rep Monthly Summary"}
        </h2>
        {repRows.length === 0 ? (
          <div className="card"><EmptyState text={d.dashboard.none} /></div>
        ) : (
          <Table head={[d.fields.rep, d.fields.date, d.nav.visits, d.dashboard.customers]}>
            {repRows.map((r, i) => (
              <tr key={i}>
                <td className="td font-medium">{r.rep_name}</td>
                <td className="td text-slate-500">{r.month}</td>
                <td className="td">{formatNumber(r.visits, params.locale)}</td>
                <td className="td">{formatNumber(r.customers_visited, params.locale)}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{d.dashboard.pipeline}</h2>
        {pipeRows.length === 0 ? (
          <div className="card"><EmptyState text={d.dashboard.none} /></div>
        ) : (
          <Table head={[d.fields.status, d.nav.orders, d.fields.total]}>
            {pipeRows.map((p) => (
              <tr key={p.status}>
                <td className="td"><StatusBadge status={p.status} label={d.orderStatus[p.status]} /></td>
                <td className="td">{formatNumber(p.orders, params.locale)}</td>
                <td className="td">{formatMoney(p.total_value, params.locale)}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-slate-800 mb-3">{d.dashboard.lowStock}</h2>
        {lowRows.length === 0 ? (
          <div className="card"><EmptyState text={params.locale === "ar" ? "لا توجد مواد منخفضة" : "No low-stock items"} /></div>
        ) : (
          <Table head={[d.fields.name, d.fields.unit, d.fields.stockQty, d.fields.reorderLevel]}>
            {lowRows.map((m) => (
              <tr key={m.id} className="bg-rose-50">
                <td className="td font-medium">{m[nameCol]}</td>
                <td className="td">{m.unit}</td>
                <td className="td font-semibold text-brand-accent">{formatNumber(m.stock_qty, params.locale)}</td>
                <td className="td text-slate-500">{formatNumber(m.reorder_level, params.locale)}</td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </>
  );
}
