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
    <aside className="w-60 shrink-0 bg-brand text-white min-h-screen p-4 hidden md:block">
      <div className="mb-8 px-1">
        <div className="rounded-lg overflow-hidden bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Ascal" className="w-full h-auto block" />
        </div>
        <div className="text-[11px] text-white/60 mt-2 text-center">{dict.appTagline}</div>
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
                active ? "bg-white/20 font-semibold" : "text-white/80 hover:bg-white/10"
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
