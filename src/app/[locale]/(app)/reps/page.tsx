import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui";
import ProfilesManager from "./ProfilesManager";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function RepsPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
  const rows = (data ?? []) as Profile[];

  return (
    <>
      <PageHeader
        title={d.nav.reps}
        subtitle={params.locale === "ar"
          ? "المستخدمون يُنشأون من لوحة Supabase (Authentication)، ثم تُحدَّد أدوارهم هنا"
          : "Users are created in the Supabase dashboard (Authentication); set their roles here"}
      />
      <ProfilesManager locale={params.locale} dict={d} initial={rows} />
    </>
  );
}
