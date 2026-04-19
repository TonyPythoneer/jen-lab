import { categories, restaurants } from '@/assets/data/restaurants'

type Category = typeof categories[number]
export type CategoryId = Category['id']
type Restaurant = typeof restaurants[number]
export type RestaurantArea = Restaurant['area']

const categoryDict = Object.fromEntries(
  categories.map(cat => [cat.id, cat])
) as Record<CategoryId, Category>

const restaurantAreaSet = new Set<RestaurantArea>()
const enrichedRestaurants = restaurants.map(restaurant => {
  const category = categoryDict[restaurant.categoryId]
  restaurantAreaSet.add(restaurant.area)
  return {
    ...restaurant,
    categoryColor: category.color,
    categoryName: category.name
  }
})

export type EnrichedRestaurant = (typeof enrichedRestaurants)[number]

export function useRestaurants() {
  const selectedArea = ref<RestaurantArea | null>(null)
  const selectedCategoryId = ref<CategoryId | null>(null)
  const searchedName = ref('')
  const selectedRestaurantId = ref<string | null>(null)

  const filteredRestaurantList = computed<EnrichedRestaurant[]>(() =>
    enrichedRestaurants
      .filter((r) => !selectedArea.value || r.area === selectedArea.value)
      .filter((r) => !selectedCategoryId.value || r.categoryId === selectedCategoryId.value)
      .filter((r) => !searchedName.value || r.name.toLowerCase().includes(searchedName.value.toLowerCase()))
  )

  const selectedRestaurant = computed(() => filteredRestaurantList.value.find(r => r.id === selectedRestaurantId.value) ?? null)

  function setAreaFilter(area: RestaurantArea | null) {
    selectedArea.value = area
  }

  function setCategoryIdFilter(categoryId: CategoryId | null) {
    selectedCategoryId.value = categoryId
  }

  function setNameFilter(name: string) {
    searchedName.value = name
  }

  function clearFilters() {
    selectedArea.value = null
    selectedCategoryId.value = null
    searchedName.value = ''
  }

  return {
    // consts
    categories,
    categoryDict,
    restaurantAreaSet,
    // computes
    filteredRestaurantList,
    selectedRestaurant,
    // refs
    selectedArea,
    selectedCategoryId,
    searchedName,
    selectedRestaurantId,
    // setters
    setAreaFilter,
    setCategoryIdFilter,
    setNameFilter,
    clearFilters,
  }
}
