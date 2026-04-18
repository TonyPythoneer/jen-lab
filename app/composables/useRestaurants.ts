import { categories, restaurants } from '@/assets/data/restaurants'

type Category = typeof categories[number]
type CategoryId = Category['id']
type Restaurant = typeof restaurants[number]
type restaurantArea = Restaurant['area']

const categoryIdSet = new Set<CategoryId>()
const categoryDict = Object.fromEntries(categories.map(cat => {
  categoryIdSet.add(cat.id)
  return [cat.id, cat]
})
) as Record<Category['id'], Category>

const restaurantAreaSet = new Set<restaurantArea>()
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
  const selectedArea = ref<restaurantArea | null>(null)
  const selectedCategoryId = ref<CategoryId | null>(null)
  const searchedName = ref('')

  const filteredRestaurantList = computed<EnrichedRestaurant[]>(() =>
    enrichedRestaurants
      .filter((r) => !selectedArea.value || r.area === selectedArea.value)
      .filter((r) => !selectedCategoryId.value || r.categoryId === selectedCategoryId.value)
      .filter((r) => !searchedName.value || r.name.toLowerCase().includes(searchedName.value.toLowerCase()))
  )

  function setAreaFilter(area: string | null) {
    selectedArea.value = area as restaurantArea | null
  }

  function setCategoryIdFilter(categoryId: string | null) {
    selectedCategoryId.value = categoryId as CategoryId | null
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
    // refs
    selectedArea,
    selectedCategoryId,
    searchedName,
    // setters
    setAreaFilter,
    setCategoryIdFilter,
    setNameFilter,
    clearFilters,
  }
}
