"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default function LoginForm({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(dict.auth.invalid);
      setLoading(false);
      return;
    }
    router.replace(`/${locale}/dashboard`);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">{dict.auth.email}</label>
        <input
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          dir="ltr"
        />
      </div>
      <div>
        <label className="label">{dict.auth.password}</label>
        <input
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          dir="ltr"
        />
      </div>
      {error && <p className="text-sm text-brand-accent">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? dict.auth.signingIn : dict.auth.signIn}
      </button>
    </form>
  );
}
