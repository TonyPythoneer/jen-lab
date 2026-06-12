import { home } from "#velite";

// Shared data + SEO wiring for /jen-knows and /jen-liu — identical routes except
// slug and head title; each route file keeps its own template.
export function useProfileRoute(opts: { slug: "jen-knows" | "jen-liu"; headTitle: string }) {
  const page = computed(() => home.find((r) => r.path === `/home/${opts.slug}`));

  useHead({ title: opts.headTitle });

  const seoDescription = computed(() => page.value?.profile.tabs[0]?.bio ?? "");
  useSeoMeta({
    description: seoDescription,
    ogTitle: opts.headTitle,
    ogDescription: seoDescription,
    ogImage: `/home/${opts.slug}/avatar.webp`,
    twitterCard: "summary",
  });

  return { page };
}
