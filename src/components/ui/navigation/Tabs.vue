<template>
  <TabsRoot
    :model-value="modelValue"
    :class="$attrs.class"
    @update:model-value="$emit('update:modelValue', $event as string)"
  >
    <TabsList class="flex justify-center border-b border-abyssal-ink/10">
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        class="px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-px border-transparent text-abyssal-ink/50 hover:text-abyssal-ink data-[state=active]:border-digital-orange data-[state=active]:text-abyssal-ink"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>

<script setup lang="ts">
import { TabsRoot, TabsList, TabsTrigger } from "reka-ui";

defineOptions({ inheritAttrs: false });

defineProps<{
  modelValue: string;
  items: { label: string; value: string }[];
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>
