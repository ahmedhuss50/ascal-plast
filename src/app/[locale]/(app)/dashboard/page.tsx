import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard, Table, StatusBadge, EmptyState } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DashboardPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [ordersTotal, openOrders, customers, products, lowStock, visits, pipeline, recent] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("id", { count: "exact", head: true })
        .not("status", "in", "(delivered,cancelled)"),
      supabase.from("customers").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("v_low_stock").select("id", { count: "exact", head: true }),
      supabase.from("visits").select("id", { count: "exact", head: true })
        .gte("visited_at", monthStart.toISOString()),
      supabase.from("v_orders_pipeline").select("*"),
      supabase.from("orders")
        .select("id,status,total,created_at,customers(name)")
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  const pipelineRows = (pipeline.data ?? []) as { status: OrderStatus; orders: number; total_value: number }[];
  const recentRows = (recent.data ?? []) as any[];

  return (
    <>
      <PageHeader title={d.dashboard.title} subtitle={d.dashboard.subtitle} />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <StatCard label={d.dashboard.totalOrders} value={ordersTotal.count ?? 0} />
        <StatCard label={d.dashboard.openOrders} value={openOrders.count ?? 0} />
        <StatCard label={d.dashboard.visitsThisMonth} value={visits.count ?? 0} />
        <StatCard label={d.dashboard.customers} value={customers.count ?? 0} />
        <StatCard label={d.dashboard.products} value={products.count ?? 0} />
        <StatCard label={d.dashboard.lowStock} value={lowStock.count ?? 0} accent />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">{d.dashboard.pipeline}</h2>
          <div className="card p-4 space-y-2">
            {pipelineRows.length === 0 && <EmptyState text={d.dashboard.none} />}
            {pipelineRows.map((p) => (
              <div key={p.status} className="flex items-center justify-between py-1">
                <StatusBadge status={p.status} label={d.orderStatus[p.status]} />
                <div className="text-sm text-slate-600">
                  {p.orders} · {formatMoney(p.total_value, params.locale)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-slate-800 mb-3">{d.dashboard.recentOrders}</h2>
          {recentRows.length === 0 ? (
            <div className="card"><EmptyState text={d.dashboard.none} /></div>
          ) : (
            <Table head={[d.fields.customer, d.fields.status, d.fields.total, d.fields.date]}>
              {recentRows.map((o) => (
                <tr key={o.id}>
                  <td className="td font-medium">{o.customers?.name ?? "—"}</td>
                  <td className="td"><StatusBadge status={o.status} label={d.orderStatus[o.status as OrderStatus]} /></td>
                  <td className="td">{formatMoney(o.total, params.locale)}</td>
                  <td className="td text-slate-500">{formatDate(o.created_at, params.locale)}</td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
