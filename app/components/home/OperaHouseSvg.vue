<script setup lang="ts">
// Halftone treatment: solid base rect + dense small-dot pattern overlay,
// plus Opera House sail silhouettes in the contrasting accent. Reads as a
// pixel-art block at a glance, recognisable as the Opera House on closer
// inspection. Two-tone: Cyber Violet base, Digital Orange dots + sails.
</script>

<template>
  <svg
    viewBox="0 0 800 600"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label="Halftone Sydney Opera House silhouette"
  >
    <defs>
      <pattern id="caldera-halftone" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="3.8" fill="var(--color-digital-orange)" />
      </pattern>
      <pattern id="caldera-halftone-violet" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="3.8" fill="var(--color-cyber-violet)" />
      </pattern>
      <clipPath id="caldera-block">
        <rect x="0" y="0" width="800" height="600" rx="40" ry="40" />
      </clipPath>
    </defs>

    <g clip-path="url(#caldera-block)">
      <!-- Violet base -->
      <rect x="0" y="0" width="800" height="600" fill="var(--color-cyber-violet)" />

      <!-- Orange dot halftone over entire base -->
      <rect x="0" y="0" width="800" height="600" fill="url(#caldera-halftone)" />

      <!-- Sails: solid orange so they pop above the dot field -->
      <path d="M 80 520 Q 350 130 620 520 Z" fill="var(--color-digital-orange)" />
      <path d="M 280 520 Q 480 220 680 520 Z" fill="var(--color-digital-orange)" />
      <path d="M 450 520 Q 620 290 760 520 Z" fill="var(--color-digital-orange)" />

      <!-- Violet dot halftone re-applied over sails so they read as pixelated too -->
      <g>
        <path d="M 80 520 Q 350 130 620 520 Z" fill="url(#caldera-halftone-violet)" />
        <path d="M 280 520 Q 480 220 680 520 Z" fill="url(#caldera-halftone-violet)" />
        <path d="M 450 520 Q 620 290 760 520 Z" fill="url(#caldera-halftone-violet)" />
      </g>

      <!-- Water line: thin Abyssal Ink bar -->
      <rect x="0" y="520" width="800" height="6" fill="var(--color-abyssal-ink)" />

      <!-- Sun / moon disc (Pixel Glare) — top-right pixel sun -->
      <circle cx="660" cy="140" r="44" fill="var(--color-pixel-glare)" />
      <circle cx="660" cy="140" r="44" fill="url(#caldera-halftone-violet)" />
    </g>
  </svg>
</template>
