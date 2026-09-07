import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

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

// Reads the caller's session from cookies (set by @supabase/ssr's browser
// client) and returns the authenticated user, or null. API routes that cost
// money per call (anything hitting the Anthropic API) must gate on this —
// otherwise they're an open, unauthenticated way to spend the account's credits.
export async function getServerUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No-op: this helper only reads the session, it never needs to
          // refresh/write cookies back on a plain API route.
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
