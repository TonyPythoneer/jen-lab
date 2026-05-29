import { describe, it, expect } from "vite-plus/test";
import { visibleSupports } from "~/components/home/sectionSupport";

describe("visibleSupports", () => {
  it("returns both brands when no brand is given", () => {
    const labels = visibleSupports().map((s) => s.label);
    expect(labels).toHaveLength(2);
    expect(labels).toContain("支持 Jen Knows");
    expect(labels).toContain("支持 Jen Liu");
  });

  it("returns only Jen Liu for brand=jen-liu", () => {
    const r = visibleSupports("jen-liu");
    expect(r).toHaveLength(1);
    expect(r[0]!.label).toBe("支持 Jen Liu");
  });

  it("returns only Jen Knows for brand=jen-knows", () => {
    const r = visibleSupports("jen-knows");
    expect(r).toHaveLength(1);
    expect(r[0]!.label).toBe("支持 Jen Knows");
  });
});
