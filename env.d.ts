/// <reference types="vite-plus/client" />
/// <reference types="vite-plugin-vue-layouts-next/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
