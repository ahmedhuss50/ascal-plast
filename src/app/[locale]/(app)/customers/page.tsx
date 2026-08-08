import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import QuickAddForm from "@/components/QuickAddForm";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Customer[];

  return (
    <>
      <PageHeader title={d.nav.customers} />
      <QuickAddForm
        table="customers"
        dict={d}
        addLabel={d.nav.customers}
        fields={[
          { name: "name", label: d.fields.name, required: true },
          { name: "phone", label: d.fields.phone, dir: "ltr" },
          { name: "area", label: d.fields.area },
          { name: "address", label: d.fields.address },
          { name: "price_tier", label: d.fields.priceTier },
        ]}
      />
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={d.misc.empty} /></div>
      ) : (
        <Table head={[d.fields.name, d.fields.phone, d.fields.area, d.fields.priceTier]}>
          {rows.map((c) => (
            <tr key={c.id}>
              <td className="td font-medium">{c.name}</td>
              <td className="td" dir="ltr">{c.phone ?? "—"}</td>
              <td className="td">{c.area ?? "—"}</td>
              <td className="td">{c.price_tier ?? "—"}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
