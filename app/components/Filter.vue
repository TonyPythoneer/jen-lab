<template>
  <div>
    <UButton color="neutral" variant="outline" size="sm" trailing-icon="i-lucide-chevron-down" @click="open = true">
      <span class="text-muted">{{ label }}</span>
      <span class="mx-1 text-muted">|</span>
      <span :class="modelValue ? 'font-semibold text-teal-600' : 'text-muted'">
        {{ modelValue ? (options[modelValue]?.displayName ?? modelValue) : '全部' }}
      </span>
    </UButton>

    <UModal v-model:open="open" :title="`選擇${label}`">
      <template #body>
        <div class="flex flex-col gap-1 pb-2 max-h-[60vh] overflow-y-auto">
          <FilterItem :active="!modelValue" label="全部" @click="select(null)" />
          <FilterItem
            v-for="(option, id) in options"
            :key="id"
            :active="modelValue === id"
            :label="option.displayName"
            :dotColor="option.dotColor"
            @click="select(id)"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
export type FilterOption = Record<string, { displayName: string; dotColor?: string }>

const props = defineProps<{
  label: string
  options: FilterOption
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
}>()

const open = ref(false)

function select(value: string | null) {
  open.value = false
  emit('update:modelValue', value)
}
</script>
