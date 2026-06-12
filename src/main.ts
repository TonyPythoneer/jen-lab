import { ViteSSG } from "vite-ssg";
import { setupLayouts } from "virtual:generated-layouts";
import { routes } from "vue-router/auto-routes";
// Offline entry: no CDN runtime. Every icon must be bundled via addCollection
// below — Icon.vue imports the same offline entry, so nothing fetches at runtime.
import { addCollection } from "@iconify/vue/offline";
import App from "./RootApp.vue";
import "./assets/css/main.css";
// @ts-ignore — generated subsets (scripts/build-icon-subset.ts), no bundled types
import lucideData from "../generated/icons/lucide.json";
// @ts-ignore
import simpleIconsData from "../generated/icons/simple-icons.json";
// @ts-ignore
import streamlineFreehandData from "../generated/icons/streamline-freehand.json";

// Bundle the used icons so they render in SSG HTML and match client hydration.
// The subsets are built from the source by scripts/build-icon-subset.ts, which
// fails the build if a referenced icon is missing (offline mode has no fallback).
addCollection(lucideData);
addCollection(simpleIconsData);
addCollection(streamlineFreehandData);

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
