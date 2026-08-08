import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import ProductionBoard from "./ProductionBoard";

export const dynamic = "force-dynamic";

export default async function ProductionPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const { data } = await supabase
    .from("orders")
    .select("id,status,total,created_at,customers(name)")
    .in("status", ["confirmed", "in_production", "ready"])
    .order("created_at", { ascending: true });

  const orders = (data ?? []).map((o: any) => ({
    id: o.id,
    status: o.status,
    total: Number(o.total),
    created_at: o.created_at,
    customer: o.customers?.name ?? "—",
  }));

  return (
    <>
      <PageHeader title={d.nav.production} subtitle={d.dashboard.pipeline} />
      <ProductionBoard locale={params.locale} dict={d} initial={orders} />
    </>
  );
}
