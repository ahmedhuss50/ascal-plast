import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import QuickAddForm from "@/components/QuickAddForm";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Product[];
  const nameCol = params.locale === "ar" ? "name_ar" : "name_en";

  return (
    <>
      <PageHeader title={d.nav.products} />
      <QuickAddForm
        table="products"
        dict={d}
        addLabel={d.nav.products}
        fields={[
          { name: "sku", label: d.fields.sku, dir: "ltr" },
          { name: "name_ar", label: d.fields.nameAr, required: true, dir: "rtl" },
          { name: "name_en", label: d.fields.nameEn, required: true, dir: "ltr" },
          { name: "unit", label: d.fields.unit },
          { name: "price", label: d.fields.price, type: "number", step: "0.01" },
        ]}
      />
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={d.misc.empty} /></div>
      ) : (
        <Table head={[d.fields.sku, d.fields.name, d.fields.unit, d.fields.price]}>
          {rows.map((p) => (
            <tr key={p.id}>
              <td className="td" dir="ltr">{p.sku ?? "—"}</td>
              <td className="td font-medium">{(p as any)[nameCol]}</td>
              <td className="td">{p.unit}</td>
              <td className="td">{formatMoney(p.price, params.locale)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
