<template>
  <div :class="$attrs.class">
    <div class="flex justify-center border-b border-abyssal-ink/10">
      <button
        v-for="item in items"
        :key="item.value"
        type="button"
        :class="
          cn(
            'px-3 py-1.5 text-sm font-medium transition-colors border-b-2 -mb-px',
            item.value === modelValue
              ? 'border-digital-orange text-abyssal-ink'
              : 'border-transparent text-abyssal-ink/50 hover:text-abyssal-ink',
          )
        "
        @click="$emit('update:modelValue', item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from "~/lib/utils";

defineOptions({ inheritAttrs: false });

defineProps<{
  modelValue: string;
  items: { label: string; value: string }[];
}>();

defineEmits<{ "update:modelValue": [value: string] }>();
</script>
