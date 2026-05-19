<script setup lang="ts">
const appConfig = useAppConfig();
const socials = appConfig.contacts ?? [];

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Restaurants", to: "/my-best-restaurants-search-in-sydney" },
  { label: "Blogs", to: "/blogs" },
  { label: "About", to: "/about" },
  { label: "Brand Kit", to: "#" },
  { label: "Now", to: "#" },
  { label: "Uses", to: "#" },
];
</script>

<template>
  <!-- container matches body's max-w-[1200px] px-4 so columns align with page content -->
  <footer
    class="container mx-auto max-w-[1200px] grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-2.5 px-4 pb-2.5"
  >
    <!-- Left: dark brand card -->
    <div
      class="relative bg-abyssal-ink text-pure-white rounded-card p-10 flex flex-col justify-between gap-10 min-h-[360px] overflow-hidden"
    >
      <!-- Dark-radial dotfield: pixel-glare dots fading from top-right corner -->
      <HomeBackgroundDots
        color="var(--color-pixel-glare)"
        :size="2"
        :spacing="28"
        :opacity="1"
        style="
          mask-image: radial-gradient(
            ellipse 70% 70% at 90% 10%,
            rgba(0, 0, 0, 0.22) 0%,
            rgba(0, 0, 0, 0.08) 55%,
            transparent 100%
          );
          -webkit-mask-image: radial-gradient(
            ellipse 70% 70% at 90% 10%,
            rgba(0, 0, 0, 0.22) 0%,
            rgba(0, 0, 0, 0.08) 55%,
            transparent 100%
          );
        "
      />
      <!-- Brand mark + wordmark -->
      <NuxtLink to="/" class="flex items-center gap-2.5 w-fit">
        <span class="size-6 bg-digital-orange rounded-sm shrink-0" />
        <span class="font-display tracking-[0.02em] text-xl text-pure-white">JEN-LAB</span>
      </NuxtLink>

      <!-- Tagline -->
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-pure-white text-4xl md:text-5xl"
      >
        Fastest-Growing<br />Personal Site<br />On The Harbour.
      </h2>

      <!-- CTA -->
      <UButton
        to="mailto:jen@jenliu.com.au"
        color="primary"
        :ui="{ base: 'rounded-button w-fit' }"
        trailing-icon="i-lucide-arrow-right"
      >
        Book A Hello
      </UButton>
    </div>

    <!-- Right: socials row + ash nav card -->
    <div class="flex flex-col gap-2.5 min-h-[360px]">
      <!-- Socials row: 64px solid orange circles -->
      <div class="flex flex-wrap gap-2.5 justify-end" aria-label="Social links">
        <a
          v-for="c in socials"
          :key="c.label"
          :href="c.url"
          :aria-label="c.label"
          target="_blank"
          rel="noopener"
          class="size-16 rounded-full bg-digital-orange text-pure-white inline-flex items-center justify-center transition-[background-color,transform] duration-[180ms] ease-[ease] hover:bg-[#e34800] hover:-translate-y-0.5"
        >
          <UIcon :name="c.icon" class="size-6" />
        </a>
      </div>

      <!-- Ash nav card: inline links + dotted divider + copyright -->
      <div class="flex-1 bg-ash-white rounded-card p-10 flex flex-col justify-between gap-7">
        <nav class="flex flex-wrap gap-x-11 gap-y-5" aria-label="Footer navigation">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to + link.label"
            :to="link.to"
            class="text-lg font-medium text-abyssal-ink hover:text-digital-orange transition-colors"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="space-y-5">
          <hr class="border-0 border-t-2 border-dotted border-abyssal-ink/30" />
          <p class="text-base text-abyssal-ink">jen-lab 2026 © All rights reserved.</p>
        </div>
      </div>
    </div>
  </footer>
</template>
