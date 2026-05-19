<template>
  <div
    class="group bg-ash-white rounded-[20px] overflow-hidden cursor-pointer select-none"
    :class="
      selected
        ? 'shadow-[0_0_0_2px_var(--color-digital-orange),0_4px_20px_rgba(252,80,0,0.12)]'
        : 'shadow-[0_1px_4px_rgba(7,6,7,0.06)]'
    "
    role="button"
    :aria-pressed="selected"
    @click="emit('select')"
  >
    <!-- Category color accent stripe -->
    <div
      class="h-1 w-full transition-[opacity] duration-150"
      :style="{ backgroundColor: restaurant.categoryColor }"
      :class="selected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'"
    />

    <div class="px-5 pt-4 pb-5 space-y-3">
      <!-- Header row -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <h3
            class="font-display text-[22px] leading-[0.97] tracking-[0.02em] text-abyssal-ink truncate"
          >
            {{ restaurant.name }}
          </h3>
          <p class="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-abyssal-ink/40">
            {{ restaurant.area }} · {{ restaurant.categoryName }}
          </p>
        </div>

        <!-- Price + selected indicator -->
        <div class="flex items-center gap-2 shrink-0 pt-0.5">
          <span class="text-xs font-medium text-abyssal-ink/40 tabular-nums">{{
            restaurant.priceRange
          }}</span>
          <span
            class="w-1.5 h-1.5 rounded-full transition-[opacity,transform] duration-200"
            :style="{ backgroundColor: restaurant.categoryColor }"
            :class="selected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'"
          />
        </div>
      </div>

      <!-- Summary -->
      <p
        v-if="restaurant.summary"
        class="text-sm text-abyssal-ink/60 leading-relaxed line-clamp-2 text-wrap-pretty"
      >
        {{ restaurant.summary }}
      </p>

      <!-- Description (collapsible) — stop propagation so card select doesn't toggle -->
      <div v-if="restaurant.description" class="pt-0.5" @click.stop>
        <UCollapsible class="group/c">
          <button
            class="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-abyssal-ink/30 hover:text-abyssal-ink/60 transition-colors duration-150 cursor-pointer"
          >
            <UIcon
              name="i-lucide-chevron-right"
              class="w-3 h-3 group-data-[state=open]/c:rotate-90 transition-transform duration-200"
            />
            詳細介紹
          </button>
          <template #content>
            <p
              class="mt-2 ml-4 text-sm text-abyssal-ink/55 leading-relaxed border-l-2 pl-3 text-wrap-pretty"
              :style="{ borderColor: restaurant.categoryColor + '60' }"
            >
              {{ restaurant.description }}
            </p>
          </template>
        </UCollapsible>
      </div>

      <!-- Recommendations -->
      <div
        v-if="restaurant.recommendations?.length"
        class="flex flex-wrap gap-1.5 pt-0.5"
        @click.stop
      >
        <span
          v-for="rec in restaurant.recommendations"
          :key="rec"
          class="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full text-pure-white"
          :style="{ backgroundColor: restaurant.categoryColor }"
        >
          <UIcon name="i-lucide-star" class="w-2.5 h-2.5 shrink-0 opacity-80" />
          {{ rec }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EnrichedRestaurant } from "@/composables/useRestaurants";

defineProps<{
  restaurant: EnrichedRestaurant;
  selected?: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();
</script>
