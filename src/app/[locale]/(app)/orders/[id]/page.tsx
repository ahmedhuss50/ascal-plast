import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { notFound } from "next/navigation";
import EditOrderForm from "./EditOrderForm";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({ params }: { params: { locale: Locale; id: string } }) {
  const d = getDictionary(params.locale);
  const ar = params.locale === "ar";
  const supabase = createClient();

  const [{ data: order }, { data: items }, { data: customers }, { data: reps }, { data: products }] =
    await Promise.all([
      supabase
        .from("orders")
        .select("*, customers(name), rep:profiles!orders_rep_id_fkey(full_name,phone,area)")
        .eq("id", params.id)
        .maybeSingle(),
      supabase.from("order_items").select("id,product_id,qty,unit_price").eq("order_id", params.id),
      supabase.from("customers").select("id,name").order("name"),
      supabase.from("profiles").select("id,full_name,role,phone,area").order("full_name"),
      supabase.from("products").select("id,name_ar,name_en,price").eq("active", true).order("name_en"),
    ]);

  if (!order) notFound();

  const nameCol = ar ? "name_ar" : "name_en";
  const productOptions = (products ?? []).map((p: any) => ({ id: p.id, name: p[nameCol], price: Number(p.price) }));
  const customerOptions = (customers ?? []).map((c: any) => ({ value: c.id, label: c.name }));
  const repOptions = (reps ?? []).map((r: any) => ({
    value: r.id,
    label: `${r.full_name || "—"}${r.role === "rep" ? "" : ` (${d.roles[r.role as keyof typeof d.roles] ?? r.role})`}`,
  }));
  const initialItems = (items ?? []).map((i: any) => ({
    product_id: i.product_id,
    qty: Number(i.qty),
    unit_price: Number(i.unit_price),
  }));

  const rep = (order as any).rep;

  return (
    <>
      <PageHeader
        title={`${ar ? "طلب" : "Order"} — ${(order as any).customers?.name ?? ""}`}
        subtitle={ar ? "تعديل الطلب وتعيين المندوب" : "Edit the order and assign the rep"}
      />

      {/* Rep info card */}
      <div className="card p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 mb-3">{ar ? "معلومات المندوب" : "Rep info"}</h2>
        {rep ? (
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] text-slate-500">{d.fields.name}</div>
              <div className="font-semibold text-slate-800">{rep.full_name || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">{d.fields.phone}</div>
              <div className="font-semibold text-slate-800" dir="ltr">{rep.phone || "—"}</div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">{d.fields.area}</div>
              <div className="font-semibold text-slate-800">{rep.area || "—"}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-400">{ar ? "لم يتم تعيين مندوب لهذا الطلب" : "No rep assigned to this order"}</p>
        )}
      </div>

      <EditOrderForm
        locale={params.locale}
        dict={d}
        order={{
          id: (order as any).id,
          customer_id: (order as any).customer_id,
          rep_id: (order as any).rep_id,
          source: (order as any).source,
          status: (order as any).status,
          notes: (order as any).notes,
        }}
        initialItems={initialItems}
        customers={customerOptions}
        reps={repOptions}
        products={productOptions}
      />
    </>
  );
}
