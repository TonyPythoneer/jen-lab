<!-- Isolation context for every story: `isolate` starts a fresh stacking
     context so portalled overlays layer the same way they do in the app. -->
<template>
  <div class="isolate">
    <slot />
  </div>
</template>
