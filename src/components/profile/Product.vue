<template>
  <div
    class="relative rounded-card shadow-sm overflow-hidden bg-ash-white border border-abyssal-ink/8"
  >
    <!-- Image fills the whole card. basalt-canvas shows while it decodes or if `banner` is unset.
         Title/brief/purchase moved off the card (detail in the info drawer, buying in the buy
         button), so the image takes over the height the detail block used to occupy. -->
    <div class="relative aspect-[2/1] bg-basalt-canvas">
      <img
        v-if="banner"
        :src="banner"
        :alt="title"
        class="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
      />
    </div>

    <!-- Info toggle: stays on top so it is visible over the banner photo and the open drawer. -->
    <button
      type="button"
      :aria-label="open ? '關閉介紹' : '查看介紹'"
      class="absolute right-3 top-3 z-20 grid size-9 place-items-center rounded-full bg-pure-white/80 text-abyssal-ink shadow-sm backdrop-blur-sm transition-colors hover:bg-pure-white"
      @click="open = !open"
    >
      <Icon :name="open ? 'i-lucide-x' : 'i-lucide-info'" class="size-5" />
    </button>

    <!-- Buy: sits directly below the info button; opens the buy interstitial. -->
    <button
      type="button"
      aria-label="購買"
      class="absolute right-3 top-14 z-20 grid size-9 place-items-center rounded-full bg-digital-orange text-pure-white shadow-sm transition-colors hover:bg-[#e34800]"
      @click="buyOpen = true"
    >
      <Icon name="i-streamline-freehand:e-commerce-click-buy" class="size-5" />
    </button>

    <!-- Info drawer: slides in left-to-right over the whole card; scrolls to read. -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition-transform duration-200 ease-in"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <!-- pr-16 reserves the right column for the close + buy buttons so the
           heading and text never run underneath them at any card width. -->
      <div
        v-if="open"
        class="product-drawer absolute inset-0 z-10 overflow-y-auto overscroll-contain bg-ash-white p-5 pr-16"
      >
        <h3 class="mb-3 text-lg font-display tracking-[0.02em] text-abyssal-ink">{{ title }}</h3>
        <!-- descriptionHtml is pre-rendered at build by markdown-it (see velite.config.ts
             productListSection transform). v-html ships no parser to the client; source is trusted local content. -->
        <div
          v-if="descriptionHtml"
          class="product-description text-sm leading-relaxed text-abyssal-ink/70"
          v-html="descriptionHtml"
        />
      </div>
    </Transition>

    <!-- Buy interstitial: countdown ring + sparks, then redirects to the store. -->
    <ProfileBuyButton v-model:open="buyOpen" :purchase-url="purchaseUrl" />
  </div>
</template>

<script setup lang="ts">
// `descriptionHtml` is pre-rendered at build (see velite.config.ts).
// `description` is the markdown source — declared only to absorb the
// spread from `v-bind="product"` so Vue doesn't warn about an unknown attr.
defineProps<{
  banner?: string;
  title: string;
  description?: string;
  descriptionHtml?: string;
  purchaseUrl: string;
}>();

// Info drawer toggle (top-right button) and the buy interstitial toggle
// (handed to ProfileBuyButton, which owns the countdown + redirect).
const open = ref(false);
const buyOpen = ref(false);
</script>

<style scoped>
/* Keep the drawer's scrollbar visible whenever the detail overflows the card —
 * macOS overlay scrollbars otherwise stay hidden until the user scrolls. */
.product-drawer {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--color-abyssal-ink) 30%, transparent) transparent;
}
.product-drawer::-webkit-scrollbar {
  width: 8px;
}
.product-drawer::-webkit-scrollbar-thumb {
  background-color: color-mix(in srgb, var(--color-abyssal-ink) 30%, transparent);
  border-radius: 9999px;
}

/* Restores defaults for tags markdown-it emits — Tailwind Preflight resets
 * them. `:deep()` because the markup comes from v-html, not the template. */
.product-description :deep(a) {
  color: var(--color-primary-500);
  text-decoration: underline;
}
.product-description :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.product-description :deep(p) {
  margin-bottom: 0.5rem;
}
.product-description :deep(hr) {
  margin: 0.75rem 0;
  border-color: rgb(229 231 235);
}
</style>
