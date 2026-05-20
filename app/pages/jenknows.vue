<template>
  <SitePageContainer>
    <div class="w-full max-w-lg mx-auto px-4 flex flex-col gap-5">
      <HomeContentBody v-if="page" :page="page" :show="isReady" />
      <div v-else class="py-20 text-center text-abyssal-ink/40">Loading…</div>
    </div>
  </SitePageContainer>
</template>

<script setup lang="ts">
import type { Collections } from "@nuxt/content";

const { data, status } = useLazyAsyncData("preview:jen-knows", () =>
  queryCollection("home").path("/home/jen-knows").first(),
);
const page = computed(() => data.value as Collections["home"] | null);
const isMounted = useMounted();
const isReady = computed(() => status.value === "success" && isMounted.value);
</script>
