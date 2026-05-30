// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import MapView from "./MapView.vue";

const meta = {
  title: "restaurants/MapView",
  component: MapView,
} satisfies Meta<typeof MapView>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockRestaurants = [
  {
    id: "rest-1",
    name: "Meat and Wine Co",
    area: "CBD",
    categoryId: "steakhouse",
    categoryName: "牛排館",
    categoryColor: "#A52A2A",
    priceRange: "$$$",
    summary: "Premium steakhouse",
    coordinates: { lat: -33.8688, lng: 151.2093 },
    googleMapsLink: "https://maps.google.com/?q=rest1",
  },
  {
    id: "rest-2",
    name: "Thai Cuisine",
    area: "Surry Hills",
    categoryId: "thai",
    categoryName: "泰餐",
    categoryColor: "#20B2AA",
    priceRange: "$$",
    summary: "Authentic Thai flavors",
    coordinates: { lat: -33.8844, lng: 151.2213 },
    googleMapsLink: "https://maps.google.com/?q=rest2",
  },
  {
    id: "rest-3",
    name: "Cafe Nero",
    area: "Newtown",
    categoryId: "coffee",
    categoryName: "咖啡",
    categoryColor: "#8B4513",
    priceRange: "$",
    summary: "Great coffee and pastries",
    coordinates: { lat: -33.8965, lng: 151.2012 },
    googleMapsLink: "https://maps.google.com/?q=rest3",
  },
];

export const Default: Story = {
  args: {
    restaurants: mockRestaurants,
    selectedRestaurant: null,
    ready: false,
  },
  render: (args) => ({
    components: { MapView },
    setup: () => {
      const selected = ref(null);
      return { args: { ...args, selectedRestaurant: selected }, selected };
    },
    template: `
      <div style="height: 500px; border: 1px solid #e5e7eb;">
        <MapView
          :restaurants="args.restaurants"
          :selected-restaurant="args.selectedRestaurant"
          @select="(r) => { selected = r; console.log('Selected:', r.name) }"
          @unpin="() => { selected = null; console.log('Unpinned') }"
        />
      </div>
    `,
  }),
};

export const WithSelection: Story = {
  args: {
    restaurants: mockRestaurants,
    selectedRestaurant: mockRestaurants[0],
    ready: false,
  },
  render: (args) => ({
    components: { MapView },
    setup: () => ({
      args,
      selected: ref(mockRestaurants[0]),
    }),
    template: `
      <div style="height: 500px; border: 1px solid #e5e7eb;">
        <MapView
          :restaurants="args.restaurants"
          :selected-restaurant="args.selectedRestaurant"
          @select="(r) => selected = r"
          @unpin="() => selected = null"
        />
      </div>
    `,
  }),
};
