<template>
  <header
    class="sticky top-0 z-30 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur"
  >
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
      <div class="flex justify-start flex-1 max-sm:flex-none">
        <slot name="left" />
      </div>
      <div class="flex-none basis-1/3 text-center max-sm:flex-1 max-sm:basis-auto">
        <slot name="center" />
      </div>
      <div class="flex justify-end flex-1 max-sm:flex-none">
        <slot name="right" />
      </div>
    </div>
  </header>
</template>
