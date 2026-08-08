"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { OrderStatus } from "@/lib/types";
import { formatMoney } from "@/lib/format";

type Card = { id: string; status: OrderStatus; total: number; created_at: string; customer: string };

const COLUMNS: OrderStatus[] = ["confirmed", "in_production", "ready"];
const NEXT: Record<string, OrderStatus> = {
  confirmed: "in_production",
  in_production: "ready",
  ready: "delivered",
};

export default function ProductionBoard({
  locale,
  dict,
  initial,
}: {
  locale: Locale;
  dict: Dictionary;
  initial: Card[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [cards, setCards] = useState<Card[]>(initial);
  const [busy, setBusy] = useState<string | null>(null);

  async function advance(card: Card) {
    const next = NEXT[card.status];
    if (!next) return;
    setBusy(card.id);
    await supabase.from("orders").update({ status: next }).eq("id", card.id);
    // remove from board if it left the visible columns (delivered)
    setCards((cs) =>
      next === "delivered"
        ? cs.filter((c) => c.id !== card.id)
        : cs.map((c) => (c.id === card.id ? { ...c, status: next } : c))
    );
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const items = cards.filter((c) => c.status === col);
        return (
          <div key={col} className="bg-slate-100 rounded-xl p-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-semibold text-slate-700">{dict.orderStatus[col]}</h3>
              <span className="badge bg-white text-slate-500">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.map((c) => (
                <div key={c.id} className="card p-4">
                  <div className="font-medium text-slate-800">{c.customer}</div>
                  <div className="text-sm text-brand mt-1">{formatMoney(c.total, locale)}</div>
                  <button
                    className="btn-primary text-xs w-full mt-3"
                    disabled={busy === c.id}
                    onClick={() => advance(c)}
                  >
                    {dict.actions.advance} →
                  </button>
                </div>
              ))}
              {items.length === 0 && <p className="text-center text-slate-400 text-xs py-4">—</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
