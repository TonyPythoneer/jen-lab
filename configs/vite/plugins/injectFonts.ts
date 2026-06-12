import type { PluginOption } from "vite-plus";

// The Google Fonts the whole site loads. Add a family here, not in index.html.
const fonts = [
  { family: "Bebas Neue", weights: "wght@400" },
  { family: "Crimson Pro", weights: "ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700" },
  { family: "DM Sans", weights: "wght@400;500;700" },
  { family: "Inter", weights: "wght@400;500;700" },
  { family: "Noto Sans TC", weights: "wght@400;500;700;900" },
  { family: "Noto Serif TC", weights: "wght@400;500;600;700" },
];

// Exported for Storybook's previewHead — both surfaces load the same font set.
export const googleFontsHref = `https://fonts.googleapis.com/css2?${fonts
  .map((f) => `family=${f.family.replace(/ /g, "+")}:${f.weights}`)
  .join("&")}&display=swap`;

// Inject the font <link> at the <!--google-fonts--> marker in index.html at build time.
export function injectFonts(): PluginOption {
  return {
    name: "inject-google-fonts",
    transformIndexHtml(html: string) {
      return html.replace(
        "<!--google-fonts-->",
        `<link rel="stylesheet" href="${googleFontsHref}" />`,
      );
    },
  };
}
