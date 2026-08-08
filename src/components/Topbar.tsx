"use client";

import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";

export default function Topbar({
  locale,
  dict,
  name,
  roleLabel,
}: {
  locale: Locale;
  dict: Dictionary;
  name: string;
  roleLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const other: Locale = locale === "ar" ? "en" : "ar";
  const switchHref = pathname.replace(/^\/(ar|en)/, `/${other}`);

  async function logout() {
    await supabase.auth.signOut();
    router.replace(`/${locale}/login`);
    router.refresh();
  }

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <span className="md:hidden grid place-items-center w-8 h-8 rounded-lg bg-brand text-white text-xs font-bold">
          AP
        </span>
        <span className="text-sm text-slate-500">{dict.appTagline}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => {
            router.push(switchHref);
            router.refresh();
          }}
          className="btn-ghost text-xs"
        >
          {dict.misc.language}
        </button>
        <div className="text-end">
          <div className="text-sm font-semibold text-slate-800 leading-tight">{name}</div>
          <div className="text-[11px] text-slate-500">{roleLabel}</div>
        </div>
        <button onClick={logout} className="btn-primary text-xs">
          {dict.auth.logout}
        </button>
      </div>
    </header>
  );
}
