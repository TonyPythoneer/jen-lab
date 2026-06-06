<template>
  <AppPopover>
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
      <AppIcon v-if="icon" :name="icon" class="size-4" />
      <span v-else>{{ label }}</span>
      <span
        v-if="modelValue.length"
        class="inline-flex size-4 items-center justify-center rounded-full bg-digital-orange text-[10px] font-bold leading-none text-pure-white"
      >
        {{ modelValue.length }}
      </span>
      <AppIcon v-else name="i-lucide-chevron-down" class="size-3 opacity-50" />
    </button>

    <template #content>
      <div class="w-52 max-h-60 overflow-y-auto p-1.5">
        <template v-for="item in items" :key="item.value">
          <!-- Parent row -->
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-abyssal-ink/5"
            @click="toggle(item)"
          >
            <div
              class="size-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors"
              :class="
                modelValue.includes(item.value) || isIndeterminate(item)
                  ? 'border-abyssal-ink bg-abyssal-ink'
                  : 'border-abyssal-ink/10'
              "
            >
              <AppIcon
                v-if="modelValue.includes(item.value)"
                name="i-lucide-check"
                class="size-3 text-pure-white"
              />
              <AppIcon
                v-else-if="isIndeterminate(item)"
                name="i-lucide-minus"
                class="size-3 text-pure-white"
              />
            </div>
            <span class="truncate text-left">{{ item.label }}</span>
          </button>
          <!-- Child rows (indented) -->
          <template v-for="child in item.children ?? []" :key="child.value">
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md pl-6 pr-2 py-1.5 text-sm hover:bg-abyssal-ink/5"
              @click="toggle(child, item)"
            >
              <div
                class="size-4 shrink-0 rounded-sm border flex items-center justify-center transition-colors"
                :class="
                  modelValue.includes(child.value)
                    ? 'border-abyssal-ink bg-abyssal-ink'
                    : 'border-abyssal-ink/10'
                "
              >
                <AppIcon
                  v-if="modelValue.includes(child.value)"
                  name="i-lucide-check"
                  class="size-3 text-pure-white"
                />
              </div>
              <span class="truncate text-left">{{ child.label }}</span>
            </button>
          </template>
        </template>
      </div>
    </template>
  </AppPopover>
</template>

<script setup lang="ts">
interface FilterTreeItem {
  label: string;
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

function isIndeterminate(item: FilterTreeItem): boolean {
  const kids = item.children ?? [];
  if (!kids.length) return false;
  const n = kids.filter((c) => props.modelValue.includes(c.value)).length;
  return n > 0 && n < kids.length;
}

function toggle(item: FilterTreeItem, parent?: FilterTreeItem) {
  const set = new Set(props.modelValue);
  if (set.has(item.value)) {
    // Deselect this item and all its children
    set.delete(item.value);
    for (const c of item.children ?? []) set.delete(c.value);
    // Parent is no longer fully selected
    if (parent) set.delete(parent.value);
  } else {
    // Select this item and propagate to all children
    set.add(item.value);
    for (const c of item.children ?? []) set.add(c.value);
    // Bubble up: select parent if all siblings are now selected
    if (parent) {
      const allSelected = (parent.children ?? []).every((c) => set.has(c.value));
      if (allSelected) set.add(parent.value);
    }
  }
  emit("update:modelValue", [...set]);
  emit("change");
}
</script>
