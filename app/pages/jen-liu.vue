<template>
  <SitePageContainer>
    <ProfilePage v-if="page" :page="page" :display-name="DISPLAY_NAME" brand="jen-liu" />
  </SitePageContainer>
</template>

<script setup lang="ts">
const DISPLAY_NAME = "Jen Liu";
const HEAD_TITLE = "榛知 | 澳洲旅遊作家";

const { data: page } = useLazyAsyncData("profile:jen-liu", () =>
  queryCollection("home").path("/home/jen-liu").first(),
);

useHead({ title: HEAD_TITLE });

const seoDescription = computed(() => page.value?.profile.tabs[0]?.bio ?? "");
useSeoMeta({
  description: seoDescription,
  ogTitle: HEAD_TITLE,
  ogDescription: seoDescription,
  ogImage: "/home/jen-liu/avatar.webp",
  twitterCard: "summary",
});
</script>
