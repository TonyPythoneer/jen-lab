<script setup lang="ts">
const bringItems = [
  {
    value: "food",
    title: "Food",
    icon: "i-lucide-utensils",
    body: "120+ restaurants logged across the harbour, filterable by area and cuisine. Every entry is a personal visit — no scraped reviews, no SEO bait. Just where I'd send a friend tomorrow.",
  },
  {
    value: "code",
    title: "Code",
    icon: "i-lucide-cpu",
    body: "Toy projects, half-broken on purpose. Nuxt experiments and the occasional Cloudflare Worker.",
  },
  {
    value: "writing",
    title: "Writing",
    icon: "i-lucide-book-open",
    body: "Long-form notes from the workbench. Less manifesto, more diary.",
  },
];

const activeAccordion = ref("food");
</script>

<template>
  <section class="py-[72px] sm:py-[140px] flex flex-col items-center gap-10">
    <h2
      class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-center text-5xl md:text-6xl lg:text-7xl"
    >
      Bringing The<br />Harbour Online.
    </h2>

    <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5 items-stretch">
      <!-- Left: accordion -->
      <div class="flex flex-col gap-2.5 overflow-hidden">
        <div
          v-for="acc in bringItems"
          :key="acc.value"
          class="bg-ash-white rounded-card cursor-pointer transition-[padding] duration-200"
          :class="activeAccordion === acc.value ? 'px-8 py-8' : 'px-7 py-6'"
          @click="activeAccordion = acc.value"
        >
          <div class="flex items-center gap-4">
            <span
              class="size-14 rounded-[16px] flex items-center justify-center shrink-0 transition-colors duration-200"
              :class="activeAccordion === acc.value ? 'bg-digital-orange' : 'bg-basalt-canvas'"
            >
              <UIcon
                :name="acc.icon"
                class="size-7 transition-colors duration-200"
                :class="activeAccordion === acc.value ? 'text-pure-white' : 'text-abyssal-ink'"
              />
            </span>
            <span class="font-display tracking-[0.02em] text-3xl text-abyssal-ink">{{
              acc.title
            }}</span>
          </div>

          <div
            class="grid transition-[grid-template-rows] duration-300 ease-in-out overflow-hidden"
            :style="{ gridTemplateRows: activeAccordion === acc.value ? '1fr' : '0fr' }"
          >
            <div class="min-h-0">
              <p class="mt-4 text-sm leading-relaxed text-abyssal-ink/70 max-w-[52ch]">
                {{ acc.body }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right: violet detail card -->
      <article
        class="bg-cyber-violet text-pure-white rounded-card p-9 flex flex-col justify-between gap-7"
      >
        <div class="space-y-5 text-base leading-relaxed">
          <p>
            Pick a current and dive in. The food log opens to a Sydney map filterable by suburb,
            cuisine and how loud the espresso machine is at 9am. Every entry is a personal visit —
            no scraped reviews, no affiliate spam.
          </p>
          <p>
            Most ideas don't survive their first weekend. The ones that do get a folder, a throwaway
            prototype, and — eventually — a post.
          </p>
        </div>
        <div class="border-t border-pure-white/20 pt-5 flex items-center gap-4 flex-wrap">
          <span class="text-xs uppercase tracking-[0.18em] opacity-70">Built with</span>
          <div class="flex gap-2 flex-wrap">
            <span
              v-for="tag in ['NUXT', 'VUE', 'CF']"
              :key="tag"
              class="bg-pure-white/15 rounded-button px-3.5 py-1.5 text-xs font-medium tracking-widest"
              >{{ tag }}</span
            >
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
