<script setup lang="ts">
useSeoMeta({
  title: "Jen Lab — The Living Lab Of Jen",
  description:
    "A personal sandbox where ideas, restaurants and writing share one harbour. Brewed in Sydney, served everywhere.",
  ogTitle: "Jen Lab — The Living Lab Of Jen",
  ogDescription: "A personal sandbox where ideas, restaurants and writing share one harbour.",
  ogType: "website",
  // TODO: ogImage — Jen to supply 1200×630 og asset.
});
</script>

<template>
  <SitePageContainer breakout>
    <!-- Hero -->
    <HomeSectionHero />

    <!-- Stats -->
    <HomeSectionStats />

    <!-- Products dots preview (radial fade pattern) -->
    <HomeSectionProductDots />

    <!-- Features: 2×2 diagonal layout -->
    <HomeSectionFeatures />

    <!-- Bringing The Harbour Online -->
    <HomeSectionBringing />

    <!-- Use-case tabs -->
    <HomeSectionUseCases />

    <!-- Built On — tech stack card grid -->
    <HomeSectionBuiltOn />

    <!-- Testimonials -->
    <HomeSectionTestimonials />

    <!-- Blog carousel (full-bleed: carousel peeks beyond 1200px) -->
    <HomeSectionBlog class="full-bleed" />

    <!-- Join The jen-lab Community -->
    <HomeSectionCommunity />

    <!-- Get In Touch -->
    <HomeSectionContact />

    <!-- Newsletter band -->
    <HomeSectionNewsletter />
  </SitePageContainer>
</template>
