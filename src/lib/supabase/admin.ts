import { createClient as createAdminClient } from "@supabase/supabase-js";

// Server-only admin client. Uses the SERVICE ROLE key, which bypasses RLS —
// NEVER import this into a client component. Only use inside server actions /
// route handlers that have already checked the caller is an owner/manager.
export function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
