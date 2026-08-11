"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/config";

type Opt = [string, string];
type Field = { k: string; l: string; t?: "text" | "number" | "date" | "select" | "textarea"; o?: Opt[]; dir?: "ltr" };
type Section = { key: string; title: string; fields: Field[] };
type Repeat = { key: string; title: string; hint?: string; cols: Field[] };

export default function KycForm({
  locale,
  customerId,
  initial,
  initialStatus,
}: {
  locale: Locale;
  customerId: string;
  initial: Record<string, any>;
  initialStatus: string;
}) {
  const ar = locale === "ar";
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState<Record<string, any>>({ ...initial });
  const [status, setStatus] = useState(initialStatus || "draft");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(k: string, v: any) { setForm((f) => ({ ...f, [k]: v })); setOk(false); }
  function getArr(k: string): any[] { return Array.isArray(form[k]) ? form[k] : []; }
  function setRow(k: string, i: number, key: string, v: any) {
    const arr = getArr(k).slice(); arr[i] = { ...arr[i], [key]: v }; set(k, arr);
  }
  function addRow(k: string) { set(k, [...getArr(k), {}]); }
  function delRow(k: string, i: number) { set(k, getArr(k).filter((_, x) => x !== i)); }

  // ---- config ----
  const yesno: Opt[] = [["yes", ar ? "نعم" : "Yes"], ["no", ar ? "لا" : "No"]];
  const sections: Section[] = [
    { key: "01", title: ar ? "١) نوع الحساب وبيانات الطلب" : "1) Account type & request", fields: [
      { k: "account_type", l: ar ? "نوع الحساب" : "Account type", t: "select", o: [["cash", ar ? "نقدي" : "Cash"], ["credit", ar ? "آجل" : "Credit"]] },
      { k: "customer_nature", l: ar ? "طبيعة العميل" : "Customer type", t: "select", o: [["distributor", ar ? "موزع" : "Distributor"], ["wholesale", ar ? "جملة" : "Wholesale"], ["retail", ar ? "تجزئة" : "Retail"], ["companies", ar ? "شركات" : "Companies"], ["other", ar ? "أخرى" : "Other"]] },
      { k: "region_city", l: ar ? "المنطقة / المدينة" : "Region / City" },
      { k: "credit_limit_requested", l: ar ? "الحد الائتماني المطلوب (ريال)" : "Credit limit requested (SAR)", t: "number" },
      { k: "payment_terms", l: ar ? "مدة السداد المطلوبة" : "Payment terms", t: "select", o: [["immediate", ar ? "فوري" : "Immediate"], ["30", "30"], ["60", "60"], ["other", ar ? "أخرى" : "Other"]] },
      { k: "expected_monthly_purchases", l: ar ? "المشتريات الشهرية المتوقعة (ريال)" : "Expected monthly purchases (SAR)", t: "number" },
      { k: "price_tier", l: ar ? "قائمة الأسعار / الفئة" : "Price list / tier" },
    ]},
    { key: "02", title: ar ? "٢) البيانات النظامية للمنشأة" : "2) Legal entity data", fields: [
      { k: "legal_name_ar", l: ar ? "الاسم القانوني (عربي)" : "Legal name (AR)" },
      { k: "legal_name_en", l: ar ? "الاسم القانوني (إنجليزي)" : "Legal name (EN)", dir: "ltr" },
      { k: "trade_name", l: ar ? "الاسم التجاري / اسم المتجر" : "Trade name / store" },
      { k: "main_activity", l: ar ? "النشاط الرئيس" : "Main activity" },
      { k: "legal_form", l: ar ? "الشكل القانوني" : "Legal form", t: "select", o: [["establishment", ar ? "مؤسسة" : "Establishment"], ["company", ar ? "شركة" : "Company"], ["other", ar ? "أخرى" : "Other"]] },
      { k: "year_established", l: ar ? "سنة التأسيس" : "Year established", t: "number" },
      { k: "cr_number", l: ar ? "رقم السجل التجاري" : "CR number", dir: "ltr" },
      { k: "unified_national_number", l: ar ? "الرقم الوطني الموحد" : "Unified national number", dir: "ltr" },
      { k: "cr_issue_city", l: ar ? "مدينة الإصدار" : "Issue city" },
      { k: "cr_expiry", l: ar ? "تاريخ انتهاء السجل" : "CR expiry", t: "date" },
      { k: "vat_number", l: ar ? "الرقم الضريبي" : "VAT number", dir: "ltr" },
      { k: "capital", l: ar ? "رأس المال (ريال)" : "Capital (SAR)", t: "number" },
      { k: "branches_count", l: ar ? "عدد الفروع" : "Branches count", t: "number" },
      { k: "website", l: ar ? "الموقع الإلكتروني" : "Website", dir: "ltr" },
    ]},
    { key: "03", title: ar ? "٣) العنوان الوطني والتواصل" : "3) National address & contact", fields: [
      { k: "building_no", l: ar ? "رقم المبنى" : "Building no", dir: "ltr" },
      { k: "street", l: ar ? "اسم الشارع" : "Street" },
      { k: "district", l: ar ? "الحي" : "District" },
      { k: "addr_city", l: ar ? "المدينة" : "City" },
      { k: "postal_code", l: ar ? "الرمز البريدي" : "Postal code", dir: "ltr" },
      { k: "additional_no", l: ar ? "الرقم الإضافي" : "Additional no", dir: "ltr" },
      { k: "po_box", l: ar ? "صندوق البريد" : "PO box", dir: "ltr" },
      { k: "unit_no", l: ar ? "رقم الوحدة" : "Unit no", dir: "ltr" },
      { k: "general_email", l: ar ? "البريد الإلكتروني العام" : "General email", dir: "ltr" },
      { k: "company_phone", l: ar ? "هاتف المنشأة" : "Company phone", dir: "ltr" },
    ]},
    { key: "07", title: ar ? "٧) الفوترة والتسليم" : "7) Billing & delivery", fields: [
      { k: "po_required", l: ar ? "أمر شراء مطلوب" : "PO required", t: "select", o: yesno },
      { k: "invoice_email", l: ar ? "البريد الإلكتروني للفواتير" : "Invoice email", dir: "ltr" },
      { k: "invoice_method", l: ar ? "طريقة إرسال الفواتير" : "Invoice method", t: "select", o: [["paper", ar ? "ورقي" : "Paper"], ["platform", ar ? "منصة" : "Platform"], ["email", ar ? "بريد إلكتروني" : "Email"]] },
      { k: "approved_recipient", l: ar ? "اسم المستلم المعتمد" : "Approved recipient" },
      { k: "main_delivery_address", l: ar ? "عنوان التسليم الرئيس" : "Main delivery address" },
      { k: "receiving_times", l: ar ? "أوقات الاستلام" : "Receiving times" },
    ]},
    { key: "08", title: ar ? "٨) البيانات المصرفية" : "8) Banking details", fields: [
      { k: "bank_name", l: ar ? "اسم البنك" : "Bank name" },
      { k: "bank_branch_city", l: ar ? "الفرع / المدينة" : "Branch / City" },
      { k: "account_holder", l: ar ? "اسم صاحب الحساب" : "Account holder" },
      { k: "account_number", l: ar ? "رقم الحساب" : "Account number", dir: "ltr" },
      { k: "iban", l: ar ? "رقم الآيبان IBAN" : "IBAN", dir: "ltr" },
      { k: "bank_phone", l: ar ? "هاتف البنك / مدير العلاقة" : "Bank phone / RM", dir: "ltr" },
    ]},
    { key: "09", title: ar ? "٩) طلب التسهيلات الائتمانية" : "9) Credit facilities request", fields: [
      { k: "cf_credit_limit", l: ar ? "الحد الائتماني المطلوب (ريال)" : "Credit limit (SAR)", t: "number" },
      { k: "cf_payment_term_days", l: ar ? "مدة السداد (يوم)" : "Payment term (days)", t: "number" },
      { k: "cf_expected_avg_order", l: ar ? "متوسط الطلب المتوقع (ريال)" : "Expected avg order (SAR)", t: "number" },
      { k: "cf_monthly_orders", l: ar ? "عدد الطلبات شهريًا" : "Orders per month", t: "number" },
      { k: "cf_guarantee_type", l: ar ? "نوع الضمان المقترح" : "Guarantee type", t: "select", o: [["none", ar ? "لا يوجد" : "None"], ["promissory", ar ? "سند لأمر" : "Promissory note"], ["personal", ar ? "ضمان شخصي" : "Personal"], ["other", ar ? "أخرى" : "Other"]] },
      { k: "cf_guarantee_value", l: ar ? "قيمة الضمان (ريال)" : "Guarantee value (SAR)", t: "number" },
      { k: "cf_debt_authorizer", l: ar ? "الطرف المفوض باعتماد المديونية" : "Debt-approval authorizer" },
      { k: "cf_debt_authorizer_email", l: ar ? "البريد الإلكتروني" : "Email", dir: "ltr" },
    ]},
    { key: "11", title: ar ? "١١) معلومات تجارية إضافية" : "11) Additional commercial info", fields: [
      { k: "top_products", l: ar ? "أبرز المنتجات / الفئات" : "Top products / categories", t: "textarea" },
      { k: "sales_channels", l: ar ? "قنوات البيع (معرض/جملة/مشاريع/متجر إلكتروني)" : "Sales channels" },
      { k: "top_regions", l: ar ? "أهم المناطق التي يغطيها" : "Top regions covered" },
      { k: "extra_notes", l: ar ? "ملاحظات إضافية" : "Additional notes", t: "textarea" },
    ]},
  ];

  const repeats: Repeat[] = [
    { key: "owners", title: ar ? "٤) المالك / الشركاء / المستفيدون الفعليون" : "4) Owners / partners", cols: [
      { k: "name", l: ar ? "الاسم الكامل" : "Full name" }, { k: "nationality", l: ar ? "الجنسية" : "Nationality" },
      { k: "id_no", l: ar ? "رقم الهوية/السجل" : "ID / Reg no", dir: "ltr" }, { k: "capacity", l: ar ? "الصفة" : "Capacity" },
      { k: "ownership_pct", l: ar ? "نسبة الملكية %" : "Ownership %", t: "number" },
    ]},
    { key: "signatories", title: ar ? "٥) المفوضون بالتوقيع والتعامل" : "5) Authorized signatories", cols: [
      { k: "name", l: ar ? "الاسم الكامل" : "Full name" }, { k: "position", l: ar ? "المنصب" : "Position" },
      { k: "id_no", l: ar ? "رقم الهوية" : "ID no", dir: "ltr" }, { k: "auth_scope", l: ar ? "نطاق التفويض" : "Auth scope" },
      { k: "contact", l: ar ? "الجوال / البريد" : "Mobile / email", dir: "ltr" },
    ]},
    { key: "op_contacts", title: ar ? "٦) جهات الاتصال التشغيلية" : "6) Operational contacts", cols: [
      { k: "role", l: ar ? "الوظيفة (مشتريات/فواتير/مستودع/مدير)" : "Role" }, { k: "name", l: ar ? "الاسم" : "Name" },
      { k: "mobile", l: ar ? "الجوال" : "Mobile", dir: "ltr" }, { k: "email", l: ar ? "البريد" : "Email", dir: "ltr" },
    ]},
    { key: "references", title: ar ? "١٠) المراجع التجارية" : "10) Trade references", cols: [
      { k: "supplier", l: ar ? "اسم المورد" : "Supplier" }, { k: "contact_name", l: ar ? "اسم المسؤول" : "Contact" },
      { k: "mobile", l: ar ? "الجوال" : "Mobile", dir: "ltr" }, { k: "dealing_period", l: ar ? "مدة التعامل" : "Dealing period" },
      { k: "credit_terms", l: ar ? "حد/شروط الائتمان" : "Credit terms" },
    ]},
  ];

  const DOCS: string[] = ar
    ? ["صورة السجل التجاري الساري", "شهادة التسجيل في ضريبة القيمة المضافة", "إثبات العنوان الوطني", "عقد التأسيس وآخر تعديل (للشركات)", "هوية المالك / المفوض بالتوقيع", "تفويض أو قرار يثبت صلاحية التوقيع", "خطاب الآيبان / شهادة الحساب البنكي", "القوائم المالية (عند الطلب)", "النموذج موقع ومختوم"]
    : ["Valid CR copy", "VAT registration certificate", "National address proof", "Incorporation contract (companies)", "Owner / signatory ID", "Signature authorization", "IBAN letter / bank certificate", "Financial statements (on request)", "Signed & stamped form"];

  const docs = getArr("documents");

  async function save(submit: boolean) {
    setLoading(true); setError(null); setOk(false);
    const newStatus = submit ? "submitted" : status;
    const { error: e } = await supabase.from("customer_kyc").upsert(
      { customer_id: customerId, data: form, status: newStatus },
      { onConflict: "customer_id" }
    );
    setLoading(false);
    if (e) return setError(e.message);
    setStatus(newStatus); setOk(true); router.refresh();
  }

  function renderField(f: Field, val: any, onChange: (v: any) => void) {
    if (f.t === "select")
      return (
        <select className="input" value={val ?? ""} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {f.o!.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      );
    if (f.t === "textarea")
      return <textarea className="input min-h-[64px]" value={val ?? ""} onChange={(e) => onChange(e.target.value)} />;
    return (
      <input className="input" type={f.t === "number" ? "number" : f.t === "date" ? "date" : "text"} dir={f.dir}
        value={val ?? ""} onChange={(e) => onChange(e.target.value)} />
    );
  }

  return (
    <div className="space-y-6">
      {sections.map((s) => (
        <section key={s.key} className="card p-5">
          <h2 className="text-base font-semibold text-brand mb-4">{s.title}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {s.fields.map((f) => (
              <div key={f.k}>
                <label className="label">{f.l}</label>
                {renderField(f, form[f.k], (v) => set(f.k, v))}
              </div>
            ))}
          </div>
        </section>
      ))}

      {repeats.map((r) => (
        <section key={r.key} className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-brand">{r.title}</h2>
            <button type="button" className="btn-ghost text-xs" onClick={() => addRow(r.key)}>+ {ar ? "إضافة" : "Add"}</button>
          </div>
          <div className="space-y-3">
            {getArr(r.key).length === 0 && <p className="text-xs text-slate-400">{ar ? "لا توجد سجلات" : "No rows"}</p>}
            {getArr(r.key).map((row, i) => (
              <div key={i} className="grid sm:grid-cols-2 lg:grid-cols-6 gap-2 items-end border-b border-slate-100 pb-3">
                {r.cols.map((c) => (
                  <div key={c.k} className={c.k === "name" || c.k === "supplier" || c.k === "role" ? "lg:col-span-2" : ""}>
                    <label className="label">{c.l}</label>
                    {renderField(c, row[c.k], (v) => setRow(r.key, i, c.k, v))}
                  </div>
                ))}
                <button type="button" className="btn-ghost text-xs" onClick={() => delRow(r.key, i)}>✕</button>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Documents checklist */}
      <section className="card p-5">
        <h2 className="text-base font-semibold text-brand mb-3">{ar ? "١٢) المستندات المرفقة" : "12) Attached documents"}</h2>
        <div className="space-y-2">
          {DOCS.map((doc, i) => {
            const cur = docs[i] || {};
            return (
              <label key={i} className="flex items-center gap-3 text-sm">
                <input type="checkbox" checked={!!cur.attached}
                  onChange={(e) => { const a = docs.slice(); a[i] = { ...cur, doc, attached: e.target.checked }; set("documents", a); }} />
                <span className="text-slate-700">{doc}</span>
              </label>
            );
          })}
        </div>
      </section>

      {/* Applicant */}
      <section className="card p-5">
        <h2 className="text-base font-semibold text-brand mb-4">{ar ? "١٤) مقدم الطلب" : "14) Applicant"}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { k: "applicant_name", l: ar ? "اسم مقدم الطلب" : "Applicant name" },
            { k: "applicant_position", l: ar ? "الصفة / المنصب" : "Position" },
            { k: "applicant_id", l: ar ? "رقم الهوية" : "ID no", dir: "ltr" as const },
            { k: "applicant_mobile", l: ar ? "رقم الجوال" : "Mobile", dir: "ltr" as const },
            { k: "sign_date", l: ar ? "التاريخ" : "Date", t: "date" as const },
            { k: "sign_place", l: ar ? "مكان التوقيع" : "Place" },
          ].map((f) => (
            <div key={f.k}>
              <label className="label">{f.l}</label>
              {renderField(f as Field, form[f.k], (v) => set(f.k, v))}
            </div>
          ))}
        </div>
        <label className="flex items-center gap-3 text-sm mt-4">
          <input type="checkbox" checked={!!form.declaration_agree} onChange={(e) => set("declaration_agree", e.target.checked)} />
          <span className="text-slate-700">{ar ? "أقر بصحة البيانات وأوافق على الإقرارات والتفويض" : "I confirm the data is correct and agree to the declarations"}</span>
        </label>
      </section>

      {/* Internal review */}
      <section className="card p-5 bg-slate-50">
        <h2 className="text-base font-semibold text-slate-700 mb-1">{ar ? "للاستخدام الداخلي (المبيعات / المالية)" : "Internal (Sales / Finance)"}</h2>
        <p className="text-xs text-slate-500 mb-4">{ar ? "لا يُعبأ من العميل" : "Not filled by the customer"}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { k: "int_customer_status", l: ar ? "حالة العميل" : "Customer status", t: "select" as const, o: [["new", ar ? "جديد" : "New"], ["existing", ar ? "قائم" : "Existing"], ["reactivation", ar ? "إعادة تفعيل" : "Reactivation"]] },
            { k: "int_opportunity", l: ar ? "تقييم الفرصة" : "Opportunity", t: "select" as const, o: [["low", ar ? "منخفضة" : "Low"], ["medium", ar ? "متوسطة" : "Medium"], ["high", ar ? "مرتفعة" : "High"]] },
            { k: "int_recommendation", l: ar ? "توصية المبيعات" : "Sales recommendation", t: "select" as const, o: [["cash", ar ? "نقدي" : "Cash"], ["credit", ar ? "آجل" : "Credit"], ["reject", ar ? "رفض" : "Reject"]] },
            { k: "int_decision", l: ar ? "قرار الائتمان" : "Credit decision", t: "select" as const, o: [["accepted", ar ? "مقبول" : "Accepted"], ["conditional", ar ? "مشروط" : "Conditional"], ["rejected", ar ? "غير مقبول" : "Rejected"]] },
            { k: "int_approved_limit", l: ar ? "الحد المعتمد (ريال)" : "Approved limit (SAR)", t: "number" as const },
            { k: "int_approved_term", l: ar ? "مدة السداد المعتمدة (يوم)" : "Approved term (days)", t: "number" as const },
            { k: "int_review_date", l: ar ? "تاريخ إعادة المراجعة" : "Review date", t: "date" as const },
          ].map((f) => (
            <div key={f.k}>
              <label className="label">{f.l}</label>
              {renderField(f as Field, form[f.k], (v) => set(f.k, v))}
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-brand-accent">{error}</p>}
      {ok && <p className="text-sm text-emerald-600">{ar ? "تم الحفظ" : "Saved"}</p>}

      <div className="flex flex-wrap items-center gap-3 sticky bottom-0 bg-brand-soft/80 backdrop-blur py-3 rounded-lg px-3">
        <span className="text-xs text-slate-500">{ar ? "الحالة:" : "Status:"} {status}</span>
        <button className="btn-primary" disabled={loading} onClick={() => save(false)}>{loading ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ" : "Save")}</button>
        <button className="btn-ghost" disabled={loading} onClick={() => save(true)}>{ar ? "حفظ وإرسال" : "Save & submit"}</button>
        <button className="btn-ghost ms-auto" onClick={() => router.push(`/${locale}/customers/${customerId}`)}>{ar ? "رجوع" : "Back"}</button>
      </div>
    </div>
  );
}
