<template>
  <svg
    viewBox="0 0 400 280"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label="Stylised Sydney Harbour Bridge arch"
  >
    <defs>
      <pattern id="bridge-dots" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="3.5" fill="var(--color-cyber-violet)" />
      </pattern>
    </defs>

    <!-- Halftone backdrop disc -->
    <circle cx="200" cy="170" r="160" fill="var(--color-pixel-glare)" />
    <circle cx="200" cy="170" r="160" fill="url(#bridge-dots)" />

    <!-- Two pylons -->
    <rect x="48" y="120" width="34" height="120" rx="6" fill="var(--color-abyssal-ink)" />
    <rect x="318" y="120" width="34" height="120" rx="6" fill="var(--color-abyssal-ink)" />

    <!-- Single span arch -->
    <path
      d="M 60 220 Q 200 30 340 220"
      stroke="var(--color-abyssal-ink)"
      stroke-width="14"
      stroke-linecap="round"
      fill="none"
    />

    <!-- Roadway -->
    <rect x="40" y="218" width="320" height="10" fill="var(--color-abyssal-ink)" />

    <!-- Suspension dots -->
    <g fill="var(--color-digital-orange)">
      <circle cx="90" cy="170" r="4" />
      <circle cx="120" cy="135" r="4" />
      <circle cx="150" cy="110" r="4" />
      <circle cx="180" cy="92" r="4" />
      <circle cx="220" cy="92" r="4" />
      <circle cx="250" cy="110" r="4" />
      <circle cx="280" cy="135" r="4" />
      <circle cx="310" cy="170" r="4" />
    </g>

    <!-- Water line dots -->
    <g fill="var(--color-cyber-violet)">
      <circle cx="60" cy="252" r="4" />
      <circle cx="100" cy="252" r="4" />
      <circle cx="140" cy="252" r="4" />
      <circle cx="180" cy="252" r="4" />
      <circle cx="220" cy="252" r="4" />
      <circle cx="260" cy="252" r="4" />
      <circle cx="300" cy="252" r="4" />
      <circle cx="340" cy="252" r="4" />
    </g>
  </svg>
</template>
