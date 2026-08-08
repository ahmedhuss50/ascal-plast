"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { formatMoney } from "@/lib/format";

type ProductOpt = { id: string; name: string; price: number };
type Line = { product_id: string; qty: number; unit_price: number };

export default function NewOrderForm({
  locale,
  dict,
  currentUserId,
  customers,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  currentUserId: string | null;
  customers: { value: string; label: string }[];
  products: ProductOpt[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [customerId, setCustomerId] = useState("");
  const [source, setSource] = useState<"manual" | "whatsapp" | "rep">("manual");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([{ product_id: "", qty: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + Number(l.qty || 0) * Number(l.unit_price || 0), 0),
    [lines]
  );

  function setLine(idx: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }
  function onProduct(idx: number, productId: string) {
    const p = products.find((x) => x.id === productId);
    setLine(idx, { product_id: productId, unit_price: p ? p.price : 0 });
  }
  function addLine() {
    setLines((ls) => [...ls, { product_id: "", qty: 1, unit_price: 0 }]);
  }
  function removeLine(idx: number) {
    setLines((ls) => ls.filter((_, i) => i !== idx));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const valid = lines.filter((l) => l.product_id && Number(l.qty) > 0);
    if (!customerId || valid.length === 0) {
      setError(dict.misc.empty);
      return;
    }
    setLoading(true);

    const { data: order, error: oErr } = await supabase
      .from("orders")
      .insert({
        customer_id: customerId,
        source,
        status: "draft",
        notes: notes || null,
        total,
        created_by: currentUserId,
        rep_id: source === "rep" ? currentUserId : null,
      })
      .select("id")
      .single();

    if (oErr || !order) {
      setError(oErr?.message ?? "Error");
      setLoading(false);
      return;
    }

    const items = valid.map((l) => ({
      order_id: order.id,
      product_id: l.product_id,
      qty: Number(l.qty),
      unit_price: Number(l.unit_price),
    }));
    const { error: iErr } = await supabase.from("order_items").insert(items);
    if (iErr) {
      setError(iErr.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/orders`);
    router.refresh();
  }

  const sourceOptions: { value: "manual" | "whatsapp" | "rep"; label: string }[] = [
    { value: "manual", label: dict.orderSource.manual },
    { value: "whatsapp", label: dict.orderSource.whatsapp },
    { value: "rep", label: dict.orderSource.rep },
  ];

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="card p-5 grid sm:grid-cols-3 gap-4">
        <div>
          <label className="label">{dict.fields.customer} <span className="text-brand-accent">*</span></label>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">—</option>
            {customers.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{dict.fields.source}</label>
          <select className="input" value={source} onChange={(e) => setSource(e.target.value as any)}>
            {sourceOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{dict.fields.notes}</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="card p-5">
        <div className="space-y-3">
          {lines.map((l, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-6">
                <label className="label">{dict.fields.product}</label>
                <select className="input" value={l.product_id} onChange={(e) => onProduct(idx, e.target.value)}>
                  <option value="">—</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">{dict.fields.quantity}</label>
                <input className="input" type="number" min="0" step="0.001" value={l.qty}
                  onChange={(e) => setLine(idx, { qty: Number(e.target.value) })} />
              </div>
              <div className="col-span-3">
                <label className="label">{dict.fields.price}</label>
                <input className="input" type="number" min="0" step="0.01" value={l.unit_price}
                  onChange={(e) => setLine(idx, { unit_price: Number(e.target.value) })} />
              </div>
              <div className="col-span-1">
                <button type="button" className="btn-ghost w-full" onClick={() => removeLine(idx)}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn-ghost mt-4" onClick={addLine}>+ {dict.actions.addItem}</button>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <span className="text-sm text-slate-500">{dict.fields.total}</span>
          <span className="text-xl font-bold text-brand">{formatMoney(total, locale)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-brand-accent">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? dict.actions.saving : dict.actions.create}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.back()}>{dict.actions.cancel}</button>
      </div>
    </form>
  );
}
