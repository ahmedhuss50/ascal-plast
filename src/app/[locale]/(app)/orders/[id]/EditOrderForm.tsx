"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { OrderStatus, OrderSource } from "@/lib/types";
import { formatMoney } from "@/lib/format";

type ProductOpt = { id: string; name: string; price: number };
type Line = { product_id: string; qty: number; unit_price: number };
type OrderData = {
  id: string;
  customer_id: string;
  rep_id: string | null;
  source: OrderSource;
  status: OrderStatus;
  notes: string | null;
};

const STATUSES: OrderStatus[] = ["draft", "confirmed", "in_production", "ready", "delivered", "cancelled"];
const SOURCES: OrderSource[] = ["manual", "whatsapp", "rep"];

export default function EditOrderForm({
  locale,
  dict,
  order,
  initialItems,
  customers,
  reps,
  products,
}: {
  locale: Locale;
  dict: Dictionary;
  order: OrderData;
  initialItems: Line[];
  customers: { value: string; label: string }[];
  reps: { value: string; label: string }[];
  products: ProductOpt[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [customerId, setCustomerId] = useState(order.customer_id ?? "");
  const [repId, setRepId] = useState(order.rep_id ?? "");
  const [source, setSource] = useState<OrderSource>(order.source);
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [lines, setLines] = useState<Line[]>(initialItems.length ? initialItems : [{ product_id: "", qty: 1, unit_price: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const total = useMemo(
    () => lines.reduce((s, l) => s + Number(l.qty || 0) * Number(l.unit_price || 0), 0),
    [lines]
  );

  function setLine(i: number, patch: Partial<Line>) {
    setLines((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function onProduct(i: number, pid: string) {
    const p = products.find((x) => x.id === pid);
    setLine(i, { product_id: pid, unit_price: p ? p.price : 0 });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    const valid = lines.filter((l) => l.product_id && Number(l.qty) > 0);
    if (!customerId || valid.length === 0) return setError(dict.misc.empty);
    setLoading(true);

    const { error: uErr } = await supabase
      .from("orders")
      .update({
        customer_id: customerId,
        rep_id: repId || null,
        source,
        status,
        notes: notes || null,
        total,
      })
      .eq("id", order.id);
    if (uErr) { setLoading(false); return setError(uErr.message); }

    await supabase.from("order_items").delete().eq("order_id", order.id);
    const { error: iErr } = await supabase
      .from("order_items")
      .insert(valid.map((l) => ({ order_id: order.id, product_id: l.product_id, qty: Number(l.qty), unit_price: Number(l.unit_price) })));
    if (iErr) { setLoading(false); return setError(iErr.message); }

    setLoading(false);
    setOk(true);
    router.refresh();
  }

  async function remove() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoading(true);
    await supabase.from("orders").delete().eq("id", order.id);
    router.push(`/${locale}/orders`);
    router.refresh();
  }

  const ar = locale === "ar";

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="card p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <label className="label">{dict.fields.customer} <span className="text-brand-accent">*</span></label>
          <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
            <option value="">—</option>
            {customers.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{dict.fields.rep}</label>
          <select className="input" value={repId} onChange={(e) => setRepId(e.target.value)}>
            <option value="">{ar ? "بدون مندوب" : "No rep"}</option>
            {reps.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{dict.fields.status}</label>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{dict.orderStatus[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{dict.fields.source}</label>
          <select className="input" value={source} onChange={(e) => setSource(e.target.value as OrderSource)}>
            {SOURCES.map((s) => <option key={s} value={s}>{dict.orderSource[s]}</option>)}
          </select>
        </div>
        <div className="lg:col-span-2">
          <label className="label">{dict.fields.notes}</label>
          <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>

      <div className="card p-5">
        <div className="space-y-3">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-end">
              <div className="col-span-6">
                <label className="label">{dict.fields.product}</label>
                <select className="input" value={l.product_id} onChange={(e) => onProduct(i, e.target.value)}>
                  <option value="">—</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="label">{dict.fields.quantity}</label>
                <input className="input" type="number" min="0" step="0.001" value={l.qty} onChange={(e) => setLine(i, { qty: Number(e.target.value) })} />
              </div>
              <div className="col-span-3">
                <label className="label">{dict.fields.price}</label>
                <input className="input" type="number" min="0" step="0.01" value={l.unit_price} onChange={(e) => setLine(i, { unit_price: Number(e.target.value) })} />
              </div>
              <div className="col-span-1">
                <button type="button" className="btn-ghost w-full" onClick={() => setLines((ls) => ls.filter((_, x) => x !== i))}>✕</button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="btn-ghost mt-4" onClick={() => setLines((ls) => [...ls, { product_id: "", qty: 1, unit_price: 0 }])}>
          + {dict.actions.addItem}
        </button>
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
          <span className="text-sm text-slate-500">{dict.fields.total}</span>
          <span className="text-xl font-bold text-brand">{formatMoney(total, locale)}</span>
        </div>
      </div>

      {error && <p className="text-sm text-brand-accent">{error}</p>}
      {ok && <p className="text-sm text-emerald-600">{dict.misc.saved}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? dict.actions.saving : dict.actions.save}
        </button>
        <button type="button" className="btn-ghost" onClick={() => router.push(`/${locale}/orders`)}>{dict.actions.cancel}</button>
        <button
          type="button"
          onClick={remove}
          className={`btn ms-auto text-xs ${confirmDelete ? "bg-brand-accent text-white" : "bg-rose-50 text-rose-600"}`}
        >
          {confirmDelete ? (ar ? "تأكيد الحذف" : "Confirm delete") : (ar ? "حذف الطلب" : "Delete order")}
        </button>
      </div>
    </form>
  );
}
