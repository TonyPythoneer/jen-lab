import type { categories, restaurants } from '~/assets/data/pages/restaurants'

type Category = typeof categories[number]
type Restaurant = typeof restaurants[number]
export type CategoryId = Category['id']
export type RestaurantArea = Restaurant['area']

export type EnrichedRestaurant = Restaurant & {
  categoryColor: string
  categoryName: string
}

async function loadData() {
  const { categories, restaurants } = await import('~/assets/data/pages/restaurants')

  const categoryById = new Map(categories.map(c => [c.id, c]))
  const enrichedRestaurants: EnrichedRestaurant[] = restaurants.map((r) => {
    const c = categoryById.get(r.categoryId)!
    return { ...r, categoryColor: c.color, categoryName: c.name }
  })
  const restaurantAreaSet = new Set<RestaurantArea>(restaurants.map(r => r.area))

  return { categories, restaurantAreaSet, enrichedRestaurants }
}

export function useRestaurants() {
  const { status, data } = useLazyAsyncData('~/assets/data/pages/restaurants', loadData)

  // Filters — each independently nullable, all AND-combined.
  const selectedArea = ref<RestaurantArea | null>(null)
  const selectedCategoryId = ref<CategoryId | null>(null)
  const searchedName = ref('')
  const selectedRestaurantId = ref<string | null>(null)

  const isReady = computed(() => status.value === 'success')
  const categories = computed(() => data.value?.categories ?? [])
  const restaurantAreaSet = computed(() => data.value?.restaurantAreaSet ?? new Set<RestaurantArea>())

  const filteredRestaurantList = computed<EnrichedRestaurant[]>(() => {
    const all = data.value?.enrichedRestaurants ?? []
    const area = selectedArea.value
    const categoryId = selectedCategoryId.value
    const search = searchedName.value.trim().toLowerCase()
    return all.filter(r =>
      (!area || r.area === area)
      && (!categoryId || r.categoryId === categoryId)
      && (!search || r.name.toLowerCase().includes(search)),
    )
  })

  const selectedRestaurant = computed(() =>
    filteredRestaurantList.value.find(r => r.id === selectedRestaurantId.value) ?? null,
  )

  const clearFilters = () => {
    selectedArea.value = null
    selectedCategoryId.value = null
    searchedName.value = ''
  }

  return {
    selectedArea,
    selectedCategoryId,
    searchedName,
    selectedRestaurantId,
    isReady,
    categories,
    restaurantAreaSet,
    filteredRestaurantList,
    selectedRestaurant,
    clearFilters,
  }
}
