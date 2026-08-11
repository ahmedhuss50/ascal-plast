"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Locale } from "@/i18n/config";

export type Loc = {
  id: string;
  label: string | null;
  area: string | null;
  address: string | null;
  maps_url: string | null;
  phone: string | null;
  contact_person: string | null;
};

export default function LocationsList({ locale, initial }: { locale: Locale; initial: Loc[] }) {
  const ar = locale === "ar";
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState<Loc[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const L = ar
    ? { label: "اسم الفرع", area: "المنطقة", phone: "الهاتف", address: "العنوان", maps: "رابط الموقع", contact: "المسؤول", save: "حفظ", saving: "جارٍ الحفظ…", del: "حذف", open: "فتح في الخرائط", empty: "لا توجد فروع بعد — أضف فرعاً بالأعلى" }
    : { label: "Branch name", area: "Area", phone: "Phone", address: "Address", maps: "Location link", contact: "Contact", save: "Save", saving: "Saving…", del: "Delete", open: "Open in Maps", empty: "No branches yet — add one above" };

  function edit(id: string, patch: Partial<Loc>) {
    setRows((r) => r.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }
  async function save(l: Loc) {
    setBusy(l.id);
    await supabase.from("customer_locations").update({
      label: l.label, area: l.area, address: l.address, maps_url: l.maps_url, phone: l.phone, contact_person: l.contact_person,
    }).eq("id", l.id);
    setBusy(null);
    router.refresh();
  }
  async function remove(id: string) {
    setBusy(id);
    await supabase.from("customer_locations").delete().eq("id", id);
    setRows((r) => r.filter((l) => l.id !== id));
    setBusy(null);
    router.refresh();
  }

  if (rows.length === 0) return <p className="text-sm text-slate-400">{L.empty}</p>;

  return (
    <div className="space-y-4">
      {rows.map((l) => (
        <div key={l.id} className="card p-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="label">{L.label}</label>
              <input className="input" value={l.label ?? ""} onChange={(e) => edit(l.id, { label: e.target.value })} />
            </div>
            <div>
              <label className="label">{L.area}</label>
              <input className="input" value={l.area ?? ""} onChange={(e) => edit(l.id, { area: e.target.value })} />
            </div>
            <div>
              <label className="label">{L.phone}</label>
              <input className="input" dir="ltr" value={l.phone ?? ""} onChange={(e) => edit(l.id, { phone: e.target.value })} />
            </div>
            <div className="lg:col-span-2">
              <label className="label">{L.address}</label>
              <input className="input" value={l.address ?? ""} onChange={(e) => edit(l.id, { address: e.target.value })} />
            </div>
            <div>
              <label className="label">{L.contact}</label>
              <input className="input" value={l.contact_person ?? ""} onChange={(e) => edit(l.id, { contact_person: e.target.value })} />
            </div>
            <div className="lg:col-span-3">
              <label className="label">{L.maps}</label>
              <input className="input" dir="ltr" placeholder="https://maps.google.com/..." value={l.maps_url ?? ""} onChange={(e) => edit(l.id, { maps_url: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button className="btn-primary text-xs" disabled={busy === l.id} onClick={() => save(l)}>
              {busy === l.id ? L.saving : L.save}
            </button>
            {l.maps_url && (
              <a href={l.maps_url} target="_blank" rel="noreferrer" className="btn-ghost text-xs">📍 {L.open}</a>
            )}
            <button className="btn ms-auto text-xs bg-rose-50 text-rose-600" onClick={() => remove(l.id)}>{L.del}</button>
          </div>
        </div>
      ))}
    </div>
  );
}
