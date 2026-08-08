import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import NewOrderForm from "./NewOrderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const profile = await getProfile();

  const [{ data: customers }, { data: products }] = await Promise.all([
    supabase.from("customers").select("id,name").order("name"),
    supabase.from("products").select("id,name_ar,name_en,price").eq("active", true).order("name_en"),
  ]);

  const nameCol = params.locale === "ar" ? "name_ar" : "name_en";
  const productOptions = (products ?? []).map((p: any) => ({
    id: p.id,
    name: p[nameCol],
    price: Number(p.price),
  }));
  const customerOptions = (customers ?? []).map((c: any) => ({ value: c.id, label: c.name }));

  return (
    <>
      <PageHeader title={d.actions.newOrder} />
      <NewOrderForm
        locale={params.locale}
        dict={d}
        currentUserId={profile?.id ?? null}
        customers={customerOptions}
        products={productOptions}
      />
    </>
  );
}
