<!-- Wraps every story in UApp (overlay/toast/tooltip context). An SFC so the
     vue plugin compiles it and @nuxt/ui's resolver auto-imports UApp — a runtime
     template string in preview.ts could not be scanned for that. -->
<template>
  <UApp class="isolate">
    <slot />
  </UApp>
</template>
