import type { DivIcon } from "leaflet";
import { markerIcons } from "@/assets/data/map";

type LeafletInstance = typeof import("leaflet");
type IconOpt = { color: string };

// Default unselected marker: a small colored circle with a white outline.
export function makeDotIcon(L: LeafletInstance, opt: IconOpt): DivIcon {
  const { dot } = markerIcons;
  const html = `<div style="
    width:${dot.size}px;
    height:${dot.size}px;
    background:${opt.color};
    border:${dot.border};
    border-radius:50%;
    box-shadow:${dot.shadow};
  "></div>`;
  return L.divIcon({
    className: "",
    html,
    iconSize: [dot.size, dot.size],
    iconAnchor: [dot.size / 2, dot.size / 2],
  });
}

// Selected marker: classic teardrop pin with a hopping intro animation.
// Two bounces (40px → 20px) on a 0.7s timeline, ease-out on the rise and ease-in on the fall.
export function makePinIcon(L: LeafletInstance, opt: IconOpt): DivIcon {
  const { pin } = markerIcons;
  const easeRise = "cubic-bezier(0.215,0.61,0.355,1)";
  const easeFall = "cubic-bezier(0.55,0.055,0.675,0.19)";

  const keyframes = `@keyframes pin-hop {
    0%   { transform: translateY(0);     animation-timing-function: ${easeRise} }
    25%  { transform: translateY(-40px); animation-timing-function: ${easeFall} }
    50%  { transform: translateY(0);     animation-timing-function: ${easeRise} }
    75%  { transform: translateY(-20px); animation-timing-function: ${easeFall} }
    100% { transform: translateY(0) }
  }`;

  const html = `
    <style>${keyframes}</style>
    <div style="
      width:${pin.size}px;
      height:${pin.size}px;
      animation:pin-hop 0.7s 1 forwards;
    ">
      <div style="
        width:100%;
        height:100%;
        background:${opt.color};
        border:${pin.border};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:${pin.shadow};
        display:flex;
        align-items:center;
        justify-content:center;
      ">
        <div style="
          width:40%;
          height:40%;
          background:white;
          border-radius:50%;
        "></div>
      </div>
    </div>
  `;

  return L.divIcon({
    className: "",
    html,
    iconSize: [pin.size, pin.size],
    iconAnchor: [pin.size / 2, pin.size],
  });
}
