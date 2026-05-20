<script setup lang="ts">
const appConfig = useAppConfig();

const contactDotField = {
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

const { email: subscribeEmail, onSubscribe } = useNewsletterSubscribe();
</script>

<template>
  <section class="grid grid-cols-1 md:grid-cols-[5fr_7fr] gap-2.5 py-[72px] sm:py-[140px]">
    <!-- Left: dark brand card -->
    <div
      class="relative bg-abyssal-ink text-pure-white rounded-card p-10 flex flex-col justify-between gap-10 min-h-[360px] overflow-hidden"
    >
      <HomeBackgroundDots v-bind="contactDotField" />
      <div class="relative z-10 flex items-center gap-2.5 w-fit">
        <span class="size-6 bg-digital-orange rounded-sm shrink-0" />
        <span class="font-display tracking-[0.02em] text-xl">JEN-LAB</span>
      </div>
      <h2
        class="relative z-10 font-display tracking-[0.02em] leading-[0.95] text-pure-white text-4xl md:text-5xl"
      >
        Got A Question?<br />Drop Me<br />A Line.
      </h2>
      <UButton
        to="mailto:jen@jenliu.com.au"
        color="primary"
        class="relative z-10"
        :ui="{ base: 'rounded-button w-fit' }"
        trailing-icon="i-lucide-arrow-right"
      >
        Book A Hello
      </UButton>
    </div>

    <!-- Right: socials row + ash contact card -->
    <div class="flex flex-col gap-2.5">
      <div class="flex flex-wrap gap-2.5 justify-end" aria-label="Social links">
        <a
          v-for="c in appConfig.contacts"
          :key="c.label"
          :href="c.url"
          :aria-label="c.label"
          target="_blank"
          rel="noopener"
          class="size-16 rounded-full bg-digital-orange text-pure-white inline-flex items-center justify-center transition-colors duration-[180ms] hover:bg-[#e34800]"
        >
          <UIcon :name="c.icon" class="size-6" />
        </a>
      </div>

      <div class="flex-1 bg-ash-white rounded-card p-10 flex flex-col justify-between gap-7">
        <div class="space-y-3">
          <span class="text-cyber-violet text-xs uppercase tracking-widest">Stay in the loop</span>
          <h3
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl md:text-4xl"
          >
            Notes From<br />
            <span class="text-digital-orange">The Workbench.</span>
          </h3>
          <p class="text-abyssal-ink/70 leading-relaxed text-sm">
            One short email when something ships. No digest, no upsell, no AI-generated thread
            summaries.
          </p>
        </div>
        <form class="flex flex-col sm:flex-row items-stretch gap-2.5" @submit.prevent="onSubscribe">
          <input
            v-model="subscribeEmail"
            type="email"
            required
            placeholder="you@harbour.au"
            class="flex-1 bg-transparent border border-abyssal-ink/25 text-abyssal-ink placeholder:text-abyssal-ink/40 rounded-input px-6 py-4 focus:outline-none focus:border-abyssal-ink focus:ring-2 focus:ring-abyssal-ink/20 transition-colors text-sm"
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
      </div>
    </div>
  </section>
</template>
