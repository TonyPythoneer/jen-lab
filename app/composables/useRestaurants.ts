import type { categories, restaurants } from '~/assets/data/pages/restaurants'

const importDataSource = () => import('~/assets/data/pages/restaurants')

type Category = typeof categories[number]
export type CategoryId = Category['id']
type Restaurant = typeof restaurants[number]
export type RestaurantArea = Restaurant['area']

async function loadData() {
  const { categories, restaurants } = await importDataSource()

  const categoryDict = Object.fromEntries(categories.map(c => [c.id, c])) as Record<CategoryId, Category>

  const restaurantAreaSet = new Set<RestaurantArea>()
  const enrichedRestaurants = restaurants.map(r => {
    const category = categoryDict[r.categoryId]
    restaurantAreaSet.add(r.area)
    return { ...r, categoryColor: category.color, categoryName: category.name }
  })

  return { categories, restaurantAreaSet, enrichedRestaurants }
}
export type EnrichedRestaurant = Awaited<ReturnType<typeof loadData>>['enrichedRestaurants'][number]

export function useRestaurants() {
  const { status, data } = useLazyAsyncData('~/assets/data/pages/restaurants', loadData)

  const selectedArea = ref<RestaurantArea | null>(null)
  const selectedCategoryId = ref<CategoryId | null>(null)
  const searchedName = ref('')
  const selectedRestaurantId = ref<string | null>(null)

  const isReady = computed(() => status.value === 'success')
  const categories = computed(() => data.value?.categories ?? [])
  const restaurantAreaSet = computed(() => data.value?.restaurantAreaSet ?? new Set<RestaurantArea>())
  const filteredRestaurantList = computed<EnrichedRestaurant[]>(() =>
    (data.value?.enrichedRestaurants ?? []).filter((r) =>
      (!selectedArea.value || r.area === selectedArea.value) &&
      (!selectedCategoryId.value || r.categoryId === selectedCategoryId.value) &&
      (!searchedName.value || r.name.toLowerCase().includes(searchedName.value.toLowerCase()))
    )
  )
  const selectedRestaurant = computed(() =>
    filteredRestaurantList.value.find(r => r.id === selectedRestaurantId.value) ?? null
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
