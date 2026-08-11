import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard, Table, EmptyState } from "@/components/ui";
import { formatNumber } from "@/lib/format";

export const dynamic = "force-dynamic";

const T = {
  ar: {
    subtitle: "اللوحة اليومية والشهرية للإنتاج",
    daily: "اللوحة اليومية",
    monthly: "اللوحة الشهرية",
    date: "التاريخ",
    month: "الشهر",
    show: "عرض",
    planned: "المخطط",
    actual: "الفعلي",
    achievement: "نسبة التحقيق",
    scrapPieces: "الهالك (حبة)",
    scrapKg: "الهالك (كجم)",
    downtime: "ساعات التوقف",
    entries: "سجلات اليوم",
    shift: "الوردية",
    machine: "الماكينة",
    product: "المنتج",
    worker: "العامل",
    noData: "لا توجد بيانات إنتاج لهذه الفترة بعد — ستظهر تلقائياً عند إدخال سجلات الإنتاج",
    noEntries: "لا توجد سجلات في هذا اليوم",
  },
  en: {
    subtitle: "Daily and monthly production boards",
    daily: "Daily Board",
    monthly: "Monthly Board",
    date: "Date",
    month: "Month",
    show: "Show",
    planned: "Planned",
    actual: "Actual",
    achievement: "Achievement",
    scrapPieces: "Scrap (pcs)",
    scrapKg: "Scrap (kg)",
    downtime: "Downtime (hrs)",
    entries: "Day's entries",
    shift: "Shift",
    machine: "Machine",
    product: "Product",
    worker: "Worker",
    noData: "No production data for this period yet — it appears automatically once production logs are entered",
    noEntries: "No entries for this day",
  },
};

function pad(n: number) {
  return n < 10 ? "0" + n : "" + n;
}

export default async function ProductionReportPage({
  params,
  searchParams,
}: {
  params: { locale: Locale };
  searchParams: { date?: string; month?: string };
}) {
  const d = getDictionary(params.locale);
  const t = T[params.locale];
  const supabase = createClient();

  // Default date = latest logged day, else today.
  const { data: latest } = await supabase
    .from("production_log")
    .select("log_date")
    .order("log_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const date = searchParams.date || (latest?.log_date as string) || today;
  const month = searchParams.month || date.slice(0, 7);

  const [{ data: day }, { data: mon }, { data: entries }] = await Promise.all([
    supabase.from("v_production_daily").select("*").eq("log_date", date).maybeSingle(),
    supabase.from("v_production_monthly").select("*").eq("month", month).maybeSingle(),
    supabase
      .from("production_log")
      .select(
        "id,shift,planned_qty,actual_qty,scrap_pieces,scrap_kg,downtime_hours,machines(name),products(name_ar,name_en),workers(name)"
      )
      .eq("log_date", date)
      .order("shift"),
  ]);

  const nameCol = params.locale === "ar" ? "name_ar" : "name_en";
  const rows = (entries ?? []) as any[];
  const hasAny = Boolean(day || mon || rows.length);

  const dailyAch = day?.achievement_pct != null ? Number(day.achievement_pct) : null;
  const achColor =
    dailyAch == null ? "bg-slate-300"
    : dailyAch >= 90 ? "bg-emerald-500"
    : dailyAch >= 70 ? "bg-amber-500"
    : "bg-rose-500";

  return (
    <>
      <PageHeader title={d.nav.prodReport} subtitle={t.subtitle} />

      {/* Period selector */}
      <form method="get" className="card p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="label">{t.date}</label>
          <input type="date" name="date" defaultValue={date} className="input" dir="ltr" />
        </div>
        <div>
          <label className="label">{t.month}</label>
          <input type="month" name="month" defaultValue={month} className="input" dir="ltr" />
        </div>
        <button type="submit" className="btn-primary">{t.show}</button>
      </form>

      {!hasAny && (
        <div className="card mb-6"><EmptyState text={t.noData} /></div>
      )}

      {/* Daily board */}
      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        {t.daily} — <span dir="ltr">{date}</span>
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard label={t.planned} value={formatNumber(day?.planned ?? 0, params.locale)} />
        <StatCard label={t.actual} value={formatNumber(day?.actual ?? 0, params.locale)} />
        <StatCard label={t.achievement} value={dailyAch != null ? dailyAch + "%" : "—"} accent={dailyAch != null && dailyAch < 70} />
        <StatCard label={t.scrapPieces} value={formatNumber(day?.scrap_pieces ?? 0, params.locale)} />
        <StatCard label={t.scrapKg} value={formatNumber(day?.scrap_kg ?? 0, params.locale)} />
        <StatCard label={t.downtime} value={formatNumber(day?.downtime_hours ?? 0, params.locale)} />
      </div>
      {/* Achievement bar */}
      <div className="card p-4 mb-8">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>{t.achievement}</span>
          <span>{dailyAch != null ? dailyAch + "%" : "—"}</span>
        </div>
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full ${achColor} transition-all`}
            style={{ width: `${Math.min(100, dailyAch ?? 0)}%` }}
          />
        </div>
      </div>

      {/* Monthly board */}
      <h2 className="text-lg font-semibold text-slate-800 mb-3">
        {t.monthly} — <span dir="ltr">{month}</span>
      </h2>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label={t.planned} value={formatNumber(mon?.planned ?? 0, params.locale)} />
        <StatCard label={t.actual} value={formatNumber(mon?.actual ?? 0, params.locale)} />
        <StatCard label={t.achievement} value={mon?.achievement_pct != null ? mon.achievement_pct + "%" : "—"} />
        <StatCard label={t.scrapPieces} value={formatNumber(mon?.scrap_pieces ?? 0, params.locale)} />
        <StatCard label={t.scrapKg} value={formatNumber(mon?.scrap_kg ?? 0, params.locale)} />
        <StatCard label={t.downtime} value={formatNumber(mon?.downtime_hours ?? 0, params.locale)} />
      </div>

      {/* Day entries */}
      <h2 className="text-lg font-semibold text-slate-800 mb-3">{t.entries}</h2>
      {rows.length === 0 ? (
        <div className="card"><EmptyState text={t.noEntries} /></div>
      ) : (
        <Table head={[t.shift, t.machine, t.product, t.worker, t.planned, t.actual, t.scrapPieces, t.downtime]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="td">{r.shift ?? "—"}</td>
              <td className="td">{r.machines?.name ?? "—"}</td>
              <td className="td font-medium">{r.products?.[nameCol] ?? "—"}</td>
              <td className="td">{r.workers?.name ?? "—"}</td>
              <td className="td">{formatNumber(r.planned_qty ?? 0, params.locale)}</td>
              <td className="td">{formatNumber(r.actual_qty ?? 0, params.locale)}</td>
              <td className="td">{formatNumber(r.scrap_pieces ?? 0, params.locale)}</td>
              <td className="td">{formatNumber(r.downtime_hours ?? 0, params.locale)}</td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
