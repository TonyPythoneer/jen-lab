// Brand tokens consumed by the 3D scene. Names mirror --color-* in theme.css.
export const BRAND_TOKENS = [
  "basalt-canvas",
  "ash-white",
  "abyssal-ink",
  "pure-white",
  "digital-orange",
  "cyber-violet",
  "pixel-glare",
  "sydney-sky",
] as const;

export type BrandToken = (typeof BRAND_TOKENS)[number];
export type BrandPalette = Record<BrandToken, string>;

// Three.js can't read CSS vars, so resolve them once to hex. `read` is injected
// for testability; the runtime helper reads from the document root.
export function resolveBrandPalette(read: (varName: string) => string): BrandPalette {
  const out = {} as BrandPalette;
  for (const token of BRAND_TOKENS) out[token] = (read(`--color-${token}`) || "").trim() || "#000000";
  return out;
}

export function readCssVarsFromDocument(): BrandPalette {
  const style = getComputedStyle(document.documentElement);
  return resolveBrandPalette((v) => style.getPropertyValue(v));
}
