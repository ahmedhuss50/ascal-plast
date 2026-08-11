"use server";

import { createClient } from "@/lib/supabase/server";
import type { ParsedReport } from "@/lib/whatsapp-parse";

export async function saveReport(
  parsed: ParsedReport,
  raw: string,
  meta: { group_name?: string; sender?: string }
): Promise<{ ok?: true; error?: string }> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { error } = await supabase.from("whatsapp_reports").insert({
    group_name: meta.group_name ?? null,
    sender: meta.sender ?? null,
    raw_text: raw,
    order_no: parsed.order_no,
    line_no: parsed.line_no,
    product: parsed.product,
    quantity: parsed.quantity,
    unit: parsed.unit,
    scrap_pct: parsed.scrap_pct,
    status: parsed.status,
    issue: parsed.issue,
    confidence: parsed.confidence,
  });
  if (error) return { error: error.message };
  return { ok: true };
}
