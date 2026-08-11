import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Table, EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/format";
import Assistant from "./Assistant";

export const dynamic = "force-dynamic";

export default async function WhatsAppPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const { data } = await supabase
    .from("whatsapp_reports")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);
  const rows = (data ?? []) as any[];

  const ar = params.locale === "ar";
  const feedTitle = ar ? "متابعة الإنتاج (من المجموعة)" : "Production feed (from the group)";
  const subtitle = ar
    ? "مساعد ذكي يقرأ رسائل مجموعة الواتساب ويحوّلها إلى بيانات منظّمة في اللوحة"
    : "An AI assistant reads the WhatsApp group and turns messages into structured dashboard data";
  const head = ar
    ? ["الوقت", "الطلب", "الخط", "المنتج", "الكمية", "الهالك", "الحالة", "مشكلة"]
    : ["Time", "Order", "Line", "Product", "Qty", "Scrap", "Status", "Issue"];

  return (
    <>
      <PageHeader title={ar ? "مساعد الواتساب" : "WhatsApp Assistant"} subtitle={subtitle} />

      <Assistant locale={params.locale} />

      <h2 className="text-lg font-semibold text-slate-800 mt-8 mb-3">{feedTitle}</h2>
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={ar ? "لا توجد تحديثات بعد — جرّب المساعد بالأعلى" : "No updates yet — try the assistant above"} /></div>
      ) : (
        <Table head={head}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="td text-slate-500 whitespace-nowrap">{formatDate(r.created_at, params.locale)}</td>
              <td className="td" dir="ltr">{r.order_no ?? "—"}</td>
              <td className="td">{r.line_no ?? "—"}</td>
              <td className="td font-medium">{r.product ?? "—"}</td>
              <td className="td">{r.quantity ? `${r.quantity} ${r.unit ?? ""}` : "—"}</td>
              <td className="td">{r.scrap_pct != null ? `${r.scrap_pct}%` : "—"}</td>
              <td className="td">{r.status ?? "—"}</td>
              <td className="td text-slate-500">{r.issue ?? "—"}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
