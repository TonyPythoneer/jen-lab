import { describe, it, expect } from "vite-plus/test";
import { resolveBrandPalette, BRAND_TOKENS } from "~/utils/food-map/brandPalette";

describe("resolveBrandPalette", () => {
  it("maps each token to its --color-<token> value, trimmed", () => {
    const fake = (v: string) => (v === "--color-sydney-sky" ? "  #87ceeb " : "#000000");
    const palette = resolveBrandPalette(fake);
    expect(palette["sydney-sky"]).toBe("#87ceeb");
  });
  it("covers every brand token", () => {
    const palette = resolveBrandPalette(() => "#123456");
    for (const t of BRAND_TOKENS) expect(palette[t]).toBe("#123456");
  });
});
