<!-- Wraps every story in an isolation context. Plain SFC — @nuxt/ui was
     removed, so no UApp; stories don't use overlay/toast/tooltip. -->
<template>
  <div class="isolate">
    <slot />
  </div>
</template>
