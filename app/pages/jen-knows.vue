<template>
  <SitePageContainer>
    <ProfilePage v-if="page" :page="page" :display-name="DISPLAY_NAME" brand="jen-knows" />
  </SitePageContainer>
</template>

<script setup lang="ts">
const DISPLAY_NAME = "Jen Knows";
const HEAD_TITLE = "榛知 | NextSteps Academy";

const { data: page } = useLazyAsyncData("profile:jen-knows", () =>
  queryCollection("home").path("/home/jen-knows").first(),
);

useHead({ title: HEAD_TITLE });

const seoDescription = computed(() => page.value?.profile.tabs[0]?.bio ?? "");
useSeoMeta({
  description: seoDescription,
  ogTitle: HEAD_TITLE,
  ogDescription: seoDescription,
  ogImage: "/home/jen-knows/avatar.webp",
  twitterCard: "summary",
});
</script>
