import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Read-only browser client. Uses the publishable key and is subject to RLS.
 * Only safe for SELECT operations backed by the public_read policy.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY not configured");
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

/**
 * Server-side admin client. Requires the service role key, which bypasses RLS.
 * Never bundle this into the browser — it grants full table access.
 */
export function getSupabaseServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL not configured");
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY not configured");
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Lazy singleton read-only client used by React components. We resolve the
 * environment variables on first call so modules that import this at the top
 * level do not crash during `next build` when env vars are not yet injected.
 */
let _browser: SupabaseClient | null = null;
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!_browser) _browser = getSupabaseBrowserClient();
    return Reflect.get(_browser, prop, receiver);
  },
});

/**
 * Lazy admin client. Existing call sites use `createSupabaseAdmin()`; keep
 * the name for backwards compatibility but delegate to the strict factory.
 */
export function createSupabaseAdmin(): SupabaseClient {
  return getSupabaseServiceClient();
}
