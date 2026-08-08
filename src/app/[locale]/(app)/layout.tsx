import { redirect } from "next/navigation";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { getProfile } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const d = getDictionary(params.locale);
  const profile = await getProfile();
  if (!profile) redirect(`/${params.locale}/login`);

  return (
    <div className="flex min-h-screen">
      <Sidebar locale={params.locale} dict={d} role={profile.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          locale={params.locale}
          dict={d}
          name={profile.full_name || "—"}
          roleLabel={d.roles[profile.role]}
        />
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
