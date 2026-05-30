// @ts-nocheck
import type { Meta, StoryObj } from "@storybook/vue3-vite";
import RestaurantCard from "./RestaurantCard.vue";

const meta = {
  title: "restaurants/RestaurantCard",
  component: RestaurantCard,
} satisfies Meta<typeof RestaurantCard>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultRestaurant = {
  id: "rest-1",
  name: "Meat and Wine Co",
  area: "CBD",
  categoryId: "steakhouse",
  categoryName: "牛排館",
  categoryColor: "#A52A2A",
  priceRange: "$$$",
  summary:
    "Premium steakhouse with an extensive wine selection. Known for high-quality cuts and impeccable service.",
  description:
    "Located in the heart of Sydney CBD, this steakhouse offers a refined dining experience with carefully curated wines from around the world.",
  recommendations: ["Prime Ribeye", "Wine Pairing", "Signature Steak"],
  coordinates: { lat: -33.8688, lng: 151.2093 },
  googleMapsLink: "https://maps.google.com",
};

export const Default: Story = {
  args: {
    restaurant: defaultRestaurant,
    selected: false,
  },
  render: (args) => ({
    components: { RestaurantCard },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-sm">
        <RestaurantCard v-bind="args" @select="() => console.log('Selected')" />
      </div>
    `,
  }),
};

export const Selected: Story = {
  args: {
    restaurant: defaultRestaurant,
    selected: true,
  },
  render: (args) => ({
    components: { RestaurantCard },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-sm">
        <RestaurantCard v-bind="args" @select="() => console.log('Selected')" />
      </div>
    `,
  }),
};

export const WithoutDescription: Story = {
  args: {
    restaurant: {
      ...defaultRestaurant,
      description: undefined,
    },
    selected: false,
  },
  render: (args) => ({
    components: { RestaurantCard },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-sm">
        <RestaurantCard v-bind="args" @select="() => console.log('Selected')" />
      </div>
    `,
  }),
};

export const WithoutRecommendations: Story = {
  args: {
    restaurant: {
      ...defaultRestaurant,
      recommendations: undefined,
    },
    selected: false,
  },
  render: (args) => ({
    components: { RestaurantCard },
    setup: () => ({ args }),
    template: `
      <div class="p-6 max-w-sm">
        <RestaurantCard v-bind="args" @select="() => console.log('Selected')" />
      </div>
    `,
  }),
};
