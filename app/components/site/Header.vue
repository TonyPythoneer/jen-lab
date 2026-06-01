<script setup lang="ts">
const { data: siteHeader } = await useAsyncData("site-header", () =>
  queryCollection("site").path("/site/header").first(),
);
const navItems = computed(() => siteHeader.value?.nav ?? []);

const route = useRoute();
const { y } = useWindowScroll();
const isDesktop = useMediaQuery("(min-width: 768px)");
// Past this scroll point the bar turns solid white (all devices).
const scrolled = computed(() => y.value > 80);
// Collapse into the centered pill only on desktop. On mobile the header stays a
// full-width bar so it lines up with the page sections below it.
const collapsed = computed(() => scrolled.value && isDesktop.value);

const mobileOpen = ref(false);
watch(
  () => route.fullPath,
  () => (mobileOpen.value = false),
);

const { openSearch } = useBlogSearch();

const smoothEase = "cubic-bezier(0.32, 0.72, 0, 1)";
</script>

<template>
  <header class="fixed top-0 left-0 right-0 w-full z-50 px-4 pt-3">
    <!-- Pill/bar wrapper — full-width bar by default, collapses to centered pill on scroll -->
    <div
      class="mx-auto flex items-center gap-4 rounded-button backdrop-blur-sm"
      :class="[
        collapsed ? 'max-w-fit pl-3 pr-2 py-2' : 'max-w-300 w-full justify-between px-4 py-3',
        scrolled ? 'bg-ash-white shadow-[0_8px_24px_rgba(7,6,7,0.08)]' : 'bg-basalt-canvas/85',
      ]"
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
              maxWidth: collapsed ? '0px' : '160px',
              opacity: collapsed ? 0 : 1,
              transform: collapsed ? 'translateX(-100%)' : 'translateX(0)',
              marginLeft: collapsed ? '0px' : '8px',
            }"
          >
            JEN
          </span>
        </NuxtLink>

        <!-- Desktop nav links -->
        <nav class="hidden md:flex items-center gap-2">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="grid place-items-center px-3 py-2 text-sm text-abyssal-ink/80 hover:text-abyssal-ink hover:bg-abyssal-ink/8 rounded-button transition-colors"
            active-class="text-abyssal-ink font-bold bg-abyssal-ink/8"
          >
            <!-- Hidden bold copy reserves the active (bold) width so the link keeps the same width when it becomes active — stops the nav row from shifting. -->
            <span class="invisible col-start-1 row-start-1 font-bold" aria-hidden="true">{{
              item.label
            }}</span>
            <span class="col-start-1 row-start-1">{{ item.label }}</span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Socials + CTA + burger -->
      <div class="flex items-center gap-2 shrink-0">
        <!-- Search icon button -->
        <UButton
          color="neutral"
          variant="ghost"
          icon="i-lucide-search"
          aria-label="搜尋文章"
          class="rounded-button"
          :class="collapsed ? 'size-8' : 'size-10'"
          @click="openSearch"
        />

        <!-- Desktop: CTA button (shorter height when scrolled) -->
        <a
          href="#footer"
          class="hidden md:inline-flex items-center px-4 text-sm font-medium bg-digital-orange text-pure-white rounded-button transition-colors duration-[180ms] hover:bg-[#e34800]"
          :class="collapsed ? 'h-8' : 'h-10'"
        >
          Get in Touch
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
        <!-- Mobile: CTA -->
        <a
          href="#footer"
          class="block px-4 py-2 text-sm font-medium text-center bg-digital-orange text-pure-white rounded-card transition-colors hover:bg-[#e34800]"
        >
          Get in Touch
        </a>
      </div>
    </Transition>
  </header>
</template>
