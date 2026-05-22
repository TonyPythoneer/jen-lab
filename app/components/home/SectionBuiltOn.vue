<script setup lang="ts">
const builtOn = [
  {
    name: "Nuxt 4",
    caption: "Framework",
    icon: "i-simple-icons-nuxt",
    accent: "text-emerald-500",
    highlight: true,
  },
  {
    name: "Vue 3",
    caption: "Runtime",
    icon: "i-simple-icons-vuedotjs",
    accent: "text-emerald-600",
  },
  {
    name: "Tailwind 4",
    caption: "Styling",
    icon: "i-simple-icons-tailwindcss",
    accent: "text-sky-500",
  },
  {
    name: "Nuxt UI",
    caption: "Components",
    icon: "i-simple-icons-nuxt",
    accent: "text-emerald-500",
  },
  {
    name: "Cloudflare",
    caption: "Hosting",
    icon: "i-simple-icons-cloudflare",
    accent: "text-orange-500",
  },
  {
    name: "Vite",
    caption: "Bundler",
    icon: "i-simple-icons-vite",
    accent: "text-yellow-500",
    highlight: true,
  },
  {
    name: "TypeScript",
    caption: "Language",
    icon: "i-simple-icons-typescript",
    accent: "text-blue-600",
  },
  { name: "pnpm", caption: "Package mgr", icon: "i-simple-icons-pnpm", accent: "text-yellow-600" },
];
</script>

<template>
  <section class="space-y-6">
    <div class="flex items-end justify-between gap-4 px-1">
      <div class="space-y-2">
        <span class="text-cyber-violet text-xs uppercase tracking-widest">Built on</span>
        <h2
          class="font-display tracking-[0.02em] leading-[0.95] text-abyssal-ink text-4xl md:text-5xl"
        >
          The Stack
          <span class="block text-digital-orange">Beneath The Site.</span>
        </h2>
      </div>
      <span class="hidden md:inline text-xs uppercase tracking-widest text-abyssal-ink/60 shrink-0">
        Open source · MIT
      </span>
    </div>

    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
      <div
        v-for="(t, i) in builtOn"
        :key="t.name"
        class="group rounded-card p-6 md:p-8 flex flex-col gap-4"
        :class="
          t.highlight
            ? 'bg-cyber-violet text-pure-white'
            : 'bg-ash-white text-abyssal-ink hover:bg-pixel-glare/40'
        "
      >
        <div
          class="size-12 rounded-card flex items-center justify-center"
          :class="t.highlight ? 'bg-pure-white/15' : 'bg-basalt-canvas group-hover:bg-pure-white'"
        >
          <UIcon
            :name="t.icon"
            class="size-7"
            :class="t.highlight ? 'text-pure-white' : t.accent"
          />
        </div>
        <div class="space-y-1">
          <p class="font-display tracking-[0.02em] text-2xl leading-none">{{ t.name }}</p>
          <p
            class="text-xs uppercase tracking-widest"
            :class="t.highlight ? 'text-pure-white/70' : 'text-abyssal-ink/60'"
          >
            {{ t.caption }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
