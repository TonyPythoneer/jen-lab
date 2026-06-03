<template>
  <UPopover>
    <button
      type="button"
      class="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors"
      :class="
        modelValue.length
          ? 'border-abyssal-ink bg-abyssal-ink text-pure-white'
          : 'border-abyssal-ink/25 text-abyssal-ink hover:border-abyssal-ink'
      "
      :aria-label="label"
    >
      <UIcon v-if="icon" :name="icon" class="size-4" />
      <span v-else>{{ label }}</span>
      <span
        v-if="modelValue.length"
        class="inline-flex size-4 items-center justify-center rounded-full bg-digital-orange text-[10px] font-bold leading-none text-pure-white"
      >
        {{ modelValue.length }}
      </span>
      <UIcon v-else name="i-lucide-chevron-down" class="size-3 opacity-50" />
    </button>
    <template #content>
      <div class="w-52 max-h-60 overflow-y-auto p-1.5">
        <UTree
          v-model="selectedTree"
          :items="items"
          :as="{ link: 'div' }"
          multiple
          propagate-select
          bubble-select
        >
          <template #item-leading="{ selected, indeterminate }">
            <div
              class="size-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors"
              :class="
                selected || indeterminate
                  ? 'border-abyssal-ink bg-abyssal-ink'
                  : 'border-abyssal-ink/10'
              "
            >
              <UIcon v-if="selected" name="i-lucide-check" class="size-3 text-pure-white" />
              <UIcon
                v-else-if="indeterminate"
                name="i-lucide-minus"
                class="size-3 text-pure-white"
              />
            </div>
          </template>
        </UTree>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { TreeItem } from "@nuxt/ui";

interface FilterTreeItem extends TreeItem {
  value: number;
  children?: FilterTreeItem[];
}

const props = defineProps<{
  modelValue: number[];
  label: string;
  items: FilterTreeItem[];
  icon?: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number[]];
  change: [];
}>();

// UTree v-model expects node objects, but modelValue stores ids only.
// Flatten parents + children so ids can be resolved back to nodes.
const flatNodes = computed(() => props.items.flatMap((n) => [n, ...(n.children ?? [])]));

const selectedTree = computed<FilterTreeItem[]>({
  get: () => flatNodes.value.filter((n) => props.modelValue.includes(n.value)),
  set: (items) => {
    emit(
      "update:modelValue",
      items.map((i) => i.value),
    );
    emit("change");
  },
});
</script>
