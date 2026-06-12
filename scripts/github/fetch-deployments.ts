// Fetch ALL Cloudflare Pages deployments via the REST API, following pagination.
// (`wrangler pages deployment list` only returns the first ~25 and remaps the keys.)

const API_BASE = "https://api.cloudflare.com/client/v4";

// Cloudflare caps this endpoint at 25 results per page.
const PER_PAGE = 25;

// Stop runaway loops if the API ever misbehaves (25 * 1000 = 25k deployments).
const MAX_PAGES = 1000;

export type RawDeployment = {
  id?: string;
  created_on?: string;
  // "production" | "preview" — set by Cloudflare on every deployment.
  environment?: string;
  // Per-deployment URL, e.g. https://<hash>.jen-lab.pages.dev
  url?: string;
  // Stable branch/custom alias URLs; newest deployment's first alias is the
  // "latest of this branch" link.
  aliases?: string[];
  // Build outcome: status is "success" | "failure" | "building" | etc.
  latest_stage?: { name?: string; status?: string };
  deployment_trigger?: {
    metadata?: { branch?: string; commit_hash?: string; commit_message?: string };
  };
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
// Needs CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN; prints the deployment array as JSON.
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
