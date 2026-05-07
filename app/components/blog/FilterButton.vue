<template>
  <UPopover>
    <UButton
      variant="outline"
      color="neutral"
      :icon="icon"
      :aria-label="label"
      :class="modelValue.length ? 'ring-2 ring-primary-500' : ''"
    >
      <template v-if="!icon">{{ label }}</template>
      <template #trailing>
        <span
          v-if="modelValue.length"
          class="rounded-full size-5 inline-flex items-center justify-center text-xs font-semibold bg-primary-500 text-white"
        >
          {{ modelValue.length }}
        </span>
        <UIcon v-else name="i-lucide-chevron-down" />
      </template>
    </UButton>
    <template #content>
      <div class="w-56 p-2 max-h-64 overflow-y-auto">
        <UTree
          v-model="selectedTree"
          :items="items"
          :as="{ link: 'div' }"
          multiple
          propagate-select
          bubble-select
          @select="onSelect"
        >
          <template #item-leading="{ selected, indeterminate, handleSelect }">
            <UCheckbox
              :model-value="indeterminate ? 'indeterminate' : selected"
              tabindex="-1"
              @change="handleSelect"
              @click.stop
            />
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
const flatNodes = computed(() =>
  props.items.flatMap((n) => [n, ...(n.children ?? [])]),
);

const selectedTree = computed<FilterTreeItem[]>({
  get: () => flatNodes.value.filter((n) => props.modelValue.includes(n.value)),
  set: (items) => {
    emit("update:modelValue", items.map((i) => i.value));
    emit("change");
  },
});

function onSelect(e: { detail: { originalEvent: Event }; preventDefault: () => void }) {
  if (e.detail.originalEvent.type === "click") {
    e.preventDefault();
  }
}

</script>
