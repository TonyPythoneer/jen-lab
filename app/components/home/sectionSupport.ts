export type SupportBrand = "jen-liu" | "jen-knows";

export interface SupportLink {
  brand: SupportBrand;
  label: string;
  url: string;
}

export const SUPPORTS: readonly SupportLink[] = [
  { brand: "jen-knows", label: "支持 Jen Knows", url: "https://portaly.cc/jenknowsau/support" },
  { brand: "jen-liu", label: "支持 Jen Liu", url: "https://portaly.cc/jenliuau/support" },
];

// Pick which support buttons to show: one brand only, or all when no brand is given.
export function visibleSupports(brand?: SupportBrand): readonly SupportLink[] {
  return brand ? SUPPORTS.filter((s) => s.brand === brand) : SUPPORTS;
}
