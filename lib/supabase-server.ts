import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Server-only client using the service role key.
// Bypasses Row Level Security — only ever call this from API routes,
// never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
