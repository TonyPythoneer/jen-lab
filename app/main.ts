import { ViteSSG } from "vite-ssg";
import { setupLayouts } from "virtual:generated-layouts";
import { routes } from "vue-router/auto-routes";
import { addCollection } from "@iconify/vue";
import App from "./RootApp.vue";
import "./assets/css/main.css";
// @ts-ignore — no bundled types for JSON icon packs
import lucideData from "@iconify-json/lucide/icons.json";

// Bundle lucide icons so they render in SSG HTML and match client hydration.
// simple-icons (social links in footer) load from Iconify CDN client-side.
addCollection(lucideData);

// vite-ssg wires @unhead/vue internally; pages just call useHead/useSeoMeta.
export const createApp = ViteSSG(App, { routes: setupLayouts(routes) });
