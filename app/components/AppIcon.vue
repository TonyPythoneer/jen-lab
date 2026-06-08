<template>
  <Icon :icon="iconifyId" />
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

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
    if (bare.startsWith(prefix + "-")) return prefix + ":" + bare.slice(prefix.length + 1);
  }
  const dash = bare.indexOf("-");
  return dash === -1 ? bare : bare.slice(0, dash) + ":" + bare.slice(dash + 1);
});
</script>
