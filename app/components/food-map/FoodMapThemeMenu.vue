<script setup lang="ts">
import type { MapTheme } from "~/composables/useFoodMapTheme";
import { useFoodMapStore } from "~/composables/useFoodMapStore";

const props = defineProps<{
  themes: MapTheme[];
  activeThemeId: string;
  boatsEnabled: boolean;
}>();

const emit = defineEmits<{
  select: [id: string];
  "toggle-boats": [];
  // Fires when the dropdown opens, so the parent can close the list drawer.
  open: [];
}>();

const open = ref(false);

// Picking a place takes over the screen (detail), so close the style menu.
const store = useFoodMapStore();
watch(
  () => store.state.selectedRestaurantId,
  (id) => {
    if (id) open.value = false;
  },
);

function toggle() {
  open.value = !open.value;
  if (open.value) emit("open");
}

function pick(id: string) {
  emit("select", id);
  open.value = false;
}

const activeTheme = computed(() => props.themes.find((t) => t.id === props.activeThemeId));

function getSwatchGradient(themeId: string) {
  const gradients: Record<string, string> = {
    voyager: "linear-gradient(135deg, #e7dcc0 0 58%, #8fb6d4 58% 100%)",
    handtint: "linear-gradient(125deg, #ead9bb 0 42%, #c08a72 42% 70%, #9fb6c0 70% 100%)",
    engraving: "linear-gradient(135deg, #f3eede 0 52%, #2c241a 52% 100%)",
  };
  return { backgroundImage: gradients[themeId] || "none" };
}
</script>

<template>
  <div class="theme-menu">
    <!-- Trigger -->
    <button class="theme-menu__trigger" aria-label="Map theme" @click="toggle">
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
      >
        <path d="M12 3 3 7.5 12 12l9-4.5L12 3Z" />
        <path
          d="m3 12 9 4.5L21 12M3 16.5 12 21l9-4.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span class="theme-menu__trigger-label">{{ activeTheme?.name }}</span>
    </button>

    <!-- Backdrop: only shown on mobile, where the list is a bottom drawer; tap to dismiss. -->
    <div v-if="open" class="theme-menu__backdrop" @click="open = false" />

    <!-- Dropdown (desktop) / bottom drawer (mobile) -->
    <div v-if="open" class="theme-menu__list">
      <!-- Heading -->
      <div class="theme-menu__heading">地圖樣式 · Map Style</div>

      <!-- Theme rows -->
      <button
        v-for="t in props.themes"
        :key="t.id"
        class="theme-menu__item"
        :class="{ 'is-active': props.activeThemeId === t.id }"
        @click="pick(t.id)"
      >
        <div class="theme-menu__swatch" :style="getSwatchGradient(t.id)" />
        <div class="theme-menu__meta">
          <div class="theme-menu__name">{{ t.name }} · {{ t.en }}</div>
          <div class="theme-menu__note">{{ t.note }}</div>
        </div>
      </button>

      <!-- Animation section -->
      <div class="theme-menu__divider" />
      <div class="theme-menu__heading">船隻 · Animation</div>

      <div class="theme-menu__toggle-row">
        <div class="theme-menu__meta">
          <div class="theme-menu__name">河上船隻 · River boats</div>
          <div class="theme-menu__note">Boats drift along the harbour routes</div>
        </div>
        <button
          class="theme-menu__switch"
          :class="{ 'is-on': props.boatsEnabled }"
          role="switch"
          :aria-checked="props.boatsEnabled"
          aria-label="River boats"
          @click="emit('toggle-boats')"
        >
          <span class="theme-menu__switch-knob" />
        </button>
      </div>
    </div>
  </div>
</template>
