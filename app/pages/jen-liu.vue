<template>
  <SitePageContainer>
    <ProfilePage
      v-if="page"
      :page="page"
      :display-name="DISPLAY_NAME"
      :subscribe-url="SUBSCRIBE_URL"
      :support-url="SUPPORT_URL"
    />
  </SitePageContainer>
</template>

<script setup lang="ts">
const DISPLAY_NAME = "Jen Liu";
const SUBSCRIBE_URL = "https://jen-nextsteps.kit.com/60463af80d";
const SUPPORT_URL = "https://portaly.cc/jenliuau/support";
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
