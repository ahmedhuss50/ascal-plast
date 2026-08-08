import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import QuickAddForm from "@/components/QuickAddForm";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function VisitsPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const profile = await getProfile();

  const [{ data: customers }, { data: visits }] = await Promise.all([
    supabase.from("customers").select("id,name").order("name"),
    supabase
      .from("visits")
      .select("id,visited_at,outcome,notes,customers(name),profiles(full_name)")
      .order("visited_at", { ascending: false })
      .limit(200),
  ]);

  const customerOptions = (customers ?? []).map((c: any) => ({ value: c.id, label: c.name }));
  const outcomeOptions = [
    { value: "order", label: params.locale === "ar" ? "طلب" : "Order" },
    { value: "no_order", label: params.locale === "ar" ? "بدون طلب" : "No order" },
    { value: "follow_up", label: params.locale === "ar" ? "متابعة" : "Follow-up" },
  ];
  const rows = (visits ?? []) as any[];

  return (
    <>
      <PageHeader title={d.nav.visits} />
      <QuickAddForm
        table="visits"
        dict={d}
        addLabel={d.nav.visits}
        inject={{ rep_id: profile?.id }}
        fields={[
          { name: "customer_id", label: d.fields.customer, type: "select", required: true, options: customerOptions },
          { name: "outcome", label: d.fields.outcome, type: "select", options: outcomeOptions },
          { name: "notes", label: d.fields.notes },
        ]}
      />
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={d.misc.empty} /></div>
      ) : (
        <Table head={[d.fields.date, d.fields.customer, d.fields.rep, d.fields.outcome, d.fields.notes]}>
          {rows.map((v) => (
            <tr key={v.id}>
              <td className="td text-slate-500">{formatDate(v.visited_at, params.locale)}</td>
              <td className="td font-medium">{v.customers?.name ?? "—"}</td>
              <td className="td">{v.profiles?.full_name ?? "—"}</td>
              <td className="td">{v.outcome ?? "—"}</td>
              <td className="td text-slate-500">{v.notes ?? "—"}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
