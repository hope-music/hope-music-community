import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side admin client. Uses the service role key, which bypasses RLS.
 * NEVER use this in client-side code!
 */
let adminClient: SupabaseClient<any, any> | null = null;

export function getSupabaseAdminClient(): SupabaseClient<any, any> {
  if (!adminClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
    if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
    adminClient = createClient(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return adminClient;
}

/**
 * Re-export with cleaner name for use in API routes
 */
export const supabaseAdmin = getSupabaseAdminClient();
