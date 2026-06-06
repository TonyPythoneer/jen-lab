// Replacement for Nuxt's useAppConfig — the old app.config.ts just re-exported
// uiConfig + contacts from config/site. Read straight from the source.
import { uiConfig, contacts } from "~/config/site";

export function useAppConfig() {
  return { ui: uiConfig, contacts };
}
