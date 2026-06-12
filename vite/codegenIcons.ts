// Vite plugin: keeps generated/icons/*.json in sync with the icons the source
// actually references — no more `pnpm gen:icons &&` in front of build/dev.
//
// - build: generates once (the SSR + client passes share one process, so the
//   in-memory guard makes the second a no-op; a repeat `pnpm build` is skipped
//   by the persistent fingerprint cache).
// - dev: generates at startup, then regenerates when a source file's icon
//   references change. Writes only on a real change, so unrelated saves stay
//   quiet and don't churn main.ts's static JSON import.
//
// A referenced icon missing from its pack throws — offline rendering has no CDN
// fallback, so a typo must fail the build rather than ship an invisible gap.
import type { PluginOption } from "vite-plus";
import { runIconCodegen } from "../scripts/lib/iconSubset";

// Returns true when it (re)generated, false when the cache was already fresh.
function generate(log: (msg: string) => void): boolean {
  const { regenerated, written, missing } = runIconCodegen();
  if (missing.length) {
    throw new Error(
      `[codegen-icons] referenced icons missing from their pack: ${missing.join(", ")}`,
    );
  }
  if (regenerated) {
    log(`[codegen-icons] ${written.map((w) => `${w.prefix} ${w.count}`).join(", ")}`);
  }
  return regenerated;
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
