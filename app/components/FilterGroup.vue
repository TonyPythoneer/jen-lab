<template>
  <div>
    <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">{{ title }}</p>
    <!-- "全部" sits alone on row 1; spacer divs push the real items to row 2 of the 4-col grid. -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-1">
      <FilterItem
        :active="modelValue === null"
        label="全部"
        @click="emit('update:modelValue', null)"
      />
      <div />
      <div />
      <div />
      <FilterItem
        v-for="item in items"
        :key="item.value"
        :active="modelValue === item.value"
        :label="item.label"
        :dot-color="item.dotColor"
        @click="emit('update:modelValue', item.value)"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends string | number">
interface FilterOption {
  value: T;
  label: string;
  dotColor?: string;
}

defineProps<{
  title: string;
  items: FilterOption[];
  modelValue: T | null;
}>();

const emit = defineEmits<{ "update:modelValue": [value: T | null] }>();
</script>
