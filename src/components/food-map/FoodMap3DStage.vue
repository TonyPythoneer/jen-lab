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
let scene: FoodMap3DScene | null = null;
let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!host.value) return;
  scene = new FoodMap3DScene(host.value);
  scene.onSelect((id) => emit("select", id));
  scene.onHover((id) => emit("hover", id));
  scene.setData(props.restaurants);
  scene.setSelected(props.selectedId);
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
  <div ref="host" class="fm3d-stage" />
</template>

<style scoped>
.fm3d-stage {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  cursor: grab;
}
</style>
