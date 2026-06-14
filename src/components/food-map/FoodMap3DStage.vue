<script setup lang="ts">
import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import { FoodMap3DScene } from "./foodMap3DScene";

const props = defineProps<{
  restaurants: EnrichedRestaurant[];
  selectedId: string | null;
}>();

const emit = defineEmits<{
  (e: "select", id: string | null): void;
  (e: "hover", id: string | null): void;
}>();

const host = ref<HTMLDivElement | null>(null);
const loading = ref(true);
let scene: FoodMap3DScene | null = null;
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!host.value) return;
  scene = new FoodMap3DScene(host.value);
  scene.onSelect((id) => emit("select", id));
  scene.onHover((id) => emit("hover", id));
  scene
    .setData(props.restaurants)
    .then(() => scene?.setSelected(props.selectedId))
    .catch((e) => console.error("[food-map-3d] terrain load failed", e))
    .finally(() => (loading.value = false));
  resizeObserver = new ResizeObserver(() => scene?.resize());
  resizeObserver.observe(host.value);
});

watch(
  () => props.selectedId,
  (id) => scene?.setSelected(id),
);

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  scene?.dispose();
  scene = null;
});
</script>

<template>
  <div ref="host" class="fm3d-stage">
    <div v-if="loading" class="fm3d-stage__loading">Loading Sydney…</div>
  </div>
</template>

<style scoped>
.fm3d-stage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}
.fm3d-stage__loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--color-abyssal-ink);
  opacity: 0.55;
  font-size: 14px;
  pointer-events: none;
}
</style>
