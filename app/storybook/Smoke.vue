<!-- Smoke-test content as an SFC so <U*> auto-import via the @nuxt/ui resolver.
     Proves theme colors, button pill radius, and display font are wired. -->
<template>
  <div class="p-8 flex flex-col gap-4 items-start font-sans">
    <h1 class="text-heading font-display">Storybook is up</h1>
    <UButton color="primary">Primary (digital-orange)</UButton>
    <UButton color="neutral" variant="outline">Ghost neutral</UButton>
    <UBadge color="secondary">secondary</UBadge>
  </div>
</template>
