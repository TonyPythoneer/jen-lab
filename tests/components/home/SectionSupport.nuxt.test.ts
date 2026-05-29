import { describe, it, expect } from "vite-plus/test";

describe("SectionSupport brand prop logic", () => {
  it("supports filtering buttons based on brand prop", () => {
    type Brand = "jen-liu" | "jen-knows";
    interface Support {
      brand: Brand;
      label: string;
      url: string;
    }

    const SUPPORTS: Support[] = [
      {
        brand: "jen-knows",
        label: "支持 Jen Knows",
        url: "https://portaly.cc/jenknowsau/support",
      },
      {
        brand: "jen-liu",
        label: "支持 Jen Liu",
        url: "https://portaly.cc/jenliuau/support",
      },
    ];

    const createVisibleSupports = (brand?: Brand) =>
      brand ? SUPPORTS.filter((s) => s.brand === brand) : SUPPORTS;

    // Test: no brand — show both
    const noBrand = createVisibleSupports();
    expect(noBrand).toHaveLength(2);
    expect(noBrand.map((s) => s.label)).toContain("支持 Jen Knows");
    expect(noBrand.map((s) => s.label)).toContain("支持 Jen Liu");

    // Test: brand=jen-liu — show only Jen Liu
    const brandJenLiu = createVisibleSupports("jen-liu");
    expect(brandJenLiu).toHaveLength(1);
    expect(brandJenLiu[0]!.label).toBe("支持 Jen Liu");

    // Test: brand=jen-knows — show only Jen Knows
    const brandJenKnows = createVisibleSupports("jen-knows");
    expect(brandJenKnows).toHaveLength(1);
    expect(brandJenKnows[0]!.label).toBe("支持 Jen Knows");
  });
});
