// Fetch ALL Cloudflare Pages deployments for a project, following pagination.
//
// Why not `wrangler pages deployment list`? Two reasons, both fatal for cleanup:
//   1. It returns only the first page (~25) — no pagination — so older
//      deployments are never seen.
//   2. Its `--json` output remaps keys to {Id, Branch, ...} and drops
//      created_on, which the cleanup scripts cannot read.
// The raw REST API returns the full, raw deployment objects the scripts expect.

const API_BASE = "https://api.cloudflare.com/client/v4";

// Cloudflare caps this endpoint at 25 results per page.
const PER_PAGE = 25;

// Stop runaway loops if the API ever misbehaves (25 * 1000 = 25k deployments).
const MAX_PAGES = 1000;

export type RawDeployment = {
  id?: string;
  created_on?: string;
  environment?: string;
  deployment_trigger?: { metadata?: { branch?: string } };
};

type ApiResponse = {
  success: boolean;
  errors?: unknown;
  result?: RawDeployment[];
};

export async function fetchAllDeployments(opts: {
  accountId: string;
  apiToken: string;
  projectName: string;
  // "production" | "preview" | undefined (undefined = both environments)
  env?: string;
  perPage?: number;
  fetchImpl?: typeof fetch;
}): Promise<RawDeployment[]> {
  const perPage = opts.perPage ?? PER_PAGE;
  const doFetch = opts.fetchImpl ?? fetch;
  const all: RawDeployment[] = [];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const url = new URL(
      `${API_BASE}/accounts/${opts.accountId}/pages/projects/${opts.projectName}/deployments`,
    );
    if (opts.env) url.searchParams.set("env", opts.env);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));

    const res = await doFetch(url.toString(), {
      headers: { Authorization: `Bearer ${opts.apiToken}` },
    });
    if (!res.ok) {
      throw new Error(`Cloudflare API returned ${res.status} ${res.statusText} on page ${page}`);
    }

    const body = (await res.json()) as ApiResponse;
    if (!body.success) {
      throw new Error(`Cloudflare API error: ${JSON.stringify(body.errors)}`);
    }

    const batch = body.result ?? [];
    all.push(...batch);

    // A short page is the last page.
    if (batch.length < perPage) break;
  }

  return all;
}

// CLI: `node --experimental-strip-types scripts/github/fetch-deployments.ts <project-name> [environment]`
// Reads CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN from the environment.
// Prints the full deployment array as JSON to stdout.
if (process.argv[1]?.endsWith("fetch-deployments.ts")) {
  const [, , projectName, env] = process.argv;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!projectName || !accountId || !apiToken) {
    console.error("usage: fetch-deployments.ts <project-name> [environment]");
    console.error("requires CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN env vars");
    process.exit(1);
  }

  (async () => {
    const deployments = await fetchAllDeployments({
      accountId,
      apiToken,
      projectName,
      env: env || undefined,
    });
    process.stdout.write(JSON.stringify(deployments));
  })().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
