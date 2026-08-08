"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { Profile, UserRole } from "@/lib/types";
import { Table } from "@/components/ui";

const ROLES: UserRole[] = ["owner", "manager", "order_desk", "production", "rep"];

export default function ProfilesManager({
  locale,
  dict,
  initial,
}: {
  locale: Locale;
  dict: Dictionary;
  initial: Profile[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [rows, setRows] = useState<Profile[]>(initial);
  const [savingId, setSavingId] = useState<string | null>(null);

  function update(id: string, patch: Partial<Profile>) {
    setRows((r) => r.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  async function save(p: Profile) {
    setSavingId(p.id);
    await supabase
      .from("profiles")
      .update({
        full_name: p.full_name,
        role: p.role,
        area: p.area,
        monthly_target: p.monthly_target,
        active: p.active,
      })
      .eq("id", p.id);
    setSavingId(null);
    router.refresh();
  }

  return (
    <Table head={[dict.fields.name, dict.fields.role, dict.fields.area, dict.fields.target, dict.fields.active, ""]}>
      {rows.map((p) => (
        <tr key={p.id}>
          <td className="td">
            <input className="input" value={p.full_name ?? ""} onChange={(e) => update(p.id, { full_name: e.target.value })} />
          </td>
          <td className="td">
            <select className="input" value={p.role} onChange={(e) => update(p.id, { role: e.target.value as UserRole })}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{dict.roles[r]}</option>
              ))}
            </select>
          </td>
          <td className="td">
            <input className="input" value={p.area ?? ""} onChange={(e) => update(p.id, { area: e.target.value })} />
          </td>
          <td className="td">
            <input
              className="input"
              type="number"
              value={p.monthly_target ?? ""}
              onChange={(e) => update(p.id, { monthly_target: e.target.value === "" ? null : Number(e.target.value) })}
            />
          </td>
          <td className="td">
            <input type="checkbox" checked={p.active} onChange={(e) => update(p.id, { active: e.target.checked })} />
          </td>
          <td className="td">
            <button className="btn-primary text-xs" disabled={savingId === p.id} onClick={() => save(p)}>
              {savingId === p.id ? dict.actions.saving : dict.actions.save}
            </button>
          </td>
        </tr>
      ))}
    </Table>
  );
}
