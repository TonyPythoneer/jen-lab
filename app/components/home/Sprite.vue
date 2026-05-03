<template>
  <div
    class="w-[130px] h-[168px] bg-no-repeat"
    :style="bgStyle"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
// Sprite sheet contains two girls side by side (254x168). `half` selects which
// one shows by shifting background-position. Parent controls placement +
// transform via class/style attrs (merged onto root by Vue's inheritAttrs).
const props = defineProps<{ half: 'left' | 'right' }>()

const bgStyle = computed(() => ({
  backgroundImage: "url('/home/jen-on-home-page.h168.png')",
  backgroundPosition: props.half === 'left' ? '0 0' : '-130px 0',
  backgroundSize: '254px 168px',
}))
</script>
