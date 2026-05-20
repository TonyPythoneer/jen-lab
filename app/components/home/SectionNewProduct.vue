<script setup lang="ts">
const BANNER_SRC = "/home/jen-liu/products/sydney.webp";
const BOOK_TITLE = "雪梨 附：藍山．紐卡索．獵人谷．賈維斯灣";
const BOOK_BRIEF =
  "榛知移居雪梨多年，帶你走進雪梨的多元面貌，一次盡覽城市與自然交織的壯闊風景。從歷史街區、經典地標到海岸祕境，給你最道地的體驗。";
const BUY_URL = "https://www.books.com.tw/products/0011050556";
const BUY_LABEL = "馬上購買";

const highlights = [
  "雪梨市區、近郊、新南威爾斯州深度導覽",
  "四季活動、美食物產、必買伴手禮",
  "清晰分區規畫，輕鬆安排行程",
];
</script>

<template>
  <section class="py-[72px] sm:py-[140px]">
    <div class="bg-ash-white rounded-card overflow-hidden grid md:grid-cols-2">
      <!-- Banner -->
      <div class="relative min-h-[300px] md:min-h-[420px]">
        <img
          :src="BANNER_SRC"
          :alt="BOOK_TITLE"
          loading="lazy"
          class="absolute inset-0 w-full h-full object-cover object-center"
        />
      </div>

      <!-- Copy -->
      <div class="p-8 md:p-12 flex flex-col justify-between gap-6">
        <div class="space-y-4">
          <p class="text-xs uppercase tracking-widest text-digital-orange font-semibold">
            Fresh Off The Press
          </p>
          <h2
            class="font-display tracking-[0.02em] leading-[0.9] text-abyssal-ink text-4xl md:text-5xl"
          >
            {{ BOOK_TITLE }}
          </h2>
          <p class="text-sm md:text-base text-abyssal-ink/75 leading-relaxed">
            {{ BOOK_BRIEF }}
          </p>
          <ul class="space-y-1.5">
            <li
              v-for="h in highlights"
              :key="h"
              class="flex items-start gap-2 text-sm text-abyssal-ink/70"
            >
              <span class="size-1.5 rounded-full bg-digital-orange mt-1.5 shrink-0" />
              {{ h }}
            </li>
          </ul>
        </div>

        <UButton
          as="a"
          :href="BUY_URL"
          target="_blank"
          rel="noopener"
          color="primary"
          size="lg"
          :ui="{ base: 'rounded-button px-8 self-start' }"
          trailing-icon="i-lucide-shopping-bag"
        >
          {{ BUY_LABEL }}
        </UButton>
      </div>
    </div>
  </section>
</template>
