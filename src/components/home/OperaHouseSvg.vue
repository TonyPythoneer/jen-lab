<script setup lang="ts">
// Sydney Opera House silhouette. A single static SVG: shapes, transforms and
// clip-paths were derived from the geometry of the former CSS-stacked build.
// useId keeps clipPath ids unique when two instances share a page.
import { useId } from "vue";

const uid = useId();
const cid = (n: number) => `${uid}-opera-c${n}`;
const cref = (n: number) => `url(#${cid(n)})`;
</script>

<template>
  <svg
    viewBox="0 0 1280 680"
    width="100%"
    height="100%"
    preserveAspectRatio="xMidYMax meet"
    aria-hidden="true"
  >
    <defs>
      <clipPath :id="cid(0)" clipPathUnits="userSpaceOnUse">
        <polygon points="181.2,0 453,0 453,229 339.8,229 310.3,160.3 283.1,114.5 237.8,57.3" />
      </clipPath>
      <clipPath :id="cid(1)" clipPathUnits="userSpaceOnUse">
        <polygon points="0,0 192,0 192,305 0,305" />
      </clipPath>
      <clipPath :id="cid(2)" clipPathUnits="userSpaceOnUse">
        <polygon points="65.3,0 65.3,61 69.1,91.5 76.8,122 84.5,137.3 153.6,244 0,183 0,0" />
      </clipPath>
      <clipPath :id="cid(3)" clipPathUnits="userSpaceOnUse">
        <polygon points="181.2,0 407.7,0 357.9,229 310.3,160.3 283.1,114.5 237.8,57.3" />
      </clipPath>
      <clipPath :id="cid(4)" clipPathUnits="userSpaceOnUse">
        <polygon points="181.2,0 453,0 453,229 339.8,229 310.3,160.3 283.1,114.5 237.8,57.3" />
      </clipPath>
      <clipPath :id="cid(5)" clipPathUnits="userSpaceOnUse">
        <polygon points="106.4,0 266,0 266,153 199.5,153 182.2,107.1 166.3,76.5 139.7,38.3" />
      </clipPath>
      <clipPath :id="cid(6)" clipPathUnits="userSpaceOnUse">
        <polygon points="94.8,0 237,0 237,120 177.8,120 162.3,84 148.1,60 124.4,30" />
      </clipPath>
    </defs>
    <path
      d="M240.5 0 L240.5 0 A240.5 281.7 0 0 1 481 281.7 L481 291.1 A240.5 21.9 0 0 1 240.5 313 L240.5 313 A240.5 21.9 0 0 1 0 291.1 L0 281.7 A240.5 281.7 0 0 1 240.5 0 Z"
      fill="#fff"
      transform="matrix(0.17365 -0.98481 0.98481 0.17365 521.6 796.2)"
    />
    <ellipse
      cx="233.5"
      cy="219.5"
      rx="233.5"
      ry="219.5"
      fill="#f5f5f5"
      transform="matrix(1 0 0 1 420 410)"
    />
    <g transform="matrix(0.57358 0.81915 -0.81915 0.57358 946.3 455)">
      <ellipse cx="75" cy="15" rx="75" ry="15" fill="#fff" />
      <ellipse cx="75" cy="15" rx="70" ry="10" fill="#000" />
    </g>
    <g transform="matrix(0.35837 0.93358 -0.93358 0.35837 417 129.1)">
      <ellipse cx="200" cy="20" rx="200" ry="20" fill="#fff" />
      <ellipse cx="200" cy="20" rx="190" ry="10" fill="#000" />
    </g>
    <g transform="matrix(0.5 0.86603 -0.86602 0.5 268 218.6)">
      <ellipse cx="150" cy="15" rx="150" ry="15" fill="#fff" />
      <ellipse cx="150" cy="15" rx="145" ry="10" fill="#000" />
    </g>
    <rect
      x="0"
      y="0"
      width="50"
      height="50"
      fill="#808080"
      transform="matrix(0.93969 0.34202 -0.68404 0.81521 193.6 449.1)"
    />
    <rect
      x="0"
      y="0"
      width="50"
      height="50"
      fill="#808080"
      transform="matrix(1 0.36397 0 1 193 415.9)"
    />
    <ellipse
      cx="150"
      cy="182.5"
      rx="150"
      ry="182.5"
      fill="#ececec"
      transform="matrix(-1 0 0 1 750 370)"
    />
    <ellipse cx="105" cy="42" rx="105" ry="42" fill="#d3d3d3" transform="matrix(1 0 0 1 120 466)" />
    <ellipse
      cx="125"
      cy="62.5"
      rx="125"
      ry="62.5"
      fill="#d3d3d3"
      transform="matrix(1 0 0 1 890 505)"
    />
    <g style="filter: drop-shadow(-1px 2px #000)">
      <g transform="matrix(1 0 0 1 -90 300)">
        <ellipse cx="226.5" cy="114.5" rx="226.5" ry="114.5" fill="#fff" :clip-path="cref(0)" />
      </g>
    </g>
    <g transform="matrix(1 0 0 1 270 320)">
      <ellipse cx="192" cy="152.5" rx="192" ry="152.5" fill="#faf8f8" :clip-path="cref(1)" />
    </g>
    <g transform="matrix(1 0 0 1 270 320)">
      <ellipse cx="192" cy="152.5" rx="192" ry="152.5" fill="#f1f1f1" :clip-path="cref(2)" />
    </g>
    <g transform="matrix(1.56504 0.33266 -0.33266 1.56504 -29.9 160)">
      <ellipse cx="226.5" cy="114.5" rx="226.5" ry="114.5" fill="#fff" :clip-path="cref(3)" />
    </g>
    <g transform="matrix(1.17378 0.35345 -0.24949 1.66285 189.2 69)">
      <ellipse cx="226.5" cy="114.5" rx="226.5" ry="114.5" fill="#fff" :clip-path="cref(4)" />
    </g>
    <g transform="matrix(1 0 0 1 830 461)">
      <ellipse cx="133" cy="76.5" rx="133" ry="76.5" fill="#fff" :clip-path="cref(5)" />
    </g>
    <g transform="matrix(-1 0 0 1 1275 450)">
      <ellipse cx="118.5" cy="60" rx="118.5" ry="60" fill="#fff" :clip-path="cref(6)" />
    </g>
    <polygon points="63,0 140,280 0,280" fill="#faf8f8" transform="matrix(1 0 0 1 400 280)" />
    <g style="filter: drop-shadow(0 -1px #b39f83) drop-shadow(0 -5px #fffaf5)">
      <rect x="0" y="0" width="60" height="90" fill="#fffaf5" transform="matrix(1 0 0 1 140 520)" />
      <polygon points="200,520 240.5,500 240.5,610 200,610" fill="#fffaf5" />
      <rect
        x="0"
        y="0"
        width="60"
        height="110"
        fill="#fffaf5"
        transform="matrix(1 0 0 1 240 500)"
      />
      <polygon points="300,500 401.1,534.3 401.1,610 300,610" fill="#fffaf5" />
      <rect x="0" y="0" width="60" height="75" fill="#fffaf5" transform="matrix(1 0 0 1 400 535)" />
      <polygon points="460,535 520.7,550.2 520.7,610 460,610" fill="#fffaf5" />
      <rect
        x="0"
        y="0"
        width="540"
        height="60"
        fill="#fffaf5"
        transform="matrix(1 0 0 1 520 550)"
      />
      <polygon points="1060,550 1140,568.9 1140,610 1060,610" fill="#fffaf5" />
    </g>
    <rect x="0" y="0" width="1280" height="45" fill="#1e90ff" transform="matrix(1 0 0 1 0 635)" />
    <g transform="translate(40 610)" style="filter: drop-shadow(0 -1px 1px #00000022)">
      <rect x="0" y="0" width="1200" height="25" rx="3" fill="#fffaf5" />
      <rect x="0" y="20" width="1200" height="5" rx="2" fill="#be9f83" />
    </g>
  </svg>
</template>
