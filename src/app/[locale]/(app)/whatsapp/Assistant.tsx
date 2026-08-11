import { parseProductionMessage } from "@/lib/whatsapp-parse";
import type { Locale } from "@/i18n/config";
import { StatCard } from "@/components/ui";

// A realistic "in production" snapshot: a WhatsApp group stream on the left and
// the assistant's auto-extracted production feed + summary on the right.

const SAMPLE: { who: string; time: string; text: string }[] = [
  { who: "مختار", time: "٠٧:٤٥", text: "خط ٢ جاري على الطلب PO-4471، درام ٦٥" },
  { who: "فيصل", time: "٠٩:١٠", text: "خط 3 كرسي حديقة، 1200 قطعة، الهالك 2.5%" },
  { who: "سالم", time: "٠٩:٤٠", text: "الخط الأول واقف بسبب عطل في السخان، محتاجين صيانة" },
  { who: "مختار", time: "١١:٣٠", text: "خط ٢ أنهى الطلب PO-4471، ٥٢٠٠ عبوة، الهالك ٣٪" },
  { who: "سالم", time: "١٢:٠٥", text: "الخط الأول رجع قيد التشغيل بعد الصيانة" },
  { who: "فيصل", time: "١٣:٤٠", text: "نقص ماستر باتش أزرق على خط 3" },
];

const STATUS_STYLE: Record<string, string> = {
  "مكتمل": "bg-emerald-100 text-emerald-700",
  "قيد التنفيذ": "bg-amber-100 text-amber-700",
  "متوقف": "bg-rose-100 text-rose-700",
};

function Chip({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${tone ?? "bg-slate-100 text-slate-700"}`}>
      <span className="opacity-60">{label}</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
}

export default function Assistant({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const rows = SAMPLE.map((m) => ({ ...m, p: parseProductionMessage(m.text) }));

  const totalUnits = rows.reduce((s, r) => s + (r.p.quantity ?? 0), 0);
  const scraps = rows.map((r) => r.p.scrap_pct).filter((x): x is number => x != null);
  const avgScrap = scraps.length ? (scraps.reduce((a, b) => a + b, 0) / scraps.length).toFixed(1) : "0";
  const issues = rows.filter((r) => r.p.issue).length;

  const L = {
    liveOut: ar ? "المنتَج اليوم" : "Produced today",
    updates: ar ? "تحديثات المجموعة" : "Group updates",
    avgScrap: ar ? "متوسط الهالك" : "Avg scrap",
    alerts: ar ? "تنبيهات" : "Alerts",
    group: ar ? "مجموعة إنتاج المصنع" : "Factory Production Group",
    silent: ar ? "المساعد الذكي يقرأ الرسائل بصمت" : "The AI assistant reads silently",
    feed: ar ? "المتابعة اللحظية (يستخرجها المساعد)" : "Live feed (extracted by the assistant)",
    live: ar ? "مباشر" : "LIVE",
    order: ar ? "الطلب" : "Order",
    line: ar ? "الخط" : "Line",
    product: ar ? "المنتج" : "Product",
    qty: ar ? "الكمية" : "Qty",
    scrap: ar ? "الهالك" : "Scrap",
    issue: ar ? "مشكلة" : "Issue",
    sender: ar ? "المشرف" : "Supervisor",
  };

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={L.liveOut} value={new Intl.NumberFormat(ar ? "ar-KW" : "en-US").format(totalUnits)} />
        <StatCard label={L.updates} value={rows.length} />
        <StatCard label={L.avgScrap} value={`${avgScrap}%`} />
        <StatCard label={L.alerts} value={issues} accent={issues > 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* WhatsApp group stream */}
        <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm h-fit">
          <div className="bg-[#075E54] text-white px-4 py-3">
            <div className="font-semibold">{L.group}</div>
            <div className="text-[11px] text-white/70">{L.silent}</div>
          </div>
          <div className="bg-[#ECE5DD] p-4 space-y-3">
            {SAMPLE.map((m, i) => (
              <div key={i} className="max-w-[88%] bg-white rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-emerald-700">{L.sender} {m.who}</span>
                  <span className="text-[10px] text-slate-400" dir="ltr">{m.time}</span>
                </div>
                <div className="text-sm text-slate-800">{m.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Assistant structured feed */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-600 px-2 py-0.5 text-[11px] font-bold">
              ● {L.live}
            </span>
            <h2 className="text-sm font-semibold text-slate-700">{L.feed}</h2>
          </div>
          <div className="space-y-3">
            {rows.map((r, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-700">🤖 {L.sender} {r.who}</span>
                  <span className="text-[10px] text-slate-400" dir="ltr">{r.time}</span>
                </div>
                <div className="text-xs text-slate-500 mb-3">{r.text}</div>
                <div className="flex flex-wrap gap-2">
                  {r.p.order_no && <Chip label={L.order} value={r.p.order_no} tone="bg-blue-50 text-blue-700" />}
                  {r.p.line_no && <Chip label={L.line} value={r.p.line_no} />}
                  {r.p.product && <Chip label={L.product} value={r.p.product} />}
                  {r.p.quantity != null && <Chip label={L.qty} value={`${r.p.quantity} ${r.p.unit ?? ""}`} />}
                  {r.p.scrap_pct != null && <Chip label={L.scrap} value={`${r.p.scrap_pct}%`} />}
                  {r.p.status && <Chip label="" value={r.p.status} tone={STATUS_STYLE[r.p.status]} />}
                  {r.p.issue && <Chip label={L.issue} value={r.p.issue} tone="bg-rose-50 text-rose-700" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
