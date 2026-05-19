<script setup lang="ts">
const newsletterDotField = {
  color: "var(--color-pixel-glare)",
  opacity: 1,
  spacing: 32,
  size: 2,
  style: {
    maskImage:
      "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)",
    WebkitMaskImage:
      "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)",
  },
};

const toast = useToast();
const subscribeEmail = ref("");
function onSubscribe() {
  if (!subscribeEmail.value) return;
  toast.add({
    title: "Thanks — placeholder.",
    description: "Backend not wired yet. Your email won't be stored anywhere this round.",
    color: "primary",
  });
  subscribeEmail.value = "";
}
</script>

<template>
  <section
    class="relative bg-abyssal-ink rounded-card overflow-hidden p-8 md:p-16 text-center text-pure-white"
  >
    <HomeOperaHouseSvg
      aria-hidden="true"
      class="absolute -right-40 -top-20 w-[700px] opacity-15 pointer-events-none rotate-12"
    />
    <HomeBackgroundDots v-bind="newsletterDotField" />
    <div class="relative z-10 max-w-2xl mx-auto space-y-6">
      <div class="flex justify-center">
        <UBadge color="secondary" variant="solid" :ui="{ base: 'rounded-button px-4 py-1.5' }">
          <UIcon name="i-lucide-mail" class="size-3.5 mr-1.5" />
          Slow mail
        </UBadge>
      </div>
      <h2
        class="font-display tracking-[0.02em] leading-[0.95] text-pure-white text-4xl md:text-6xl"
      >
        Notes From
        <span class="block text-digital-orange">The Workbench.</span>
      </h2>
      <p class="text-pure-white/75 leading-relaxed">
        One short email when something ships. No daily digest, no upsell, no AI-generated thread
        summaries. Unsubscribe with one click.
      </p>
      <form
        class="flex flex-col md:flex-row items-stretch gap-2.5 max-w-xl mx-auto pt-2"
        @submit.prevent="onSubscribe"
      >
        <input
          v-model="subscribeEmail"
          type="email"
          required
          placeholder="you@harbour.au"
          class="flex-1 bg-transparent border border-pure-white/40 text-pure-white placeholder:text-pure-white/50 rounded-input px-6 py-4 focus:outline-none focus:border-pure-white focus:ring-2 focus:ring-pure-white/30 transition-colors"
        />
        <UButton
          type="submit"
          color="primary"
          size="xl"
          :ui="{ base: 'rounded-button px-8 justify-center' }"
          trailing-icon="i-lucide-arrow-right"
        >
          Subscribe
        </UButton>
      </form>
      <p class="text-xs text-pure-white/50 uppercase tracking-widest pt-2">
        Roughly one email per month · 312 readers · 0 spam
      </p>
    </div>
  </section>
</template>
