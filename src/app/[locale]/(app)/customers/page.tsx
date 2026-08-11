import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import QuickAddForm from "@/components/QuickAddForm";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const ar = params.locale === "ar";
  const supabase = createClient();
  const { data } = await supabase.from("customers").select("*").order("created_at", { ascending: false });
  const rows = (data ?? []) as Customer[];

  const f = ar
    ? { add: "عميل جديد", contact: "الشخص المسؤول", email: "البريد الإلكتروني", maps: "رابط الموقع (خرائط جوجل)", tier: "فئة السعر", edit: "تعديل" }
    : { add: "New customer", contact: "Contact person", email: "Email", maps: "Location link (Google Maps)", tier: "Price tier", edit: "Edit" };

  const tierOptions = [
    { value: "standard", label: ar ? "عادي" : "Standard" },
    { value: "wholesale", label: ar ? "جملة" : "Wholesale" },
    { value: "gov", label: ar ? "حكومي" : "Government" },
  ];

  return (
    <>
      <PageHeader title={d.nav.customers} />
      <QuickAddForm
        table="customers"
        dict={d}
        addLabel={f.add}
        fields={[
          { name: "name", label: d.fields.name, required: true },
          { name: "phone", label: d.fields.phone, dir: "ltr" },
          { name: "contact_person", label: f.contact },
          { name: "email", label: f.email, dir: "ltr" },
          { name: "area", label: d.fields.area },
          { name: "address", label: d.fields.address },
          { name: "maps_url", label: f.maps, dir: "ltr" },
          { name: "price_tier", label: f.tier, type: "select", options: tierOptions },
        ]}
      />
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={d.misc.empty} /></div>
      ) : (
        <Table head={[d.fields.name, d.fields.phone, d.fields.area, d.fields.priceTier, ""]}>
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-slate-50">
              <td className="td font-medium">{c.name}</td>
              <td className="td" dir="ltr">{c.phone ?? "—"}</td>
              <td className="td">{c.area ?? "—"}</td>
              <td className="td">{c.price_tier ?? "—"}</td>
              <td className="td">
                <Link href={`/${params.locale}/customers/${c.id}`} className="text-brand font-semibold hover:underline">
                  {f.edit}
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
