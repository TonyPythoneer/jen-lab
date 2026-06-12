import { readFileSync } from "node:fs";

type Deployment = {
  id?: string;
  deployment_trigger?: { metadata?: { branch?: string } };
};

export function previewDeploymentIds(json: string, branch: string): string[] {
  const list = JSON.parse(json) as Deployment[];
  return list
    .filter((d) => d.deployment_trigger?.metadata?.branch === branch)
    .map((d) => d.id)
    .filter((id): id is string => typeof id === "string");
}

// CLI: `node --experimental-strip-types scripts/github/preview-deployment-ids.ts <json-file> <branch>`
// Prints one matching deployment id per line.
if (process.argv[1]?.endsWith("preview-deployment-ids.ts")) {
  const [, , path, branch] = process.argv;
  if (!path || !branch) {
    console.error("usage: preview-deployment-ids.ts <json-file> <branch>");
    process.exit(1);
  }
  const ids = previewDeploymentIds(readFileSync(path, "utf8"), branch);
  if (ids.length > 0) process.stdout.write(`${ids.join("\n")}\n`);
}
