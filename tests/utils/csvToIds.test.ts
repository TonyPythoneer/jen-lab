import { describe, it, expect } from "vite-plus/test";
import { csvToIds } from "~/utils/csvToIds";

describe("csvToIds", () => {
  it("parses a comma-separated id list", () => {
    expect(csvToIds("1,2,3")).toEqual([1, 2, 3]);
  });

  it("drops zero, negatives and floats", () => {
    expect(csvToIds("0,-1,2,3.5,4")).toEqual([2, 4]);
  });

  it("drops non-numeric garbage", () => {
    expect(csvToIds("1,abc,,2")).toEqual([1, 2]);
  });

  it("returns [] for empty string", () => {
    expect(csvToIds("")).toEqual([]);
  });

  it("returns [] for non-string input", () => {
    expect(csvToIds(undefined)).toEqual([]);
    expect(csvToIds(123)).toEqual([]);
    expect(csvToIds(["1", "2"])).toEqual([]);
  });
});
