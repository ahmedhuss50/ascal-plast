"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  step?: string;
  dir?: "ltr" | "rtl";
};

export default function QuickAddForm({
  table,
  fields,
  dict,
  addLabel,
  inject = {},
}: {
  table: string;
  fields: Field[];
  dict: Dictionary;
  addLabel: string;
  inject?: Record<string, unknown>;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  function set(name: string, v: string) {
    setValues((prev) => ({ ...prev, [name]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload: Record<string, unknown> = { ...inject };
    for (const f of fields) {
      const raw = values[f.name];
      if (raw === undefined || raw === "") {
        if (f.required) {
          setError(dict.misc.empty);
          setLoading(false);
          return;
        }
        continue;
      }
      payload[f.name] = f.type === "number" ? Number(raw) : raw;
    }

    const { error } = await supabase.from(table).insert(payload);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setValues({});
    setOpen(false);
    setLoading(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button className="btn-primary" onClick={() => setOpen(true)}>
        + {addLabel}
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="card p-5 mb-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="label">
              {f.label} {f.required && <span className="text-brand-accent">*</span>}
            </label>
            {f.type === "select" ? (
              <select className="input" value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)}>
                <option value="">—</option>
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ) : (
              <input
                className="input"
                type={f.type === "number" ? "number" : "text"}
                step={f.step}
                dir={f.dir}
                value={values[f.name] ?? ""}
                onChange={(e) => set(f.name, e.target.value)}
                required={f.required}
              />
            )}
          </div>
        ))}
      </div>
      {error && <p className="text-sm text-brand-accent mt-3">{error}</p>}
      <div className="flex gap-3 mt-4">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? dict.actions.saving : dict.actions.save}
        </button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>
          {dict.actions.cancel}
        </button>
      </div>
    </form>
  );
}
