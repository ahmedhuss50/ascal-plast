import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { notFound } from "next/navigation";
import QuickAddForm from "@/components/QuickAddForm";
import EditCustomerForm from "./EditCustomerForm";
import LocationsList, { type Loc } from "./LocationsList";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { locale: Locale; id: string } }) {
  const d = getDictionary(params.locale);
  const ar = params.locale === "ar";
  const supabase = createClient();

  const [{ data }, { data: locs }] = await Promise.all([
    supabase.from("customers").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("customer_locations").select("*").eq("customer_id", params.id).order("created_at"),
  ]);
  if (!data) notFound();
  const customer = data as Customer & { contact_person?: string; email?: string; notes?: string; maps_url?: string };
  const locations = (locs ?? []) as Loc[];

  const t = ar
    ? { branches: "الفروع والمواقع", addBranch: "إضافة فرع", label: "اسم الفرع", area: "المنطقة", phone: "الهاتف", address: "العنوان", maps: "رابط الموقع (خرائط جوجل)", contact: "المسؤول" }
    : { branches: "Branches & locations", addBranch: "Add branch", label: "Branch name", area: "Area", phone: "Phone", address: "Address", maps: "Location link (Google Maps)", contact: "Contact" };

  return (
    <>
      <PageHeader
        title={`${ar ? "العميل" : "Customer"} — ${customer.name}`}
        subtitle={ar ? "تعديل بيانات المتجر والفروع" : "Edit store details and branches"}
        action={
          <Link href={`/${params.locale}/customers/${params.id}/kyc`} className="btn-primary">
            {ar ? "نموذج فتح الحساب (KYC)" : "Account form (KYC)"}
          </Link>
        }
      />

      <EditCustomerForm locale={params.locale} dict={d} customer={customer} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">{t.branches}</h2>
        <p className="text-sm text-slate-500 mb-4">
          {ar ? "أضف فروع/مواقع متعددة لهذا العميل، لكل منها عنوان وموقع خاص" : "Add multiple branches/locations for this client, each with its own address and map"}
        </p>
        <QuickAddForm
          table="customer_locations"
          dict={d}
          addLabel={t.addBranch}
          inject={{ customer_id: params.id }}
          fields={[
            { name: "label", label: t.label, required: true },
            { name: "area", label: t.area },
            { name: "phone", label: t.phone, dir: "ltr" },
            { name: "address", label: t.address },
            { name: "contact_person", label: t.contact },
            { name: "maps_url", label: t.maps, dir: "ltr" },
          ]}
        />
        <LocationsList locale={params.locale} initial={locations} />
      </section>
    </>
  );
}
