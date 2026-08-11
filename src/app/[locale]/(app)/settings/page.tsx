import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import ChangePasswordForm from "./ChangePasswordForm";
import AddUserForm from "../reps/AddUserForm";
import ProfilesManager from "../reps/ProfilesManager";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: { locale: Locale } }) {
  const d = getDictionary(params.locale);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getProfile();
  const isManager = profile?.role === "owner" || profile?.role === "manager";

  let people: Profile[] = [];
  if (isManager) {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: true });
    people = (data ?? []) as Profile[];
  }

  const usersTitle = params.locale === "ar" ? "المستخدمون" : "Users";
  const usersSub =
    params.locale === "ar"
      ? "أضف مستخدماً جديداً بحساب دخول، وحدّد دوره"
      : "Add a new user with a login, and set their role";

  return (
    <>
      <PageHeader title={d.nav.settings} />

      <ChangePasswordForm locale={params.locale} email={user?.email ?? ""} />

      {isManager && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-800">{usersTitle}</h2>
          <p className="text-sm text-slate-500 mb-4">{usersSub}</p>
          <AddUserForm locale={params.locale} />
          <ProfilesManager locale={params.locale} dict={d} initial={people} />
        </section>
      )}
    </>
  );
}
