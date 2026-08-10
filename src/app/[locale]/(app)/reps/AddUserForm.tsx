"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "./actions";
import type { Locale } from "@/i18n/config";
import type { UserRole } from "@/lib/types";

const T = {
  ar: {
    add: "إضافة مستخدم",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    name: "الاسم",
    role: "الدور",
    area: "المنطقة",
    target: "الهدف الشهري",
    save: "حفظ",
    saving: "جارٍ الحفظ…",
    cancel: "إلغاء",
    ok: "تمت إضافة المستخدم بنجاح",
    err_auth: "غير مصرح لك",
    err_input: "أدخل بريداً صحيحاً وكلمة مرور لا تقل عن 6 أحرف",
    err_generic: "تعذّر إنشاء المستخدم",
    hint: "ينشئ حساب دخول مباشرة — لا حاجة للذهاب إلى لوحة Supabase",
  },
  en: {
    add: "Add user",
    email: "Email",
    password: "Password",
    name: "Name",
    role: "Role",
    area: "Area",
    target: "Monthly target",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    ok: "User created successfully",
    err_auth: "You are not authorized",
    err_input: "Enter a valid email and a password of at least 6 characters",
    err_generic: "Could not create the user",
    hint: "Creates a login directly — no need to open the Supabase dashboard",
  },
};

const ROLES: { v: UserRole; ar: string; en: string }[] = [
  { v: "rep", ar: "مندوب", en: "Rep" },
  { v: "order_desk", ar: "موظف الطلبات", en: "Order Desk" },
  { v: "production", ar: "الإنتاج", en: "Production" },
  { v: "manager", ar: "مدير", en: "Manager" },
  { v: "owner", ar: "المالك", en: "Owner" },
];

export default function AddUserForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const t = T[locale];
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<UserRole>("rep");
  const [area, setArea] = useState("");
  const [target, setTarget] = useState("");

  function reset() {
    setEmail(""); setPassword(""); setFullName(""); setRole("rep"); setArea(""); setTarget("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    setLoading(true);
    const res = await createUser({
      email,
      password,
      full_name: fullName,
      role,
      area: area || undefined,
      monthly_target: target === "" ? null : Number(target),
    });
    setLoading(false);
    if (res.error) {
      setError(
        res.error === "not_authorized" || res.error === "not_authenticated"
          ? t.err_auth
          : res.error === "invalid_input"
          ? t.err_input
          : res.error
      );
      return;
    }
    setOk(true);
    reset();
    router.refresh();
  }

  if (!open) {
    return (
      <div className="mb-6">
        <button className="btn-primary" onClick={() => { setOpen(true); setOk(false); }}>
          + {t.add}
        </button>
        {ok && <span className="ms-3 text-sm text-emerald-600">{t.ok}</span>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 mb-6">
      <p className="text-xs text-slate-500 mb-4">{t.hint}</p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="label">{t.name}</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">{t.email} <span className="text-brand-accent">*</span></label>
          <input className="input" type="email" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="label">{t.password} <span className="text-brand-accent">*</span></label>
          <input className="input" type="text" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="label">{t.role}</label>
          <select className="input" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
            {ROLES.map((r) => (
              <option key={r.v} value={r.v}>{locale === "ar" ? r.ar : r.en}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">{t.area}</label>
          <input className="input" value={area} onChange={(e) => setArea(e.target.value)} />
        </div>
        <div>
          <label className="label">{t.target}</label>
          <input className="input" type="number" value={target} onChange={(e) => setTarget(e.target.value)} />
        </div>
      </div>
      {error && <p className="text-sm text-brand-accent mt-3">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? t.saving : t.save}
        </button>
        <button type="button" className="btn-ghost" onClick={() => { setOpen(false); setError(null); }}>
          {t.cancel}
        </button>
      </div>
    </form>
  );
}
