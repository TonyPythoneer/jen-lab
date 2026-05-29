// @ts-expect-error - Storybook types not fully resolving in this context
import type { Preview } from "@storybook/vue3";
// @ts-expect-error - Storybook types not fully resolving in this context
import { setup } from "@storybook/vue3";
import { h, type App } from "vue";
import ui from "@nuxt/ui/vue-plugin";
// @ts-expect-error - CSS import resolution in Storybook context
import "../app/assets/css/main.css";

// Minimal stand-ins for Nuxt's built-in components.
const NuxtLink = {
  props: { to: { type: [String, Object], default: "#" } },
  setup(props: any, { slots }: any) {
    const href = typeof props.to === "string" ? props.to : "#";
    return () => h("a", { href }, slots.default?.());
  },
};
const NuxtImg = {
  inheritAttrs: false,
  props: { src: String, alt: String },
  setup(props: any, { attrs }: any) {
    return () => h("img", { ...attrs, src: props.src, alt: props.alt });
  },
};
const ClientOnly = {
  setup(_: any, { slots }: any) {
    return () => slots.default?.();
  },
};

setup((app: App) => {
  app.use(ui);
  app.component("NuxtLink", NuxtLink);
  app.component("NuxtImg", NuxtImg);
  app.component("NuxtPicture", NuxtImg);
  app.component("ClientOnly", ClientOnly);
});

const preview: Preview = {
  decorators: [
    (story: any) => ({ components: { story }, template: '<UApp class="isolate"><story /></UApp>' }),
  ],
  parameters: {
    layout: "fullscreen",
    viewport: {
      options: {
        mobile: { name: "Mobile", styles: { width: "390px", height: "844px" } },
        desktop: { name: "Desktop", styles: { width: "1440px", height: "900px" } },
      },
    },
  },
  initialGlobals: { viewport: { value: "desktop", isRotated: false } },
};

export default preview;
