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
      <UButton
        :icon="navOpen ? 'i-lucide-x' : 'i-lucide-menu'"
        variant="ghost"
        color="neutral"
        class="sm:hidden px-4.5 self-center shrink-0 mt-2 ml-1"
        @click="navOpen = !navOpen"
      />

      <Transition name="menu">
        <div
          v-show="navOpen"
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
            :ui="{ content: 'flex! px-2' }"
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

const navOpen = ref(false)
</script>

<style scoped>
.menu-enter-active, .menu-leave-active { transition: opacity 0.2s; }
.menu-enter-from, .menu-leave-to { opacity: 0; }
</style>
</content>
</invoke>