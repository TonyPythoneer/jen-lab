<template>
  <div
    class="rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col"
  >
    <USkeleton class="h-48 w-full rounded-none" />
    <div class="flex flex-col gap-2 flex-1 p-4">
      <USkeleton class="h-3 w-20" />
      <USkeleton class="h-5 w-5/6" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-4/6" />
      <div class="flex gap-1 mt-auto pt-2">
        <USkeleton class="h-5 w-12 rounded-full" />
        <USkeleton class="h-5 w-10 rounded-full" />
        <USkeleton class="h-5 w-14 rounded-full" />
      </div>
    </div>
  </div>
</template>
