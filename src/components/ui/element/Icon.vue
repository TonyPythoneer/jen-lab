<template>
  <IconifyIcon :icon="iconifyId" />
</template>

<script setup lang="ts">
// Aliased so this component's global <Icon> name never collides with the iconify
// primitive. /offline drops the CDN runtime — icons are bundled in main.ts.
import { Icon as IconifyIcon } from "@iconify/vue/offline";

const props = defineProps<{ name: string }>();

// Prefixes with hyphens must be tested before the single-hyphen fallback:
// "i-simple-icons-github" → "simple-icons:github", not "simple:icons-github".
const MULTI_WORD_PREFIXES = ["simple-icons", "streamline-freehand"];

const iconifyId = computed(() => {
  const n = props.name;
  if (!n.startsWith("i-")) return n;
  const bare = n.slice(2);
  if (bare.includes(":")) return bare;
  for (const prefix of MULTI_WORD_PREFIXES) {
    if (bare.startsWith(`${prefix}-`)) return `${prefix}:${bare.slice(prefix.length + 1)}`;
  }
  const dash = bare.indexOf("-");
  return dash === -1 ? bare : `${bare.slice(0, dash)}:${bare.slice(dash + 1)}`;
});
</script>
