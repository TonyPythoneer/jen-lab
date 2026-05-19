<template>
  <section
    class="product_dots relative bg-ash-white rounded-card overflow-hidden px-8 py-20 md:py-28 text-center"
  >
    <div class="relative z-10 max-w-2xl mx-auto space-y-5">
      <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button px-4 py-1.5' }">
        <UIcon name="i-lucide-sparkles" class="size-3.5 mr-1.5" />
        More is more
      </UBadge>
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-5xl md:text-7xl"
      >
        Built To
        <span class="block text-digital-orange">Stack Up.</span>
      </h2>
      <p class="text-abyssal-ink/75 leading-relaxed">
        Every section composes from the same six tokens — colour, radius, type, spacing, font,
        shadow. Add another card and it just fits.
      </p>
    </div>
  </section>
</template>

<style scoped>
.product_dots {
  background-image: radial-gradient(circle, rgba(0, 0, 0, 0.2) 1.5px, transparent 1.5px);
  background-size: 24px 24px;
  mask-image: radial-gradient(circle, black 30%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
  -webkit-mask-image: radial-gradient(circle, black 30%, rgba(0, 0, 0, 0.3) 60%, transparent 100%);
}
</style>
