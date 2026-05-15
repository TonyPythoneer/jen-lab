import { describe, it, expect } from "vite-plus/test";
import { stripHtml, formatDate } from "~/utils/wpApi";

describe("stripHtml", () => {
  it("removes tags and trims", () => {
    expect(stripHtml("  <p>Hello <b>world</b></p>  ")).toBe("Hello world");
  });

  it("leaves plain text untouched", () => {
    expect(stripHtml("just text")).toBe("just text");
  });

  it("strips self-closing and attributed tags", () => {
    expect(stripHtml('<img src="x" />text<br/>')).toBe("text");
  });
});

describe("formatDate", () => {
  it("formats an ISO date in zh-TW long form", () => {
    expect(formatDate("2026-05-14T00:00:00")).toBe("2026年5月14日");
  });
});
