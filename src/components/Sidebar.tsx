"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import type { UserRole } from "@/lib/types";

type Item = { key: keyof Dictionary["nav"]; href: string; roles: UserRole[]; icon: string };

const ITEMS: Item[] = [
  { key: "dashboard", href: "dashboard", roles: ["owner", "manager", "order_desk", "production", "rep"], icon: "▚" },
  { key: "orders", href: "orders", roles: ["owner", "manager", "order_desk", "rep"], icon: "🧾" },
  { key: "production", href: "production", roles: ["owner", "manager", "production"], icon: "🏭" },
  { key: "visits", href: "visits", roles: ["owner", "manager", "rep"], icon: "📍" },
  { key: "customers", href: "customers", roles: ["owner", "manager", "order_desk", "rep"], icon: "👥" },
  { key: "products", href: "products", roles: ["owner", "manager", "order_desk", "production"], icon: "📦" },
  { key: "rawMaterials", href: "raw-materials", roles: ["owner", "manager", "production"], icon: "⚗️" },
  { key: "reps", href: "reps", roles: ["owner", "manager"], icon: "🧑‍💼" },
  { key: "reports", href: "reports", roles: ["owner", "manager"], icon: "📊" },
  { key: "prodReport", href: "production-report", roles: ["owner", "manager", "production"], icon: "📈" },
];

export default function Sidebar({
  locale,
  dict,
  role,
}: {
  locale: Locale;
  dict: Dictionary;
  role: UserRole;
}) {
  const pathname = usePathname();
  const items = ITEMS.filter((i) => i.roles.includes(role));

  return (
    <aside className="w-60 shrink-0 bg-white border-e border-slate-200 min-h-screen p-4 hidden md:block">
      <div className="mb-8 px-2 pt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Ascal" className="w-36 mx-auto h-auto block" />
        <div className="text-[11px] text-slate-400 mt-2 text-center">{dict.appTagline}</div>
      </div>
      <nav className="space-y-1">
        {items.map((i) => {
          const href = `/${locale}/${i.href}`;
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={i.href}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                active ? "bg-brand/10 text-brand font-semibold" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span className="text-base w-5 text-center">{i.icon}</span>
              <span>{dict.nav[i.key]}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
