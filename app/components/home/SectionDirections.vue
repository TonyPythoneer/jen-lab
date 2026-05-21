<script setup lang="ts">
const JEN_KNOWS_URL = "/jen-knows";
const JEN_LIU_URL = "/jen-liu";
</script>

<template>
  <section class="py-[72px] sm:py-[140px] space-y-8">
    <h2
      class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
    >
      Jen is Jen.
      <span class="block">Jen is always me.</span>
    </h2>

    <div class="grid grid-cols-1 md:grid-cols-12 gap-2.5">
      <article
        class="md:col-span-5 bg-ash-white rounded-card p-8 md:p-10 flex flex-col justify-center items-center text-center gap-8 min-h-[360px]"
      >
        <div class="space-y-3">
          <h3
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl md:text-4xl"
          >
            Jen Knows
            <span class="block text-cyber-violet">職涯 × 職場</span>
          </h3>
          <p class="text-sm md:text-base text-abyssal-ink/75 leading-relaxed max-w-prose">
            陪你找到在澳洲的下一步——求職、職場文化、職涯諮詢，以中文深入講清楚。
          </p>
        </div>

        <UButton
          color="neutral"
          size="md"
          class="bg-cyber-violet text-white hover:bg-cyber-violet/90 text-base font-medium transition-colors"
          :ui="{ base: 'rounded-button px-8 py-3' }"
          :to="JEN_KNOWS_URL"
          trailing-icon="i-lucide-arrow-right"
        >
          進入 Jen Knows
        </UButton>
      </article>

      <article
        class="relative md:col-span-7 bg-cyber-violet rounded-card overflow-hidden min-h-[360px] p-6"
      >
        <img
          src="/home/jen-knows-hero.webp"
          alt="Jen Knows — 榛知職涯身份"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-contain p-6"
        />
      </article>

      <article
        class="relative md:col-span-7 bg-digital-orange rounded-card overflow-hidden min-h-[360px] p-6"
      >
        <img
          src="/home/jen-liu-hero.webp"
          alt="Jen Liu — 榛知旅遊身份"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-contain p-6"
        />
      </article>

      <article
        class="md:col-span-5 bg-ash-white rounded-card p-8 md:p-10 flex flex-col justify-center items-center text-center gap-8 min-h-[360px]"
      >
        <div class="space-y-3">
          <h3
            class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-3xl md:text-4xl"
          >
            Jen Liu
            <span class="block text-digital-orange">旅遊 × 美食</span>
          </h3>
          <p class="text-sm md:text-base text-abyssal-ink/75 leading-relaxed max-w-prose">
            雪梨在地視角，帶你探索澳洲旅遊、美食與自助旅行的大小事。
          </p>
        </div>

        <UButton
          color="neutral"
          size="md"
          class="bg-digital-orange text-white hover:bg-digital-orange/90 text-base font-medium transition-colors"
          :ui="{ base: 'rounded-button px-8 py-3' }"
          :to="JEN_LIU_URL"
          trailing-icon="i-lucide-arrow-right"
        >
          進入 Jen Liu
        </UButton>
      </article>
    </div>
  </section>
</template>
