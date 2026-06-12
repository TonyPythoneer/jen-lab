// Keeps generated/icons/*.json in sync with the icons the source references —
// regenerates at build start and on dev-time source changes.
// A missing icon throws: offline rendering has no CDN fallback, so a typo must
// fail the build rather than ship an invisible gap.
import type { PluginOption } from "vite-plus";
import { runIconCodegen } from "../../../scripts/lib/iconSubset";

function generate(log: (msg: string) => void): void {
  const { regenerated, written, missing } = runIconCodegen();
  if (missing.length) {
    throw new Error(
      `[codegen-icons] referenced icons missing from their pack: ${missing.join(", ")}`,
    );
  }
  if (regenerated) {
    log(`[codegen-icons] ${written.map((w) => `${w.prefix} ${w.count}`).join(", ")}`);
  }
}

export function codegenIcons(): PluginOption {
  let ranInProcess = false;
  return {
    name: "codegen-icons",
    buildStart() {
      if (ranInProcess) return;
      generate((m) => console.log(m));
      ranInProcess = true;
    },
    configureServer(server) {
      const log = (m: string) => server.config.logger.info(m);
      let timer: ReturnType<typeof setTimeout> | undefined;
      const onChange = (file: string) => {
        const f = file.replace(/\\/g, "/");
        // Only react to scannable source files; skip our own output to avoid a loop.
        if (!/\/(src|content)\//.test(f) || f.includes("/generated/")) return;
        if (!/\.(vue|ts|md|ya?ml|json)$/.test(f)) return;
        // Coalesce bursts (save-all, git checkout) into one regen.
        clearTimeout(timer);
        timer = setTimeout(() => {
          try {
            generate(log);
          } catch (err) {
            server.config.logger.error(String(err));
          }
        }, 100);
      };
      server.watcher.on("change", onChange);
      server.watcher.on("add", onChange);
      server.watcher.on("unlink", onChange);
    },
  };
}
