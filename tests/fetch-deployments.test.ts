import { describe, expect, it } from "vite-plus/test";
import { fetchAllDeployments } from "../scripts/github/fetch-deployments";

// Build a fake fetch that serves the given pages in order. Each call returns
// the next page; records the URLs it was asked for so we can assert the query.
function pagedFetch(pages: unknown[][], calls: string[] = []) {
  let i = 0;
  const impl = ((url: string) => {
    calls.push(url);
    const result = pages[i] ?? [];
    i++;
    return Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({ success: true, result }),
    });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

const base = { accountId: "acct", apiToken: "tok", projectName: "jen-lab" };

describe("fetchAllDeployments", () => {
  it("follows pagination until a short page", async () => {
    // perPage 2: two full pages then a short one signals the end.
    const { impl, calls } = pagedFetch([
      [{ id: "a" }, { id: "b" }],
      [{ id: "c" }, { id: "d" }],
      [{ id: "e" }],
    ]);
    const all = await fetchAllDeployments({ ...base, perPage: 2, fetchImpl: impl });
    expect(all.map((d) => d.id)).toEqual(["a", "b", "c", "d", "e"]);
    expect(calls.length).toBe(3);
  });

  it("stops after one page when it is already short", async () => {
    const { impl, calls } = pagedFetch([[{ id: "a" }]]);
    const all = await fetchAllDeployments({ ...base, perPage: 25, fetchImpl: impl });
    expect(all.map((d) => d.id)).toEqual(["a"]);
    expect(calls.length).toBe(1);
  });

  it("stops on an exact-full final page followed by an empty page", async () => {
    const { impl, calls } = pagedFetch([[{ id: "a" }, { id: "b" }], []]);
    const all = await fetchAllDeployments({ ...base, perPage: 2, fetchImpl: impl });
    expect(all.map((d) => d.id)).toEqual(["a", "b"]);
    expect(calls.length).toBe(2);
  });

  it("sends env, page and per_page query params", async () => {
    const { impl, calls } = pagedFetch([[{ id: "a" }]]);
    await fetchAllDeployments({ ...base, env: "preview", perPage: 25, fetchImpl: impl });
    expect(calls[0]).toContain("env=preview");
    expect(calls[0]).toContain("page=1");
    expect(calls[0]).toContain("per_page=25");
  });

  it("throws on a non-ok response", async () => {
    const impl = (() =>
      Promise.resolve({
        ok: false,
        status: 403,
        statusText: "Forbidden",
        json: () => Promise.resolve({}),
      })) as unknown as typeof fetch;
    await expect(fetchAllDeployments({ ...base, fetchImpl: impl })).rejects.toThrow(/403/);
  });

  it("throws when the API reports success:false", async () => {
    const impl = (() =>
      Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve({ success: false, errors: [{ message: "nope" }] }),
      })) as unknown as typeof fetch;
    await expect(fetchAllDeployments({ ...base, fetchImpl: impl })).rejects.toThrow(/nope/);
  });
});
