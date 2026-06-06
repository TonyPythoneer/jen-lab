<template>
  <div class="rounded-card border border-abyssal-ink/10 overflow-hidden flex flex-col">
    <AppSkeleton class="h-48 w-full rounded-none" />
    <div class="flex flex-col gap-2 flex-1 p-4">
      <AppSkeleton class="h-3 w-20" />
      <AppSkeleton class="h-5 w-5/6" />
      <AppSkeleton class="h-4 w-full" />
      <AppSkeleton class="h-4 w-4/6" />
      <div class="flex gap-1 mt-auto pt-2">
        <AppSkeleton class="h-5 w-12 rounded-full" />
        <AppSkeleton class="h-5 w-10 rounded-full" />
        <AppSkeleton class="h-5 w-14 rounded-full" />
      </div>
    </div>
  </div>
</template>
