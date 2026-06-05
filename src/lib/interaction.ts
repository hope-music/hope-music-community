import {
  INTERACTION_CATEGORY_LABELS,
  INTERACTION_CATEGORY_OPTIONS,
  LEGACY_INTERACTION_CATEGORY_MAP,
} from "@/lib/constants";

export const INTERACTION_STORAGE_KEY = "admin_interaction";

export function normalizeInteractionCategory(category: string | null | undefined): string {
  if (!category) return "others";
  return LEGACY_INTERACTION_CATEGORY_MAP[category] ?? category;
}

export function parseInteractionItems<T = Record<string, unknown>>(value: string | null): T[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed as T[];
    if (parsed && Array.isArray(parsed.posts)) return parsed.posts as T[];
    return [];
  } catch {
    return [];
  }
}

export function readInteractionItems<T = Record<string, unknown>>(): T[] {
  if (typeof window === "undefined") return [];
  return parseInteractionItems<T>(localStorage.getItem(INTERACTION_STORAGE_KEY));
}

export function normalizeInteractionItem<T extends { category?: string | null }>(item: T): T & { category: string } {
  return {
    ...item,
    category: normalizeInteractionCategory(item.category),
  };
}

export function normalizeInteractionItems<T extends { category?: string | null }>(items: T[]): Array<T & { category: string }> {
  return items.map(normalizeInteractionItem);
}

export const INTERACTION_CATEGORY_KEYS = INTERACTION_CATEGORY_OPTIONS.map(({ value }) => value);

export function getInteractionCategoryLabel(category: string | null | undefined): string {
  const normalized = normalizeInteractionCategory(category);
  return INTERACTION_CATEGORY_LABELS[normalized] ?? normalized;
}
