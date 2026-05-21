<template>
  <div class="bg-basalt-canvas min-h-screen flex flex-col">
    <SiteHeader />

    <div class="flex-1 pt-[var(--site-header-h)]">
      <slot />
    </div>

    <SiteFooter />
  </div>
</template>
