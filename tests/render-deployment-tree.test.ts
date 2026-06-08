import { describe, expect, it } from "vite-plus/test";
import { renderDeploymentTree } from "../scripts/github/render-deployment-tree";

const NOW = "2026-06-08T10:00:00Z";

function dep(over: Record<string, unknown> = {}) {
  return {
    id: (over.id as string) ?? "id",
    created_on: (over.created_on as string) ?? "2026-06-08T08:00:00Z",
    environment: (over.environment as string) ?? "preview",
    url: (over.url as string) ?? "https://hash.jen-lab.pages.dev",
    aliases: (over.aliases as string[]) ?? ["https://branch.jen-lab.pages.dev"],
    latest_stage: { status: (over.status as string) ?? "success" },
    deployment_trigger: {
      metadata: {
        branch: (over.branch as string) ?? "main",
        commit_hash: (over.commit_hash as string) ?? "abcdef1234567",
        commit_message: (over.commit_message as string) ?? "do a thing",
      },
    },
  };
}

describe("renderDeploymentTree", () => {
  it("orders protected branches first, then by recency", () => {
    const out = renderDeploymentTree(
      [
        dep({ branch: "feat/x", created_on: "2026-06-08T09:00:00Z" }),
        dep({ branch: "main", created_on: "2026-06-08T07:00:00Z" }),
        dep({ branch: "develop", created_on: "2026-06-08T06:00:00Z" }),
      ],
      { generatedAt: NOW },
    );
    expect(out.indexOf("📦 main")).toBeLessThan(out.indexOf("📦 develop"));
    expect(out.indexOf("📦 develop")).toBeLessThan(out.indexOf("📦 feat/x"));
  });

  it("renders status icons per latest_stage.status", () => {
    const out = renderDeploymentTree(
      [
        dep({ status: "success", commit_hash: "aaaaaaa" }),
        dep({ status: "failure", commit_hash: "bbbbbbb", created_on: "2026-06-08T07:00:00Z" }),
        dep({ status: "building", commit_hash: "ccccccc", created_on: "2026-06-08T06:00:00Z" }),
      ],
      { generatedAt: NOW },
    );
    expect(out).toContain("✅ aaaaaaa");
    expect(out).toContain("❌ bbbbbbb");
    expect(out).toContain("🏗️ ccccccc");
  });

  it("includes short commit, message first line, env tag, and url", () => {
    const out = renderDeploymentTree(
      [
        dep({
          environment: "production",
          commit_hash: "1234567abcdef",
          commit_message: "fix: gallery\n\nlong body",
          url: "https://x.jen-lab.pages.dev",
        }),
      ],
      { generatedAt: NOW },
    );
    expect(out).toContain("1234567");
    expect(out).not.toContain("1234567abcdef");
    expect(out).toContain("fix: gallery");
    expect(out).not.toContain("long body");
    expect(out).toContain("· prod ·");
    expect(out).toContain("https://x.jen-lab.pages.dev");
  });

  it("handles missing branch, status, and commit message", () => {
    const out = renderDeploymentTree([{ id: "x1" }], { generatedAt: NOW });
    expect(out).toContain("📦 (unknown)");
    expect(out).toContain("🏗️");
    expect(() => renderDeploymentTree([{ id: "x2" }], { generatedAt: NOW })).not.toThrow();
  });

  it("truncates to stay under maxChars and notes the omissions", () => {
    const many = Array.from({ length: 50 }, (_, i) =>
      dep({ id: `id${i}`, branch: `feat/branch-${i}`, commit_message: "x".repeat(40) }),
    );
    const out = renderDeploymentTree(many, { generatedAt: NOW, maxChars: 1500 });
    expect(out.length).toBeLessThanOrEqual(1500);
    expect(out).toContain("omitted (comment size limit)");
  });

  it("renders a friendly body for no deployments", () => {
    const out = renderDeploymentTree([], { generatedAt: NOW });
    expect(out).toContain("Total **0**");
    expect(out).toContain("No deployments found");
  });
});
