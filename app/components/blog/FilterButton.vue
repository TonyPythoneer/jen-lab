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
          <button
            v-for="item in items"
            :key="item.id"
            class="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm text-left"
            @click="toggle(item.id)"
          >
            <span class="flex items-center gap-1 min-w-0">
              <span class="truncate">{{ item.name }}</span>
              <span class="text-xs text-neutral-400 shrink-0">({{ item.count }})</span>
            </span>
            <UIcon
              v-if="modelValue.includes(item.id)"
              name="i-lucide-check"
              class="text-primary-500 size-4 shrink-0"
            />
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
interface FilterItem {
  id: number
  name: string
  count: number
}

const props = defineProps<{
  modelValue: number[]
  label: string
  clearLabel: string
  items: FilterItem[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
  change: []
}>()

function toggle(id: number) {
  const next = props.modelValue.includes(id)
    ? props.modelValue.filter((v) => v !== id)
    : [...props.modelValue, id]
  emit('update:modelValue', next)
  emit('change')
}

function clear() {
  emit('update:modelValue', [])
  emit('change')
}
</script>
