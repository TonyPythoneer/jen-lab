<template>
  <a
    v-for="contact in contacts"
    :key="contact.label"
    :href="contact.url"
    :aria-label="contact.label"
    v-bind="contact.url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener' }"
    :class="[linkClass, contact.hoverClass, 'transition-colors']"
  >
    <AppIcon :name="contact.icon" :class="iconClass" />
  </a>
</template>

<script setup lang="ts">
// Single source for the social-contact row. `contacts` comes from config/site;
// callers supply only the size/tone classes that differ between placements.
import { contacts } from "~/config/site";

withDefaults(defineProps<{ linkClass?: string; iconClass?: string }>(), {
  linkClass: "text-abyssal-ink/60",
  iconClass: "w-5 h-5",
});
</script>
