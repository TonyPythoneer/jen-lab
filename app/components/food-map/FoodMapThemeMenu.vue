<script setup lang="ts">
import type { MapTheme } from "~/composables/useFoodMapTheme";

const props = defineProps<{
  themes: MapTheme[];
  activeThemeId: string;
}>();

const emit = defineEmits<{ select: [id: string] }>();

const open = ref(false);

function pick(id: string) {
  emit("select", id);
  open.value = false;
}

const activeTheme = computed(() => props.themes.find((t) => t.id === props.activeThemeId));

function getSwatchGradient(themeId: string): string {
  const gradients: Record<string, string> = {
    parchment: "linear-gradient(135deg, #e5d3a8 0 60%, #cdbb8c 60% 100%)",
    engraving: "linear-gradient(135deg, #f3eede 0 52%, #2c241a 52% 100%)",
    handtint: "linear-gradient(125deg, #ead9bb 0 42%, #c08a72 42% 70%, #9fb6c0 70% 100%)",
    voyager: "linear-gradient(135deg, #e7dcc0 0 58%, #8fb6d4 58% 100%)",
    satellite: "linear-gradient(135deg, #3f5a3a 0 45%, #2f4f63 45% 78%, #1f3a4a 78% 100%)",
    topographic: "linear-gradient(135deg, #ddca9c 0 55%, #b7a06f 55% 78%, #9bb1bf 78% 100%)",
    cool: "linear-gradient(135deg, #dfe0d2 0 58%, #93b3bf 58% 100%)",
  };
  return { backgroundImage: gradients[themeId] || "none" };
}
</script>

<template>
  <div class="absolute top-4 left-1/2 -translate-x-1/2 z-[650]">
    <!-- Trigger button -->
    <button
      class="inline-flex items-center gap-2.5 px-4 py-2.5 bg-white border border-gray-900 rounded-full text-xs font-semibold tracking-wider text-gray-900 shadow-sm hover:bg-gray-50 transition-colors"
      aria-label="Map theme"
      @click="open = !open"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        class="text-orange-500"
      >
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path
          d="m3 12 9 4.5L21 12M3 16.5 12 21l9-4.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ activeTheme?.name }}</span>
    </button>

    <!-- Dropdown menu -->
    <div
      v-if="open"
      class="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 bg-white border border-gray-200 rounded-lg p-2 shadow-lg"
    >
      <!-- Heading -->
      <div class="text-xs font-bold tracking-widest text-gray-400 uppercase px-2 py-1.5 pb-2">
        地圖樣式 · Map Style
      </div>

      <!-- Theme items -->
      <button
        v-for="t in props.themes"
        :key="t.id"
        :class="[
          'w-full flex items-center gap-3 px-2 py-2.5 rounded-md text-left transition-colors',
          props.activeThemeId === t.id
            ? 'bg-gray-100 ring-1 ring-inset ring-gray-200'
            : 'hover:bg-gray-50',
        ]"
        @click="pick(t.id)"
      >
        <!-- Swatch -->
        <div
          class="w-8.5 h-8.5 flex-shrink-0 rounded border border-gray-200 bg-cover"
          :style="getSwatchGradient(t.id)"
        />

        <!-- Metadata -->
        <div class="flex flex-col gap-0.5 min-w-0">
          <div class="text-sm font-semibold text-gray-900">{{ t.name }} · {{ t.en }}</div>
          <div class="text-xs text-gray-500 tracking-wider">{{ t.note }}</div>
        </div>
      </button>
    </div>
  </div>
</template>
