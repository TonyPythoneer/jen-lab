<script setup lang="ts">
defineProps<{
  kind: "gum-leaf" | "terminal" | "book" | "compass" | "coffee" | "surf" | "ferris" | "sail";
}>();
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    :aria-label="kind"
  >
    <!-- Gum leaf -->
    <g v-if="kind === 'gum-leaf'">
      <path
        d="M 20 60 Q 30 18 80 30 Q 70 75 30 80 Q 22 72 20 60 Z"
        fill="var(--color-cyber-violet)"
      />
      <path
        d="M 30 78 Q 50 55 76 32"
        stroke="var(--color-pure-white)"
        stroke-width="2"
        fill="none"
      />
    </g>

    <!-- Terminal window -->
    <g v-else-if="kind === 'terminal'">
      <rect x="14" y="20" width="72" height="60" rx="6" fill="var(--color-abyssal-ink)" />
      <circle cx="22" cy="28" r="2.5" fill="var(--color-digital-orange)" />
      <circle cx="30" cy="28" r="2.5" fill="var(--color-pixel-glare)" />
      <circle cx="38" cy="28" r="2.5" fill="var(--color-cyber-violet)" />
      <path
        d="M 24 50 L 32 56 L 24 62 M 38 64 L 56 64"
        stroke="var(--color-pure-white)"
        stroke-width="2.5"
        stroke-linecap="round"
        fill="none"
      />
    </g>

    <!-- Open book -->
    <g v-else-if="kind === 'book'">
      <path d="M 16 28 Q 36 22 50 30 L 50 78 Q 36 70 16 76 Z" fill="var(--color-cyber-violet)" />
      <path d="M 84 28 Q 64 22 50 30 L 50 78 Q 64 70 84 76 Z" fill="var(--color-digital-orange)" />
      <line x1="50" y1="30" x2="50" y2="78" stroke="var(--color-abyssal-ink)" stroke-width="2" />
    </g>

    <!-- Compass -->
    <g v-else-if="kind === 'compass'">
      <circle cx="50" cy="50" r="36" fill="var(--color-pixel-glare)" />
      <circle
        cx="50"
        cy="50"
        r="36"
        fill="none"
        stroke="var(--color-abyssal-ink)"
        stroke-width="2.5"
      />
      <path d="M 50 22 L 56 50 L 50 78 L 44 50 Z" fill="var(--color-digital-orange)" />
      <circle cx="50" cy="50" r="4" fill="var(--color-abyssal-ink)" />
    </g>

    <!-- Coffee cup -->
    <g v-else-if="kind === 'coffee'">
      <path d="M 22 36 H 66 V 64 Q 66 78 50 78 Q 34 78 34 64 Z" fill="var(--color-cyber-violet)" />
      <rect x="22" y="36" width="44" height="6" fill="var(--color-abyssal-ink)" />
      <path
        d="M 66 44 Q 80 46 80 56 Q 80 66 68 68"
        stroke="var(--color-cyber-violet)"
        stroke-width="5"
        fill="none"
      />
      <!-- Steam -->
      <path
        d="M 38 28 Q 36 22 40 18 M 50 28 Q 48 22 52 18 M 62 28 Q 60 22 64 18"
        stroke="var(--color-pixel-glare)"
        stroke-width="2.5"
        fill="none"
        stroke-linecap="round"
      />
    </g>

    <!-- Surf board -->
    <g v-else-if="kind === 'surf'">
      <ellipse
        cx="50"
        cy="50"
        rx="18"
        ry="40"
        transform="rotate(-25 50 50)"
        fill="var(--color-digital-orange)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="18"
        ry="40"
        transform="rotate(-25 50 50)"
        fill="none"
        stroke="var(--color-abyssal-ink)"
        stroke-width="2.5"
      />
      <line
        x1="32"
        y1="50"
        x2="68"
        y2="50"
        transform="rotate(-25 50 50)"
        stroke="var(--color-abyssal-ink)"
        stroke-width="2"
      />
    </g>

    <!-- Ferris wheel -->
    <g v-else-if="kind === 'ferris'">
      <circle
        cx="50"
        cy="46"
        r="30"
        fill="none"
        stroke="var(--color-abyssal-ink)"
        stroke-width="3"
      />
      <line x1="50" y1="16" x2="50" y2="76" stroke="var(--color-abyssal-ink)" stroke-width="2" />
      <line x1="20" y1="46" x2="80" y2="46" stroke="var(--color-abyssal-ink)" stroke-width="2" />
      <line x1="29" y1="25" x2="71" y2="67" stroke="var(--color-abyssal-ink)" stroke-width="2" />
      <line x1="71" y1="25" x2="29" y2="67" stroke="var(--color-abyssal-ink)" stroke-width="2" />
      <circle cx="50" cy="16" r="5" fill="var(--color-digital-orange)" />
      <circle cx="80" cy="46" r="5" fill="var(--color-cyber-violet)" />
      <circle cx="50" cy="76" r="5" fill="var(--color-pixel-glare)" />
      <circle cx="20" cy="46" r="5" fill="var(--color-cyber-violet)" />
      <circle cx="29" cy="25" r="4" fill="var(--color-digital-orange)" />
      <circle cx="71" cy="25" r="4" fill="var(--color-pixel-glare)" />
      <circle cx="29" cy="67" r="4" fill="var(--color-pixel-glare)" />
      <circle cx="71" cy="67" r="4" fill="var(--color-digital-orange)" />
      <circle cx="50" cy="46" r="3" fill="var(--color-abyssal-ink)" />
    </g>

    <!-- Sail -->
    <g v-else-if="kind === 'sail'">
      <path d="M 24 80 Q 50 18 76 80 Z" fill="var(--color-cyber-violet)" />
      <path d="M 36 80 Q 56 30 72 80 Z" fill="var(--color-digital-orange)" />
      <rect x="24" y="78" width="52" height="4" fill="var(--color-abyssal-ink)" />
    </g>
  </svg>
</template>
