import type { Category } from "~/composables/food-map/useRestaurants";

// English names for the category list drawer (Chinese names are in categories.ts)
export const CATEGORY_EN: Record<string, string> = {
  steakhouse: "Steakhouse",
  fine_dining: "Fine Dining",
  thai: "Thai",
  korean: "Korean",
  japanese: "Japanese",
  chinese: "Chinese",
  taiwanese: "Taiwanese",
  malaysian: "Malaysian",
  french: "French",
  italian: "Italian",
  spanish: "Spanish",
  middle_eastern: "Middle Eastern",
  dessert: "Dessert",
  coffee: "Coffee",
  bar: "Bar",
  bubble_tea: "Bubble Tea",
};

// Emoji glyph for each category (flags for national cuisines, food icon for types)
export const CATEGORY_ICON: Record<string, string> = {
  steakhouse: "🥩",
  fine_dining: "🍷",
  thai: "🇹🇭",
  korean: "🇰🇷",
  japanese: "🇯🇵",
  chinese: "🇨🇳",
  taiwanese: "🇹🇼",
  malaysian: "🇲🇾",
  french: "🇫🇷",
  italian: "🇮🇹",
  spanish: "🇪🇸",
  middle_eastern: "🧆",
  dessert: "🍰",
  coffee: "☕",
  bar: "🍸",
  bubble_tea: "🧋",
};

export function categoryGlyph(c: Category): string {
  return CATEGORY_ICON[c.id] ?? c.name.charAt(0);
}
