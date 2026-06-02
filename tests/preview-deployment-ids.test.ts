import { describe, it, expect } from "vite-plus/test";
import { previewDeploymentIds } from "../scripts/github/preview-deployment-ids";

const SAMPLE = JSON.stringify([
  { id: "aaa", deployment_trigger: { metadata: { branch: "feat/x" } } },
  { id: "bbb", deployment_trigger: { metadata: { branch: "feat/y" } } },
  { id: "ccc", deployment_trigger: { metadata: { branch: "feat/x" } } },
  { id: "ddd" },
]);

describe("previewDeploymentIds", () => {
  it("returns ids whose deployment branch matches", () => {
    expect(previewDeploymentIds(SAMPLE, "feat/x")).toEqual(["aaa", "ccc"]);
  });

  it("returns an empty array when no branch matches", () => {
    expect(previewDeploymentIds(SAMPLE, "feat/none")).toEqual([]);
  });

  it("skips entries missing the nested branch field", () => {
    expect(previewDeploymentIds(SAMPLE, "feat/y")).toEqual(["bbb"]);
  });

  it("returns an empty array for an empty list", () => {
    expect(previewDeploymentIds("[]", "feat/x")).toEqual([]);
  });
});
