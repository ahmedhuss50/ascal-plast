import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { notFound } from "next/navigation";
import EditCustomerForm from "./EditCustomerForm";
import type { Customer } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: { params: { locale: Locale; id: string } }) {
  const d = getDictionary(params.locale);
  const ar = params.locale === "ar";
  const supabase = createClient();
  const { data } = await supabase.from("customers").select("*").eq("id", params.id).maybeSingle();
  if (!data) notFound();
  const customer = data as Customer & { contact_person?: string; email?: string; notes?: string; maps_url?: string };

  return (
    <>
      <PageHeader title={`${ar ? "العميل" : "Customer"} — ${customer.name}`} subtitle={ar ? "تعديل بيانات المتجر" : "Edit store details"} />
      <EditCustomerForm locale={params.locale} dict={d} customer={customer} />
    </>
  );
}
