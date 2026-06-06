import { defineCollection, defineConfig, s } from "velite";
import MarkdownIt from "markdown-it";
// @ts-expect-error — no types published for this plugin
import linkAttrs from "markdown-it-link-attributes";

// EXACT replica of the markdown-it instance in the old nuxt.config.ts
// (content:file:afterParse hook). Keeps descriptionHtml byte-identical.
const md = new MarkdownIt({ html: false, linkify: true, breaks: true }).use(linkAttrs, {
  matcher: (href: string) => /^https?:/.test(href),
  attrs: { target: "_blank", rel: "noopener" },
});

const portalListSection = s.object({
  id: s.string(),
  label: s.string(),
  component: s.literal("portal-list"),
  portals: s.array(
    s.object({ to: s.string(), icon: s.string(), title: s.string(), brief: s.string() }),
  ),
});

const youtubeCarouselSection = s.object({
  id: s.string(),
  label: s.string(),
  component: s.literal("youtube-carousel"),
  carousels: s.array(
    s.object({
      id: s.string(),
      label: s.string().optional(),
      videos: s.array(s.object({ id: s.string(), title: s.string() })),
    }),
  ),
});

const imageCarouselSection = s.object({
  id: s.string(),
  label: s.string(),
  component: s.literal("image-carousel"),
  carousels: s.array(
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

const home = defineCollection({
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
          youtubeCarouselSection,
          imageCarouselSection,
          productListSection,
        ]),
      ),
    })
    // @nuxt/content "page" path: content/home/jen-knows.md -> /home/jen-knows
    .transform((data) => ({ ...data, path: "/" + data.path })),
});

const pagesLayout = defineCollection({
  name: "pagesLayout",
  pattern: "pages-layout/*.md",
  schema: s
    .object({
      path: s.path(),
      seo: s
        .object({
          title: s.string(),
          description: s.string(),
          ogTitle: s.string(),
          ogDescription: s.string(),
        })
        .optional(),
      sections: s.array(
        s.union([
          s.object({
            component: s.literal("section-hero"),
            headline: s.string().optional(),
            headlineAccent: s.string().optional(),
            subheadingLines: s.array(s.string()).optional(),
            marqueeItems: s.array(s.string()).optional(),
            portraitKnowsSrc: s.string().optional(),
            portraitLiuSrc: s.string().optional(),
          }),
          s.object({
            component: s.literal("section-directions"),
            heading: s.string().optional(),
            headingAccent: s.string().optional(),
            cards: s
              .array(
                s.object({
                  title: s.string(),
                  subtitle: s.string(),
                  description: s.string(),
                  ctaLabel: s.string(),
                  ctaTo: s.string(),
                  imageSrc: s.string(),
                  imageAlt: s.string(),
                  colorKey: s.enum(["violet", "orange"]),
                }),
              )
              .optional(),
          }),
          s.object({
            component: s.literal("section-blog"),
            postCount: s.number().optional(),
            spinDuration: s.number().optional(),
            heading: s.string().optional(),
            ctaLabel: s.string().optional(),
          }),
          s.object({
            component: s.literal("section-newsletter"),
            headline: s.string().optional(),
            accentLines: s.array(s.string()).optional(),
            subheading: s.string().optional(),
            buttonLabel: s.string().optional(),
            subscriptionUrl: s.string().optional(),
          }),
          s.object({ component: s.literal("section-support") }),
        ]),
      ),
    })
    .transform((data) => ({ ...data, path: "/" + data.path })),
});

const site = defineCollection({
  name: "site",
  pattern: "site/header.yml",
  schema: s.object({
    nav: s.array(s.object({ label: s.string(), to: s.string() })),
  }),
});

const siteBlogs = defineCollection({
  name: "siteBlogs",
  pattern: "site/blogs.yml",
  schema: s.object({
    listPage: s.object({
      title: s.string(),
      subtitle: s.string(),
      loadingErrorMessage: s.string(),
      loadingErrorRetryButton: s.string(),
      noResultsMessage: s.string(),
      seoTitle: s.string(),
      seoDescription: s.string(),
    }),
    detailPage: s.object({
      backLink: s.string(),
      loadingMessage: s.string(),
      notFoundMessage: s.string(),
      seoTitleTemplate: s.string(),
    }),
    search: s.object({
      placeholder: s.string(),
      categoryLabel: s.string(),
      tagLabel: s.string(),
    }),
    postCard: s.object({
      newBadgeText: s.string(),
      newPostDaysThreshold: s.number(),
    }),
  }),
});

const wpTags = defineCollection({
  name: "wpTags",
  pattern: "wp/tags/*.yaml",
  schema: s.object({
    wpId: s.number(),
    slug: s.string(),
    name: s.string(),
    count: s.number(),
  }),
});

const wpCategories = defineCollection({
  name: "wpCategories",
  pattern: "wp/categories/*.yaml",
  schema: s.object({
    wpId: s.number(),
    slug: s.string(),
    name: s.string(),
    children: s
      .array(s.object({ wpId: s.number(), slug: s.string(), name: s.string() }))
      .optional(),
  }),
});

export default defineConfig({
  root: "content",
  output: { data: "generated/velite", assets: "public/static", base: "/static/", clean: true },
  collections: { home, pagesLayout, site, siteBlogs, wpTags, wpCategories },
});
