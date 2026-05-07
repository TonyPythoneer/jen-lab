<template>
  <UPopover>
    <UButton
      variant="outline"
      color="neutral"
      trailing-icon="i-lucide-chevron-down"
      :class="modelValue.length ? 'ring-2 ring-primary-500' : ''"
    >
      {{ label }}
      <span v-if="modelValue.length" class="ml-1 text-primary-500">
        ({{ modelValue.length }})
      </span>
    </UButton>
    <template #content>
      <div class="w-56 flex flex-col">
        <button
          :disabled="!modelValue.length"
          class="sticky top-0 z-10 bg-white dark:bg-neutral-900 text-xs px-3 py-2 text-left border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 enabled:hover:text-neutral-600 disabled:opacity-50 disabled:cursor-not-allowed"
          @click="clear"
        >
          {{ clearLabel }}
        </button>
        <div class="p-2 overflow-y-auto max-h-64 flex flex-col gap-0.5">
          <template v-if="grouped">
            <div v-for="group in groups" :key="group.parent.wpId" class="flex flex-col gap-0.5">
              <button
                class="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm font-semibold text-left"
                @click="toggle(group.parent.wpId)"
              >
                <span class="truncate">{{ group.parent.name }}</span>
                <UIcon
                  v-if="modelValue.includes(group.parent.wpId)"
                  name="i-lucide-check"
                  class="text-primary-500 size-4 shrink-0"
                />
              </button>
              <button
                v-for="child in group.children"
                :key="child.wpId"
                class="flex items-center justify-between gap-2 pl-6 pr-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-left"
                @click="toggle(child.wpId)"
              >
                <span class="truncate text-neutral-600 dark:text-neutral-300">{{
                  child.name
                }}</span>
                <UIcon
                  v-if="modelValue.includes(child.wpId)"
                  name="i-lucide-check"
                  class="text-primary-500 size-4 shrink-0"
                />
              </button>
            </div>
          </template>
          <template v-else>
            <button
              v-for="item in items"
              :key="item.wpId"
              class="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-left"
              @click="toggle(item.wpId)"
            >
              <span class="flex items-center gap-1 min-w-0">
                <span class="truncate">{{ item.name }}</span>
              </span>
              <UIcon
                v-if="modelValue.includes(item.wpId)"
                name="i-lucide-check"
                class="text-primary-500 size-4 shrink-0"
              />
            </button>
          </template>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
interface FilterItem {
  wpId: number;
  name: string;
  parent?: number;
}

const props = defineProps<{
  modelValue: number[];
  label: string;
  clearLabel: string;
  items: FilterItem[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number[]];
  change: [];
}>();

const grouped = computed(() => props.items.some((i) => typeof i.parent === "number"));

const groups = computed(() => {
  const byId = new Map(props.items.map((i) => [i.wpId, i]));
  const childrenByParent = new Map<number, FilterItem[]>();
  const roots: FilterItem[] = [];
  for (const item of props.items) {
    const p = item.parent ?? 0;
    if (p && byId.has(p)) {
      const arr = childrenByParent.get(p) ?? [];
      arr.push(item);
      childrenByParent.set(p, arr);
    } else {
      roots.push(item);
    }
  }
  return roots.map((parent) => ({
    parent,
    children: childrenByParent.get(parent.wpId) ?? [],
  }));
});

function toggle(wpId: number) {
  const next = props.modelValue.includes(wpId)
    ? props.modelValue.filter((v) => v !== wpId)
    : [...props.modelValue, wpId];
  emit("update:modelValue", next);
  emit("change");
}

function clear() {
  emit("update:modelValue", []);
  emit("change");
}
</script>
