import { describe, expect, it } from "vite-plus/test";
import { extractFromTs, extractFromVue } from "../../scripts/kg-vue/sfc";

const SFC = `
<template>
  <div>
    <Button color="primary">Hi</Button>
    <food-map-canvas />
    <component :is="dynamic" />
    <template #footer><Badge /></template>
  </div>
</template>
<script setup lang="ts">
import { cn } from "~/lib/utils";
const dynamic = resolveComponent("HomeSectionHero");
// useShadowed is a local binding, not an auto-import — must NOT become an edge
const useShadowed = () => 1;
useShadowed();
const data = useRestaurants();
</script>
<style scoped>.a { color: red }</style>
`;

describe("extractFromVue — component tags", () => {
  const ex = extractFromVue(SFC, "Demo.vue");

  it("finds PascalCase tags including in slot templates", () => {
    expect(ex.componentNames).toContain("Button");
    expect(ex.componentNames).toContain("Badge");
  });

  it("normalizes kebab-case tags to PascalCase", () => {
    expect(ex.componentNames).toContain("FoodMapCanvas");
  });

  it("captures resolveComponent('X') string literals", () => {
    expect(ex.componentNames).toContain("HomeSectionHero");
  });

  it("does not emit native element tags", () => {
    expect(ex.componentNames).not.toContain("Div");
  });
});

describe("extractFromVue — imports and composables", () => {
  const ex = extractFromVue(SFC, "Demo.vue");

  it("collects import specifiers from the script block", () => {
    expect(ex.importSpecs).toContain("~/lib/utils");
  });

  it("counts a free auto-import identifier as a composable candidate", () => {
    expect(ex.composableCandidates).toContain("useRestaurants");
  });

  it("excludes a locally-shadowed name from composable candidates", () => {
    expect(ex.composableCandidates).not.toContain("useShadowed");
  });

  it("excludes an explicitly-imported name from composable candidates", () => {
    expect(ex.composableCandidates).not.toContain("cn");
  });
});

describe("extractFromTs", () => {
  const ts = `
    import { ref } from "vue";
    import "./styles.css";
    const data = await import("#food-map-data");
    export { foo } from "../shared/foo";
    const list = useRestaurants();
  `;
  const ex = extractFromTs(ts);

  it("catches static, side-effect, dynamic, and re-export specifiers", () => {
    expect(ex.importSpecs).toContain("./styles.css");
    expect(ex.importSpecs).toContain("#food-map-data");
    expect(ex.importSpecs).toContain("../shared/foo");
  });

  it("finds composable candidates", () => {
    expect(ex.composableCandidates).toContain("useRestaurants");
  });

  it("emits no component names for a plain .ts file", () => {
    expect(ex.componentNames).toEqual([]);
  });
});
