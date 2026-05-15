<template>
  <a
    v-for="contact in contacts"
    :key="contact.label"
    :href="contact.url"
    :aria-label="contact.label"
    v-bind="contact.url.startsWith('mailto:') ? {} : { target: '_blank', rel: 'noopener' }"
    :class="[linkClass, contact.hoverClass, 'transition-colors']"
  >
    <UIcon :name="contact.icon" :class="iconClass" />
  </a>
</template>

<script setup lang="ts">
// Single source for the social-contact row. `contacts` comes from app.config.ts;
// callers supply only the size/tone classes that differ between placements.
withDefaults(defineProps<{ linkClass?: string; iconClass?: string }>(), {
  linkClass: "text-gray-500",
  iconClass: "w-5 h-5",
});

const { contacts } = useAppConfig();
</script>
