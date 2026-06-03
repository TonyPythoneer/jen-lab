<template>
  <svg
    viewBox="0 0 400 280"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid meet"
    role="img"
    aria-label="Stylised stacked Bondi waves"
  >
    <defs>
      <pattern id="wave-dots-violet" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="3.5" fill="var(--color-cyber-violet)" />
      </pattern>
      <pattern id="wave-dots-orange" width="14" height="14" patternUnits="userSpaceOnUse">
        <circle cx="7" cy="7" r="3.5" fill="var(--color-digital-orange)" />
      </pattern>
      <clipPath id="wave-frame">
        <rect x="0" y="0" width="400" height="280" rx="24" />
      </clipPath>
    </defs>

    <g clip-path="url(#wave-frame)">
      <!-- Sky base -->
      <rect x="0" y="0" width="400" height="280" fill="var(--color-pixel-glare)" />

      <!-- Sun -->
      <circle cx="320" cy="70" r="40" fill="var(--color-digital-orange)" />
      <circle cx="320" cy="70" r="40" fill="url(#wave-dots-violet)" />

      <!-- Back wave (violet) -->
      <path
        d="M -20 160 Q 50 110 120 140 T 260 140 T 420 130 L 420 280 L -20 280 Z"
        fill="var(--color-cyber-violet)"
      />

      <!-- Mid wave (orange) -->
      <path
        d="M -20 200 Q 60 160 130 185 T 270 185 T 420 175 L 420 280 L -20 280 Z"
        fill="var(--color-digital-orange)"
      />
      <path
        d="M -20 200 Q 60 160 130 185 T 270 185 T 420 175 L 420 280 L -20 280 Z"
        fill="url(#wave-dots-violet)"
      />

      <!-- Front wave (pure white outlined) -->
      <path
        d="M -20 240 Q 70 210 150 232 T 300 232 T 420 225 L 420 280 L -20 280 Z"
        fill="var(--color-pure-white)"
        stroke="var(--color-abyssal-ink)"
        stroke-width="3"
        stroke-linejoin="round"
      />

      <!-- Foam dots -->
      <g fill="var(--color-abyssal-ink)">
        <circle cx="60" cy="244" r="2.5" />
        <circle cx="110" cy="232" r="2.5" />
        <circle cx="175" cy="246" r="2.5" />
        <circle cx="240" cy="232" r="2.5" />
        <circle cx="310" cy="244" r="2.5" />
      </g>
    </g>
  </svg>
</template>
