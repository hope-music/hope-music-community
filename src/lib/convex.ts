/**
 * Convex API exports for Next.js
 * 
 * This module provides the Convex API for use in React components.
 * The actual API comes from `convex/_generated/api` when `npx convex dev` is running.
 * 
 * Usage:
 *   import { useQuery, useMutation, api } from "@/lib/convex";
 *   const news = useQuery(api.admin.getPublishedNews);
 */

export { useQuery, useMutation, useQuery_experimental } from "convex/react";
export { api } from "../../convex/_generated/api";
