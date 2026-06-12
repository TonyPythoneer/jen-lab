<script setup lang="ts">
// @ts-ignore — generated manifest (scripts/build-avif.ts), no bundled types
import avifManifest from "~/lib/avifManifest.json";

// <img> drop-in: serves the smaller AVIF (see avifManifest) with .webp fallback.
// display:contents keeps the <img> the layout child; $attrs forwards straight to it.
defineOptions({ inheritAttrs: false });

const props = defineProps<{ src: string }>();

const avifSet = new Set(avifManifest as string[]);
// Only emit the <source> when a real, smaller .avif exists — otherwise the
// browser would pick a 404 with no fallback to the <img>.
const hasAvif = computed(() => avifSet.has(props.src));
const avifSrc = computed(() => props.src.replace(/\.webp$/, ".avif"));
</script>

<template>
  <picture class="contents">
    <source v-if="hasAvif" :srcset="avifSrc" type="image/avif" />
    <img :src="src" decoding="async" v-bind="$attrs" />
  </picture>
</template>
