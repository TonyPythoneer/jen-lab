<script setup lang="ts">
const headerEl = useTemplateRef<HTMLElement>("root");

onMounted(() => {
  const el = headerEl.value;
  if (!el) return;
  const ro = new ResizeObserver(([entry]) => {
    document.documentElement.style.setProperty(
      "--site-header-h",
      `${entry.borderBoxSize[0].blockSize}px`,
    );
  });
  ro.observe(el);
  onUnmounted(() => ro.disconnect());
});

const navItems = [
  { label: "Home", to: "/" },
  { label: "Jen Knows", to: "/jen-knows" },
  { label: "Jen Liu", to: "/jen-liu" },
  { label: "Restaurants", to: "/my-best-restaurants-search-in-sydney" },
  { label: "Blogs", to: "/blogs" },
  ...(import.meta.dev ? [{ label: "Unused", to: "/unused" }] : []),
];

const SUBSCRIBE_URL = "https://jen-nextsteps.kit.com/60463af80d";

const route = useRoute();
const { y } = useWindowScroll();
const scrolled = computed(() => y.value > 80);

const mobileOpen = ref(false);
watch(
  () => route.fullPath,
  () => (mobileOpen.value = false),
);

const smoothEase = "cubic-bezier(0.32, 0.72, 0, 1)";
</script>

<template>
  <header ref="root" class="fixed top-0 left-0 right-0 w-full z-50 px-4 pt-3">
    <!-- Pill/bar wrapper — full-width bar by default, collapses to centered pill on scroll -->
    <div
      class="mx-auto flex items-center gap-4"
      :class="
        scrolled
          ? 'max-w-fit bg-ash-white rounded-button shadow-[0_8px_24px_rgba(7,6,7,0.08)] pl-3 pr-2 py-2'
          : 'max-w-300 w-full justify-between bg-basalt-canvas/85 backdrop-blur-sm rounded-button px-4 py-3'
      "
      :style="{
        transition: `max-width 600ms ${smoothEase}, padding 500ms ${smoothEase}, background-color 400ms ease-out, box-shadow 400ms ease-out`,
      }"
    >
      <!-- Logo + desktop nav -->
      <div class="flex items-center gap-3 shrink-0">
        <!-- Logo: avatar always visible; "JEN" text slides out when scrolled -->
        <NuxtLink
          to="/"
          aria-label="Jen Lab home"
          class="flex items-center text-abyssal-ink overflow-hidden"
        >
          <img src="/favicon.128x128.webp" alt="" class="size-7 rounded-full shrink-0" />
          <span
            class="font-display tracking-[0.02em] text-2xl whitespace-nowrap inline-block"
            :style="{
              transition: `max-width 600ms ${smoothEase}, opacity 400ms ${smoothEase}, transform 600ms ${smoothEase}, margin-left 600ms ${smoothEase}`,
              maxWidth: scrolled ? '0px' : '160px',
              opacity: scrolled ? 0 : 1,
              transform: scrolled ? 'translateX(-100%)' : 'translateX(0)',
              marginLeft: scrolled ? '0px' : '8px',
            }"
          >
            JEN
          </span>
        </NuxtLink>

        <!-- Desktop nav links -->
        <nav class="hidden md:flex items-center gap-0.5">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="px-3 py-2 text-sm text-abyssal-ink/80 hover:text-abyssal-ink hover:bg-abyssal-ink/8 rounded-button transition-colors"
            active-class="text-abyssal-ink font-bold bg-abyssal-ink/8"
          >
            {{ item.label }}
          </NuxtLink>
        </nav>
      </div>

      <!-- Socials + CTA + burger -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Desktop: CTA button (shorter height when scrolled) -->
        <a
          :href="SUBSCRIBE_URL"
          target="_blank"
          rel="noopener"
          class="hidden md:inline-flex items-center px-4 text-sm font-medium bg-digital-orange text-pure-white rounded-button transition-colors duration-[180ms] hover:bg-[#e34800]"
          :class="scrolled ? 'h-8' : 'h-10'"
        >
          訂閱電子報
        </a>

        <!-- Mobile: hamburger toggle -->
        <button
          class="md:hidden inline-flex items-center justify-center size-10 rounded-button text-abyssal-ink"
          aria-label="Toggle menu"
          @click="mobileOpen = !mobileOpen"
        >
          <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
        </button>
      </div>
    </div>

    <!-- Mobile drawer (slides down; closes on route change) -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition-all duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="mobileOpen"
        class="md:hidden mx-auto mt-2 max-w-300 bg-ash-white rounded-card shadow-lg p-4 space-y-2"
      >
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="block px-4 py-2 text-abyssal-ink hover:bg-basalt-canvas rounded-card transition-colors"
        >
          {{ item.label }}
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>
