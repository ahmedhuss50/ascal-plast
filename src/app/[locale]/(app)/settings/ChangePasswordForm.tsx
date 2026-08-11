"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/config";

const T = {
  ar: {
    title: "تغيير كلمة المرور",
    current: "كلمة المرور الحالية",
    next: "كلمة المرور الجديدة",
    confirm: "تأكيد كلمة المرور",
    save: "تحديث كلمة المرور",
    saving: "جارٍ التحديث…",
    ok: "تم تحديث كلمة المرور بنجاح",
    short: "كلمة المرور يجب ألا تقل عن 6 أحرف",
    mismatch: "كلمتا المرور غير متطابقتين",
    wrongCurrent: "كلمة المرور الحالية غير صحيحة",
  },
  en: {
    title: "Change password",
    current: "Current password",
    next: "New password",
    confirm: "Confirm password",
    save: "Update password",
    saving: "Updating…",
    ok: "Password updated successfully",
    short: "Password must be at least 6 characters",
    mismatch: "Passwords do not match",
    wrongCurrent: "Current password is incorrect",
  },
};

export default function ChangePasswordForm({ locale, email }: { locale: Locale; email: string }) {
  const t = T[locale];
  const supabase = createClient();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (next.length < 6) return setError(t.short);
    if (next !== confirm) return setError(t.mismatch);

    setLoading(true);
    // Verify the current password by re-authenticating.
    const { error: vErr } = await supabase.auth.signInWithPassword({ email, password: current });
    if (vErr) {
      setLoading(false);
      return setError(t.wrongCurrent);
    }
    const { error: uErr } = await supabase.auth.updateUser({ password: next });
    setLoading(false);
    if (uErr) return setError(uErr.message);
    setOk(true);
    setCurrent(""); setNext(""); setConfirm("");
  }

  return (
    <form onSubmit={submit} className="card p-5 max-w-md">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">{t.title}</h2>
      <div className="space-y-4">
        <div>
          <label className="label">{t.current}</label>
          <input type="password" className="input" dir="ltr" value={current} onChange={(e) => setCurrent(e.target.value)} required autoComplete="current-password" />
        </div>
        <div>
          <label className="label">{t.next}</label>
          <input type="password" className="input" dir="ltr" value={next} onChange={(e) => setNext(e.target.value)} required autoComplete="new-password" />
        </div>
        <div>
          <label className="label">{t.confirm}</label>
          <input type="password" className="input" dir="ltr" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
        </div>
      </div>
      {error && <p className="text-sm text-brand-accent mt-3">{error}</p>}
      {ok && <p className="text-sm text-emerald-600 mt-3">{t.ok}</p>}
      <button type="submit" className="btn-primary mt-4" disabled={loading}>
        {loading ? t.saving : t.save}
      </button>
    </form>
  );
}
