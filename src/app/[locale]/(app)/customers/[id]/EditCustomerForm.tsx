"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

type Cust = {
  id: string;
  name: string;
  phone: string | null;
  area: string | null;
  address: string | null;
  price_tier: string | null;
  contact_person?: string | null;
  email?: string | null;
  notes?: string | null;
  maps_url?: string | null;
};

export default function EditCustomerForm({
  locale,
  dict,
  customer,
}: {
  locale: Locale;
  dict: Dictionary;
  customer: Cust;
}) {
  const ar = locale === "ar";
  const router = useRouter();
  const supabase = createClient();

  const [v, setV] = useState<Cust>({ ...customer });
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function set<K extends keyof Cust>(k: K, val: Cust[K]) {
    setV((p) => ({ ...p, [k]: val }));
    setOk(false);
  }

  const L = ar
    ? { contact: "الشخص المسؤول", email: "البريد الإلكتروني", maps: "رابط الموقع (خرائط جوجل)", openMap: "فتح في الخرائط", del: "حذف العميل", delc: "تأكيد الحذف", tier: "فئة السعر" }
    : { contact: "Contact person", email: "Email", maps: "Location link (Google Maps)", openMap: "Open in Maps", del: "Delete customer", delc: "Confirm delete", tier: "Price tier" };

  const tierOptions = [
    { value: "standard", label: ar ? "عادي" : "Standard" },
    { value: "wholesale", label: ar ? "جملة" : "Wholesale" },
    { value: "gov", label: ar ? "حكومي" : "Government" },
  ];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!v.name) return setError(dict.misc.empty);
    setLoading(true);
    const { error: uErr } = await supabase
      .from("customers")
      .update({
        name: v.name,
        phone: v.phone || null,
        contact_person: v.contact_person || null,
        email: v.email || null,
        area: v.area || null,
        address: v.address || null,
        maps_url: v.maps_url || null,
        price_tier: v.price_tier || null,
        notes: v.notes || null,
      })
      .eq("id", customer.id);
    setLoading(false);
    if (uErr) return setError(uErr.message);
    setOk(true);
    router.refresh();
  }

  async function remove() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading(true);
    await supabase.from("customers").delete().eq("id", customer.id);
    router.push(`/${locale}/customers`);
    router.refresh();
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="card p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="label">{dict.fields.name} <span className="text-brand-accent">*</span></label>
          <input className="input" value={v.name ?? ""} onChange={(e) => set("name", e.target.value)} required />
        </div>
        <div>
          <label className="label">{dict.fields.phone}</label>
          <input className="input" dir="ltr" value={v.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="label">{L.contact}</label>
          <input className="input" value={v.contact_person ?? ""} onChange={(e) => set("contact_person", e.target.value)} />
        </div>
        <div>
          <label className="label">{L.email}</label>
          <input className="input" type="email" dir="ltr" value={v.email ?? ""} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div>
          <label className="label">{dict.fields.area}</label>
          <input className="input" value={v.area ?? ""} onChange={(e) => set("area", e.target.value)} />
        </div>
        <div>
          <label className="label">{L.tier}</label>
          <select className="input" value={v.price_tier ?? ""} onChange={(e) => set("price_tier", e.target.value)}>
            <option value="">—</option>
            {tierOptions.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="label">{dict.fields.address}</label>
          <input className="input" value={v.address ?? ""} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <label className="label">{L.maps}</label>
          <input className="input" dir="ltr" placeholder="https://maps.google.com/..." value={v.maps_url ?? ""} onChange={(e) => set("maps_url", e.target.value)} />
        </div>
        <div className="lg:col-span-3">
          <label className="label">{dict.fields.notes}</label>
          <textarea className="input min-h-[70px]" value={v.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      {v.maps_url && (
        <a href={v.maps_url} target="_blank" rel="noreferrer" className="btn-ghost inline-flex text-sm">
          📍 {L.openMap}
        </a>
      )}

      {error && <p className="text-sm text-brand-accent">{error}</p>}
      {ok && <p className="text-sm text-emerald-600">{dict.misc.saved}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? dict.actions.saving : dict.actions.save}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push(`/${locale}/customers`)}>{dict.actions.cancel}</button>
        <button
          type="button"
          onClick={remove}
          className={`btn ms-auto text-xs ${confirmDelete ? "bg-brand-accent text-white" : "bg-rose-50 text-rose-600"}`}
        >
          {confirmDelete ? L.delc : L.del}
        </button>
      </div>
    </form>
  );
}
