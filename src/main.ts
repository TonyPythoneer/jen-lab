import { ViteSSG } from "vite-ssg";
import { setupLayouts } from "virtual:generated-layouts";
import { routes } from "vue-router/auto-routes";
import { addCollection } from "@iconify/vue";
import App from "./RootApp.vue";
import "./assets/css/main.css";
// @ts-ignore — generated subset (scripts/build-icon-subset.ts), no bundled types
import lucideData from "../generated/icons/lucide.json";

// Bundle the used lucide icons so they render in SSG HTML and match client
// hydration. The set is built from the source by scripts/build-icon-subset.ts;
// any icon it misses still renders, falling back to the Iconify CDN at runtime
// (the same path simple-icons social links already take).
addCollection(lucideData);

// vite-ssg wires @unhead/vue internally; pages just call useHead/useSeoMeta.
export const createApp = ViteSSG(App, {
  routes: setupLayouts(routes),
  // SPA nav keeps the old scroll position by default. Reset to top on a fresh
  // navigation, jump to a #hash target when present, and restore the saved
  // position on back/forward.
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
});
