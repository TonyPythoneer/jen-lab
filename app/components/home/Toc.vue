<template>
  <ClientOnly>
    <aside
      class="sticky top-0 sm:fixed z-40 transition-all duration-200"
      :class="[
        'top-0 left-0 w-full sm:w-auto',
        'sm:h-full sm:flex-col sm:pt-4',
        'sm:w-36',
        'flex sm:flex-col',
        'border-b border-gray-200 sm:border-none',
        'bg-[rgb(248,248,248)] sm:bg-transparent'
      ]"
    >
      <div class="sm:hidden flex items-center w-full px-4 py-3">
        <span class="flex-1 text-center font-semibold">{{ title }}</span>
        <UButton
          :icon="isOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          variant="ghost"
          color="neutral"
          @click="isOpen = !isOpen"
        />
      </div>

      <Transition name="menu">
        <div
          v-show="isOpen"
          class="
            absolute top-full left-0 w-full shadow-lg rounded-md p-2 bg-white
            sm:flex! sm:static sm:shadow-none sm:rounded-none sm:bg-transparent sm:w-auto sm:p-0
            sm:flex-1 sm:flex-col sm:justify-center
          "
        >
          <UContentToc
            highlight
            :links="links"
            :title="title"
            :ui="{ content: 'flex! px-2', trailing: 'max-sm:hidden!', title: 'max-sm:hidden!' }"
          />
        </div>
      </Transition>
    </aside>
  </ClientOnly>
</template>

<script setup lang="ts">
import type { ContentTocLink } from '@nuxt/ui'

defineProps<{
  links: ContentTocLink[]
  title: string
}>()

const isOpen = ref(false)
</script>

<style scoped>
.menu-enter-active, .menu-leave-active { transition: opacity 0.2s; }
.menu-enter-from, .menu-leave-to { opacity: 0; }
</style>
