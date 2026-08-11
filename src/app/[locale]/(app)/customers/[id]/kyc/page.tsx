import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import { notFound } from "next/navigation";
import KycForm from "./KycForm";

export const dynamic = "force-dynamic";

export default async function KycPage({ params }: { params: { locale: Locale; id: string } }) {
  const ar = params.locale === "ar";
  const supabase = createClient();

  const [{ data: customer }, { data: kyc }] = await Promise.all([
    supabase.from("customers").select("id,name").eq("id", params.id).maybeSingle(),
    supabase.from("customer_kyc").select("*").eq("customer_id", params.id).maybeSingle(),
  ]);
  if (!customer) notFound();

  return (
    <>
      <PageHeader
        title={ar ? "نموذج فتح حساب عميل" : "Customer account-opening form"}
        subtitle={`${customer.name} — ${ar ? "اعرف عميلك (KYC)" : "KYC"}`}
        action={
          <Link href={`/${params.locale}/customers/${params.id}`} className="btn-ghost">
            {ar ? "بيانات العميل" : "Customer details"}
          </Link>
        }
      />
      <KycForm
        locale={params.locale}
        customerId={params.id}
        initial={((kyc as any)?.data as Record<string, any>) ?? {}}
        initialStatus={(kyc as any)?.status ?? "draft"}
      />
    </>
  );
}
