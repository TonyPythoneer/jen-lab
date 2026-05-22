<template>
  <section
    class="product_dots relative bg-ash-white rounded-card overflow-hidden px-8 py-20 md:py-28 text-center"
  >
    <div class="relative z-10 max-w-2xl mx-auto space-y-5">
      <UBadge color="secondary" variant="soft" :ui="{ base: 'rounded-button px-4 py-1.5' }">
        <UIcon name="i-lucide-flask-conical" class="size-3.5 mr-1.5" />
        A living experiment
      </UBadge>
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-5xl md:text-7xl"
      >
        Always In
        <span class="block text-digital-orange">Progress.</span>
      </h2>
      <p class="text-abyssal-ink/75 leading-relaxed">
        This site is never finished — and that's the point. Each section is a snapshot of what I'm
        building, eating, or thinking about right now.
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
