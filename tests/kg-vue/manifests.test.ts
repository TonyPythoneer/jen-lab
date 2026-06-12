import { describe, expect, it } from "vite-plus/test";
import {
  normalizeDtsPath,
  parseDtsImports,
  parseRouteFileInfo,
} from "../../scripts/kg-vue/manifests";

describe("parseDtsImports", () => {
  it("reads a component name -> .vue path", () => {
    const dts = `    Button: typeof import('./src/components/ui/element/Button.vue')['default']`;
    expect(parseDtsImports(dts).get("Button")).toBe("./src/components/ui/element/Button.vue");
  });

  it("reads an auto-import composable name -> source module", () => {
    const dts = `  const createRiverBoats: typeof import('./src/composables/food-map/useRiverBoats').createRiverBoats`;
    expect(parseDtsImports(dts).get("createRiverBoats")).toBe(
      "./src/composables/food-map/useRiverBoats",
    );
  });

  it("keeps external module paths verbatim (caller filters them out later)", () => {
    expect(parseDtsImports(`  const ref: typeof import('vue').ref`).get("ref")).toBe("vue");
  });
});

describe("parseRouteFileInfo", () => {
  const dts = `
  export interface _RouteFileInfoMap {
    'src/pages/index.vue': {
      routes:
        | '/'
      views:
        | never
      pathParamNames:
        | never
    }
    'src/pages/blogs/[...slug].vue': {
      routes:
        | '/blogs/[...slug]'
      views:
        | never
      pathParamNames:
        | 'slug'
    }
  }`;

  it("maps page file -> route names", () => {
    const map = parseRouteFileInfo(dts);
    expect(map.get("src/pages/index.vue")).toEqual(["/"]);
    expect(map.get("src/pages/blogs/[...slug].vue")).toEqual(["/blogs/[...slug]"]);
  });

  it("does not capture param names or 'never' as routes", () => {
    const map = parseRouteFileInfo(dts);
    expect(map.get("src/pages/blogs/[...slug].vue")).not.toContain("slug");
  });
});

describe("normalizeDtsPath", () => {
  it("strips a leading ./", () => {
    expect(normalizeDtsPath("./src/lib/utils")).toBe("src/lib/utils");
  });
});
