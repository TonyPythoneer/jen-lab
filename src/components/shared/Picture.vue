<script setup lang="ts">
// @ts-ignore — generated manifest (scripts/build-avif.ts), no bundled types
import avifManifest from "~/lib/avifManifest.json";

// Drop-in for <img> that serves a smaller AVIF when one was generated
// (scripts/build-avif.ts → avifManifest.json), falling back to the original
// .webp. display:contents makes the <picture> layout-transparent so the <img>
// stays the real layout child, and inheritAttrs:false + v-bind="$attrs" forwards
// class / style / loading / alt straight to it.
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
