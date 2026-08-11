import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getProfile } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import type { UserRole } from "@/lib/types";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const d = getDictionary(params.locale);

  // Open mode: no login required. If a session exists we use it; otherwise
  // we show the full app as an "owner" guest.
  const profile = await getProfile().catch(() => null);
  const role: UserRole = profile?.role ?? "owner";
  const guest = !profile;
  const name = profile?.full_name || (params.locale === "ar" ? "زائر" : "Guest");
  const roleLabel = guest ? (params.locale === "ar" ? "زائر" : "Guest") : d.roles[role];

  return (
    <div className="flex min-h-screen">
      <Sidebar locale={params.locale} dict={d} role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar locale={params.locale} dict={d} name={name} roleLabel={roleLabel} guest={guest} />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
