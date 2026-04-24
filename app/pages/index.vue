<template>
  <UPage>
    <UContainer class="max-w-lg py-10 px-6 flex flex-col gap-5">

      <HomeProfile :profile="home.profile" :contacts="contacts" />

      <HomeItem
        v-for="item in home.items"
        :key="item.to"
        :to="item.to"
        :icon="item.icon"
        :title="item.title"
        :description="item.description"
      />

      <!-- YouTube Carousel -->
      <HomeYoutubeCarousel :videos="home.videos" />

      <USeparator label="Products" class="px-6" />

      <HomeProductCard
        :banner-image="home.product.bannerImage"
        :title="home.product.title"
        :brief="home.product.brief"
        :description="home.product.description"
        :purchase-url="home.product.purchaseUrl"
        :purchase-label="home.product.purchaseLabel"
      />

    </UContainer>
  </UPage>
</template>

<script setup lang="ts">
const { contacts, pages } = useAppConfig()
const home = pages.home

useHead({ title: '榛知' })
</script>

<style scoped>
.product-description :deep(a) {
  color: var(--color-primary-500);
  text-decoration: underline;
}
.product-description :deep(ul) {
  list-style: disc;
  padding-left: 1.25rem;
}
.product-description :deep(p) {
  margin-bottom: 0.5rem;
}
</style>
