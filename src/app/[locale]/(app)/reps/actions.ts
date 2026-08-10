"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdmin } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/types";

export type CreateUserInput = {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  area?: string;
  monthly_target?: number | null;
};

export async function createUser(input: CreateUserInput): Promise<{ ok?: true; error?: string }> {
  // 1) Authorize the caller — must be a signed-in owner or manager.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "not_authenticated" };

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (!me || (me.role !== "owner" && me.role !== "manager")) {
    return { error: "not_authorized" };
  }

  // 2) Basic validation
  if (!input.email || !input.password || input.password.length < 6) {
    return { error: "invalid_input" };
  }

  // 3) Create the auth user (service role) and set their profile fields.
  const admin = createAdmin();
  const { data: created, error } = await admin.auth.admin.createUser({
    email: input.email.trim(),
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.full_name },
  });
  if (error || !created?.user) {
    return { error: error?.message ?? "create_failed" };
  }

  const { error: pErr } = await admin
    .from("profiles")
    .upsert(
      {
        id: created.user.id,
        full_name: input.full_name,
        role: input.role,
        area: input.area ?? null,
        monthly_target: input.monthly_target ?? null,
        active: true,
      },
      { onConflict: "id" }
    );
  if (pErr) return { error: pErr.message };

  return { ok: true };
}
