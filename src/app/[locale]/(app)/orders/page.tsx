import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState, StatusBadge } from "@/components/ui";
import { formatMoney, formatDate } from "@/lib/format";
import type { OrderStatus, OrderSource } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("id,source,status,total,created_at,customers(name)")
    .order("created_at", { ascending: false })
    .limit(200);
  const rows = (data ?? []) as any[];

  return (
    <>
      <PageHeader
        title={d.nav.orders}
        action={
          <Link href={`/${params.locale}/orders/new`} className="btn-primary">
            + {d.actions.newOrder}
          </Link>
        }
      />
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={d.misc.empty} /></div>
      ) : (
        <Table head={[d.fields.customer, d.fields.source, d.fields.status, d.fields.total, d.fields.date]}>
          {rows.map((o) => (
            <tr key={o.id}>
              <td className="td font-medium">{o.customers?.name ?? "—"}</td>
              <td className="td">{d.orderSource[o.source as OrderSource]}</td>
              <td className="td"><StatusBadge status={o.status as OrderStatus} label={d.orderStatus[o.status as OrderStatus]} /></td>
              <td className="td">{formatMoney(o.total, params.locale)}</td>
              <td className="td text-slate-500">{formatDate(o.created_at, params.locale)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
