/**
 * Compatibility layer - re-exports from new Supabase-based API
 * This maintains backwards compatibility with existing code that imports from "@/lib/convex"
 * 
 * Note: useQuery and useMutation are Convex-specific and no longer available.
 * Components should now use the new hooks from "@/lib/api" directly.
 * 
 * Old usage: import { useQuery, useMutation, api } from "@/lib/convex";
 * New usage: import { api } from "@/lib/convex"; // api has all the functions
 */

// Re-export all API functions under `api` namespace for compatibility
import * as apiFunctions from "./api";

export const api = apiFunctions;
