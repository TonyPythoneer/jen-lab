<template>
  <div class="bg-basalt-canvas min-h-screen flex flex-col">
    <SiteHeader />

    <div class="flex-1 pt-[var(--site-header-h)] pb-[var(--section-gap)]">
      <slot />
    </div>

    <SiteFooter />

    <BlogSearchModal />
  </div>
</template>
