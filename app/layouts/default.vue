<template>
  <div class="bg-basalt-canvas min-h-screen flex flex-col">
    <SiteHeader />

    <div
      class="flex-1 pt-[calc(var(--site-header-h)_+_var(--section-gap))] pb-[var(--section-gap)]"
    >
      <slot />
    </div>

    <SiteFooter />
  </div>
</template>
