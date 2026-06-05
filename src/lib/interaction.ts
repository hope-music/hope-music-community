import {
  INTERACTION_CATEGORY_LABELS,
  INTERACTION_CATEGORY_OPTIONS,
  LEGACY_INTERACTION_CATEGORY_MAP,
} from "@/lib/constants";

export const INTERACTION_STORAGE_KEY = "admin_interaction";

export type InteractionCategory = (typeof INTERACTION_CATEGORY_OPTIONS)[number]["value"];

export function normalizeInteractionCategory(category: string | null | undefined): InteractionCategory {
  if (!category) return "others";
  return (LEGACY_INTERACTION_CATEGORY_MAP[category] ?? category) as InteractionCategory;
}

export const INTERACTION_CATEGORIES = INTERACTION_CATEGORY_OPTIONS;
export const INTERACTION_CATEGORY_KEYS = INTERACTION_CATEGORY_OPTIONS.map(({ value }) => value);

export function getInteractionCategoryLabel(category: string | null | undefined): string {
  const normalized = normalizeInteractionCategory(category);
  return INTERACTION_CATEGORY_LABELS[normalized] ?? normalized;
}

export function getInteractionCategoriesWithIcons() {
  return INTERACTION_CATEGORIES.map(({ value, label }) => ({
    value,
    label,
    icon:
      value === "software" ? "💻" :
      value === "hardware" ? "🎛️" :
      value === "music" ? "🎵" :
      value === "production" ? "🎬" :
      value === "article" ? "📝" : "💬",
  }));
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

export function writeInteractionItems<T>(items: T[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(items));
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
