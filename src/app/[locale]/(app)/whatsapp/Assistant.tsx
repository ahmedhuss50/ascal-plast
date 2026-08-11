"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseProductionMessage, type ParsedReport } from "@/lib/whatsapp-parse";
import { saveReport } from "./actions";
import type { Locale } from "@/i18n/config";

const T = {
  ar: {
    groupTitle: "مجموعة إنتاج المصنع",
    silent: "المساعد الذكي يقرأ الرسائل بصمت",
    tryTitle: "جرّب المساعد",
    tryHint: "اكتب رسالة كما يكتبها المشرف في المجموعة، وسيحوّلها المساعد إلى بيانات منظّمة.",
    analyze: "حلّل الرسالة",
    save: "حفظ في اللوحة",
    saving: "جارٍ الحفظ…",
    saved: "تم الحفظ — ظهر في المتابعة بالأسفل",
    extracted: "البيانات المستخرجة",
    order: "رقم الطلب",
    line: "الخط",
    product: "المنتج",
    qty: "الكمية",
    scrap: "الهالك %",
    status: "الحالة",
    issue: "مشكلة/ملاحظة",
    confidence: "دقة الاستخراج",
    none: "—",
    sender: "المشرف",
  },
  en: {
    groupTitle: "Factory Production Group",
    silent: "The AI assistant reads messages silently",
    tryTitle: "Try the assistant",
    tryHint: "Type a message the way a supervisor would in the group; the assistant turns it into structured data.",
    analyze: "Analyze message",
    save: "Save to dashboard",
    saving: "Saving…",
    saved: "Saved — see it in the feed below",
    extracted: "Extracted data",
    order: "Order",
    line: "Line",
    product: "Product",
    qty: "Quantity",
    scrap: "Scrap %",
    status: "Status",
    issue: "Issue/Note",
    confidence: "Extraction confidence",
    none: "—",
    sender: "Supervisor",
  },
};

const SAMPLE = [
  { who: "مختار", text: "خط ٢ أنهى الطلب PO-4471، ٥٢٠٠ عبوة، الهالك ٣٪" },
  { who: "سالم", text: "الخط الأول واقف بسبب عطل في السخان، محتاجين صيانة" },
  { who: "مختار", text: "درام ٦٥ على خط 3 منتج 1200 قطعة والهالك 2.5%" },
];

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}

export default function Assistant({ locale }: { locale: Locale }) {
  const t = T[locale];
  const router = useRouter();
  const [text, setText] = useState(SAMPLE[0].text);
  const [parsed, setParsed] = useState<ParsedReport | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function analyze() {
    setSaved(false);
    setParsed(parseProductionMessage(text));
  }
  async function doSave() {
    if (!parsed) return;
    setSaving(true);
    await saveReport(parsed, text, { group_name: T[locale].groupTitle, sender: "مختار" });
    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  const conf = parsed ? Math.round(parsed.confidence * 100) : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* WhatsApp-style group preview */}
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="bg-[#075E54] text-white px-4 py-3">
          <div className="font-semibold">{t.groupTitle}</div>
          <div className="text-[11px] text-white/70">{t.silent}</div>
        </div>
        <div className="bg-[#ECE5DD] p-4 space-y-3 min-h-[220px]">
          {SAMPLE.map((m, i) => (
            <div key={i} className="max-w-[85%] bg-white rounded-lg px-3 py-2 shadow-sm">
              <div className="text-[11px] font-bold text-emerald-700">{t.sender} {m.who}</div>
              <div className="text-sm text-slate-800">{m.text}</div>
            </div>
          ))}
          <div className="max-w-[85%] ms-auto bg-[#DCF8C6] rounded-lg px-3 py-2 shadow-sm">
            <div className="text-[11px] font-bold text-emerald-800">🤖 {locale === "ar" ? "المساعد" : "Assistant"}</div>
            <div className="text-sm text-slate-700">
              {locale === "ar"
                ? "تم تسجيل 3 تحديثات إنتاج في اللوحة ✅"
                : "Logged 3 production updates to the dashboard ✅"}
            </div>
          </div>
        </div>
      </div>

      {/* Live try box */}
      <div className="card p-5">
        <h3 className="font-semibold text-slate-800">{t.tryTitle}</h3>
        <p className="text-sm text-slate-500 mb-3">{t.tryHint}</p>
        <textarea
          className="input min-h-[80px]"
          value={text}
          onChange={(e) => { setText(e.target.value); setSaved(false); }}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {SAMPLE.map((m, i) => (
            <button key={i} type="button" className="btn-ghost text-xs"
              onClick={() => { setText(m.text); setParsed(null); setSaved(false); }}>
              {m.text.slice(0, 18)}…
            </button>
          ))}
        </div>
        <button className="btn-primary mt-3" onClick={analyze}>{t.analyze}</button>

        {parsed && (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-slate-700">{t.extracted}</span>
              <span className="text-xs text-slate-500">{t.confidence}: {conf}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden mb-4">
              <div className={`h-full ${conf >= 80 ? "bg-emerald-500" : conf >= 50 ? "bg-amber-500" : "bg-rose-500"}`} style={{ width: `${conf}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label={t.order} value={parsed.order_no ?? t.none} />
              <Field label={t.line} value={parsed.line_no ?? t.none} />
              <Field label={t.product} value={parsed.product ?? t.none} />
              <Field label={t.qty} value={parsed.quantity ? `${parsed.quantity} ${parsed.unit ?? ""}` : t.none} />
              <Field label={t.scrap} value={parsed.scrap_pct != null ? `${parsed.scrap_pct}%` : t.none} />
              <Field label={t.status} value={parsed.status ?? t.none} />
              <div className="col-span-2"><Field label={t.issue} value={parsed.issue ?? t.none} /></div>
            </div>
            <button className="btn-primary mt-4" disabled={saving} onClick={doSave}>
              {saving ? t.saving : t.save}
            </button>
            {saved && <p className="text-sm text-emerald-600 mt-2">{t.saved}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
