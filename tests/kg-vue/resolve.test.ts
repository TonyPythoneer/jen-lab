import { describe, expect, it } from "vite-plus/test";
import { resolveSpecifier } from "../../scripts/kg-vue/resolve";

describe("resolveSpecifier", () => {
  // pretend these files exist
  const exists = (rel: string) =>
    ["src/lib/utils.ts", "src/components/blog/PostCard.vue", "src/shared/foo.ts"].includes(rel);

  it("resolves ~/ alias and adds the .ts extension", () => {
    expect(resolveSpecifier("~/lib/utils", "src/pages/index.vue", exists)).toBe("src/lib/utils.ts");
  });

  it("resolves a relative import to a .vue file", () => {
    expect(resolveSpecifier("../components/blog/PostCard.vue", "src/pages/x.ts", exists)).toBe(
      "src/components/blog/PostCard.vue",
    );
  });

  it("maps known virtual aliases to their generated targets", () => {
    expect(resolveSpecifier("#food-map-data", "src/x.ts", exists)).toBe(
      "generated/velite/foodMap.json",
    );
  });

  it("returns null for bare npm specifiers", () => {
    expect(resolveSpecifier("vue", "src/x.ts", exists)).toBeNull();
    expect(resolveSpecifier("leaflet", "src/x.ts", exists)).toBeNull();
  });
});
