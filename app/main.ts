import { ViteSSG } from "vite-ssg";
import { setupLayouts } from "virtual:generated-layouts";
import { routes } from "vue-router/auto-routes";
import App from "./RootApp.vue";
import "./assets/css/main.css";

// vite-ssg wires @unhead/vue internally; pages just call useHead/useSeoMeta.
export const createApp = ViteSSG(App, { routes: setupLayouts(routes) });
