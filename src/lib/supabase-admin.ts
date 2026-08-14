import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side admin client. Uses the service role key, which bypasses RLS.
 * NEVER use this in client-side code!
 *
 * Lazy init: only creates the client on first actual use, so that importing
 * this module from the browser (where SUPABASE_SERVICE_ROLE_KEY is undefined)
 * does NOT throw a module-load error.
 */
let adminClient: SupabaseClient<any, any> | null = null;

function getSupabaseAdminClient(): SupabaseClient<any, any> {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  if (!serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY not configured (this is expected on the client — admin operations must go through /api routes)"
    );
  }
  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return adminClient;
}

/**
 * Proxy: defer client creation until first property access.
 * Allows import in both server and client bundles; only fails at use-site
 * on the client, which is the correct behavior.
 */
export const supabaseAdmin: SupabaseClient<any, any> = new Proxy(
  {} as SupabaseClient<any, any>,
  {
    get(_target, prop) {
      const client = getSupabaseAdminClient();
      const value = (client as any)[prop];
      return typeof value === "function" ? value.bind(client) : value;
    },
  }
);
