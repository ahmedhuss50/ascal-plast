import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import QuickAddForm from "@/components/QuickAddForm";
import { formatNumber } from "@/lib/format";
import type { RawMaterial } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RawMaterialsPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const { data } = await supabase.from("raw_materials").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as RawMaterial[];
  const nameCol = params.locale === "ar" ? "name_ar" : "name_en";

  return (
    <>
      <PageHeader title={d.nav.rawMaterials} subtitle={params.locale === "ar" ? "الكميات ستتم مزامنتها مع سماك لاحقاً" : "Quantities will sync with SMACC later"} />
      <QuickAddForm
        table="raw_materials"
        dict={d}
        addLabel={d.nav.rawMaterials}
        fields={[
          { name: "name_ar", label: d.fields.nameAr, required: true, dir: "rtl" },
          { name: "name_en", label: d.fields.nameEn, required: true, dir: "ltr" },
          { name: "unit", label: d.fields.unit },
          { name: "stock_qty", label: d.fields.stockQty, type: "number", step: "0.001" },
          { name: "reorder_level", label: d.fields.reorderLevel, type: "number", step: "0.001" },
        ]}
      />
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={d.misc.empty} /></div>
      ) : (
        <Table head={[d.fields.name, d.fields.unit, d.fields.stockQty, d.fields.reorderLevel]}>
          {rows.map((m) => {
            const low = Number(m.stock_qty) <= Number(m.reorder_level);
            return (
              <tr key={m.id} className={low ? "bg-rose-50" : ""}>
                <td className="td font-medium">{(m as any)[nameCol]}</td>
                <td className="td">{m.unit}</td>
                <td className={`td font-semibold ${low ? "text-brand-accent" : ""}`}>{formatNumber(m.stock_qty, params.locale)}</td>
                <td className="td text-slate-500">{formatNumber(m.reorder_level, params.locale)}</td>
              </tr>
            );
          })}
        </Table>
      )}
    </>
  );
}
