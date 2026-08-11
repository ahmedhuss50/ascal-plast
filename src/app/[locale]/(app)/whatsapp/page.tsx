import type { Locale } from "@/i18n/config";
import { PageHeader } from "@/components/ui";
import Assistant from "./Assistant";

export default function WhatsAppPage({ params }: { params: { locale: Locale } }) {
  const ar = params.locale === "ar";
  return (
    <>
      <PageHeader
        title={ar ? "مساعد الواتساب" : "WhatsApp Assistant"}
        subtitle={
          ar
            ? "مثال على شكل النظام أثناء التشغيل: المساعد يقرأ رسائل المجموعة ويحوّلها إلى متابعة إنتاج لحظية"
            : "Example of the system in production: the assistant reads the group and turns messages into a live production feed"
        }
      />
      <Assistant locale={params.locale} />
    </>
  );
}
