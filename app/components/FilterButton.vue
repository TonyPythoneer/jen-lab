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
          <button
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm hover:bg-gray-50 transition text-left"
            :class="!modelValue ? 'font-semibold text-teal-600' : 'text-gray-700'"
            @click="select(null)"
          >
            <RadioDot :active="!modelValue" />
            全部
          </button>
          <button
            v-for="(option, id) in options"
            :key="id"
            class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm hover:bg-gray-50 transition text-left"
            :class="modelValue === id ? 'font-semibold text-teal-600' : 'text-gray-700'"
            @click="select(id)"
          >
            <RadioDot :active="modelValue === id" />
            <span v-if="option.color" class="w-2.5 h-2.5 rounded-full flex-shrink-0" :style="{ background: option.color }" />
            {{ option.displayName }}
          </button>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
export type FilterOption = Record<string, { displayName: string; color?: string }>

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
