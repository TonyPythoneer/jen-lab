import { defineCollection, s } from "velite";
import MarkdownIt from "markdown-it";
// @ts-expect-error — no types published for this plugin
import linkAttrs from "markdown-it-link-attributes";
import { iconName, prefixPath } from "./shared";

// markdown-it instance for product descriptions. Renders descriptionHtml at
// build time so the client ships no markdown parser. Keep settings stable to
// keep descriptionHtml byte-identical across rebuilds.
const md = new MarkdownIt({ html: false, linkify: true, breaks: true }).use(linkAttrs, {
  matcher: (href: string) => /^https?:/.test(href),
  attrs: { target: "_blank", rel: "noopener" },
});

const portalListSection = s.object({
  id: s.string(),
  label: s.string(),
  component: s.literal("portal-list"),
  portals: s.array(
    s.object({ to: s.string(), icon: iconName, title: s.string(), brief: s.string() }),
  ),
});

const youtubeGallerySection = s.object({
  id: s.string(),
  label: s.string(),
  component: s.literal("youtube-gallery"),
  galleries: s.array(
    s.object({
      id: s.string(),
      label: s.string().optional(),
      videos: s.array(s.object({ id: s.string(), title: s.string() })),
    }),
  ),
});

const imageGallerySection = s.object({
  id: s.string(),
  label: s.string(),
  component: s.literal("image-gallery"),
  galleries: s.array(
    s.object({ id: s.string(), label: s.string().optional(), images: s.array(s.string()) }),
  ),
});

// product.descriptionHtml rendered at build, same as the old afterParse hook.
const productListSection = s.object({
  id: s.string(),
  label: s.string(),
  component: s.literal("product-list"),
  products: s.array(
    s
      .object({
        banner: s.string(),
        title: s.string(),
        description: s.string(),
        descriptionHtml: s.string().optional(),
        purchaseUrl: s.string(),
      })
      .transform((product) => ({ ...product, descriptionHtml: md.render(product.description) })),
  ),
});

export const home = defineCollection({
  name: "home",
  pattern: "home/*.md",
  schema: s
    .object({
      path: s.path(),
      profile: s.object({
        avatar: s.string(),
        name: s.string(),
        tabs: s.array(s.object({ label: s.string(), bio: s.string() })),
      }),
      sections: s.array(
        s.union([
          portalListSection,
          youtubeGallerySection,
          imageGallerySection,
          productListSection,
        ]),
      ),
    })
    .transform(prefixPath),
});
