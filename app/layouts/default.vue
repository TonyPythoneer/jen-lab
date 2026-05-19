<script setup lang="ts">
const navItems = [
  { label: "Home", to: "/" },
  { label: "Restaurants", to: "/my-best-restaurants-search-in-sydney" },
  { label: "Blogs", to: "/blogs" },
  { label: "About", to: "/about" },
];

const socials = [
  {
    href: "https://www.threads.com/@jenknowsau",
    label: "Threads",
    icon: "i-simple-icons-threads",
  },
  {
    href: "https://www.instagram.com/jenknowsau/",
    label: "Instagram",
    icon: "i-simple-icons-instagram",
  },
  {
    href: "https://www.youtube.com/@jenliuau",
    label: "YouTube",
    icon: "i-simple-icons-youtube",
  },
];

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
  <div class="bg-basalt-canvas min-h-screen flex flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-abyssal-ink focus:text-pure-white focus:rounded-button focus:text-sm"
    >
      Skip to main content
    </a>

    <header class="sticky top-0 z-50 px-4 pt-3">
      <div
        class="mx-auto flex items-center gap-4"
        :class="
          scrolled
            ? 'max-w-fit bg-ash-white rounded-button shadow-[0_8px_24px_rgba(7,6,7,0.08)] pl-3 pr-2 py-2'
            : 'max-w-[1200px] w-full justify-between bg-basalt-canvas/85 backdrop-blur-sm rounded-button px-4 py-3'
        "
        :style="{
          transition: `max-width 600ms ${smoothEase}, padding 500ms ${smoothEase}, background-color 400ms ease-out, box-shadow 400ms ease-out`,
        }"
      >
        <!-- Left group: logo + nav links -->
        <div class="flex items-center gap-3 shrink-0">
          <NuxtLink
            to="/"
            aria-label="Jen Lab home"
            class="flex items-center text-abyssal-ink overflow-hidden"
          >
            <span
              class="size-7 bg-digital-orange rounded-sm shrink-0"
              :style="{
                transition: `transform 500ms ${smoothEase}`,
                transform: `rotate(${scrolled ? 135 : 45}deg)`,
              }"
            />
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
              JEN-LAB
            </span>
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-0.5">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="px-3 py-2 text-sm text-abyssal-ink/80 hover:text-abyssal-ink rounded-button transition-colors"
              active-class="text-abyssal-ink font-medium"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <!--
          Vertical separator — only appears in the scrolled pill state, where
          left and right groups sit side-by-side and need a divider.
        -->
        <span
          v-if="scrolled"
          class="hidden md:block border-l border-dotted border-abyssal-ink/30 self-stretch"
          aria-hidden="true"
        />

        <!-- Right group: socials + CTA / burger -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="hidden md:flex items-center gap-1 text-abyssal-ink/80">
            <a
              v-for="s in socials"
              :key="s.href"
              :href="s.href"
              :aria-label="s.label"
              target="_blank"
              rel="noopener"
              class="size-8 inline-flex items-center justify-center hover:text-digital-orange transition-colors"
            >
              <UIcon :name="s.icon" class="size-4" />
            </a>
          </div>
          <UButton
            to="mailto:jen@jenliu.com.au"
            color="primary"
            :ui="{ base: 'rounded-button hidden md:inline-flex' }"
            :size="scrolled ? 'md' : 'lg'"
          >
            Get In Touch
          </UButton>
          <button
            class="md:hidden inline-flex items-center justify-center size-10 rounded-button text-abyssal-ink"
            aria-label="Toggle menu"
            @click="mobileOpen = !mobileOpen"
          >
            <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="size-5" />
          </button>
        </div>
      </div>

      <!-- Mobile drawer -->
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
          class="md:hidden mx-auto mt-2 max-w-[1200px] bg-ash-white rounded-card shadow-lg p-4 space-y-2"
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

    <div id="main" class="flex-1">
      <slot />
    </div>

    <SiteFooter />
  </div>
</template>
