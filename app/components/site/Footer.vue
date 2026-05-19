<script setup lang="ts">
const appConfig = useAppConfig();
const socials = appConfig.contacts ?? [];

const footerDotField = {
  color: "var(--color-pixel-glare)",
  size: 2,
  spacing: 28,
  opacity: 1,
  style: {
    maskImage:
      "radial-gradient(ellipse 70% 70% at 90% 10%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 70% 70% at 90% 10%, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.08) 55%, transparent 100%)",
  },
};

const currentYear = new Date().getFullYear();

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
  <!-- Mobile: single column stack; Desktop: two equal columns -->
  <footer
    id="footer"
    class="mx-auto w-[min(calc(100%-2rem),1200px)] grid grid-cols-1 md:grid-cols-2 gap-2.5 pb-2.5"
  >
    <!-- Left: dark brand card — fixed min-height on all breakpoints -->
    <div
      class="relative bg-abyssal-ink text-pure-white rounded-card p-10 flex flex-col justify-between gap-5 overflow-hidden"
    >
      <!-- Dark-radial dotfield: pixel-glare dots fading from top-right corner -->
      <HomeBackgroundDots v-bind="footerDotField" />
      <!-- Brand mark + wordmark -->
      <NuxtLink to="/" class="flex items-center gap-2.5 w-fit">
        <img src="/favicon.128x128.webp" alt="" class="size-7 rounded-full shrink-0" />
        <span class="font-display tracking-[0.02em] text-xl text-pure-white">JEN</span>
      </NuxtLink>

      <!-- Tagline: tighter font size on mobile, larger on desktop -->
      <h2 class="font-display tracking-[0.02em] leading-[1.3] text-pure-white text-4xl md:text-5xl">
        您最真摯的聲音<br />探索、認識<br /><b>澳洲</b>的各個角落
      </h2>
    </div>

    <!-- Right: ash card
         Mobile: natural height, top-to-bottom flow with gap-7
         Desktop: min-h-[360px], justify-between pushes contacts top / copyright bottom -->
    <div class="bg-ash-white rounded-card p-10 flex flex-col md:justify-between gap-7 md:gap-0">
      <div class="space-y-5">
        <p class="text-base text-abyssal-ink">CONTACTS</p>
        <!-- Socials: flex-1 icons shrink to fit one row on all screen sizes -->
        <div class="flex gap-2" aria-label="Social links">
          <a
            v-for="c in socials"
            :key="c.label"
            :href="c.url"
            :aria-label="c.label"
            target="_blank"
            rel="noopener"
            class="flex-1 aspect-square rounded-full bg-digital-orange text-pure-white inline-flex items-center justify-center transition-colors duration-[180ms] hover:bg-[#e34800]"
          >
            <UIcon :name="c.icon" class="size-6" />
          </a>
        </div>
      </div>

      <!-- copywrite -->
      <div class="space-y-5">
        <hr class="border-0 border-t-2 border-dotted border-abyssal-ink/30" />
        <p class="text-base text-abyssal-ink">© {{ currentYear }} TonyPythoneer</p>
        <p class="text-base text-abyssal-ink">Data powered by Jen Knows</p>
      </div>
    </div>
  </footer>
</template>
