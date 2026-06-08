import { home } from "#velite";

// Shared data + SEO wiring for the two profile routes (/jen-knows, /jen-liu),
// which are identical except for the slug and the head title. Each route file
// keeps its own template (brand + display name) and calls this for the rest.
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
