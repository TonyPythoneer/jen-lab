// Draws every restaurant pin onto ONE canvas (see useCanvasLayer) and answers
// hit-tests. No shadow/transition/animation — kept out for weak-phone compositing.

import type { Map as LeafletMap } from "leaflet";
import type { EnrichedRestaurant } from "~/composables/food-map/useRestaurants";
import { CATEGORY_ICON } from "~/utils/food-map/foodMapCategories";
import { createCanvasLayer, type CanvasLayerController } from "./useCanvasLayer";

type LeafletNS = typeof import("leaflet");

export interface PinCanvasController {
  setData(list: EnrichedRestaurant[]): void;
  setSelected(id: string | null): void;
  setHovered(categoryId: string | null): void;
  redraw(): void;
  // Container-pixel pointer → restaurant id under it (finger-friendly radius), or null.
  hitTest(containerX: number, containerY: number): string | null;
  destroy(): void;
}

const EMOJI_BAKE = 64; // offscreen bake size in px; drawn down → stays crisp
const INK = "#2c241a";
// Head centre sits this × radius above the tip (a rotated square's centre-to-corner).
const HEAD_RATIO = Math.SQRT2;

// Pin body: a 2R square with border-radius 50%/50%/50%/0 rotated 45°, so its one
// sharp corner points straight down at the tip (x, y). Caller sets globalAlpha.
function drawPinBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  ring: string,
  lineWidth: number,
) {
  const side = 2 * radius;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.roundRect(-side, -side, side, side, [radius, radius, 0, radius]); // [tl, tr, br=sharp, bl]
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = ring;
  ctx.stroke();
  ctx.restore();
}

export function createPinCanvas(map: LeafletMap, L: LeafletNS): PinCanvasController {
  let list: EnrichedRestaurant[] = [];
  let selectedId: string | null = null;
  let hoveredCat: string | null = null;
  const emojiCache = new Map<string, HTMLCanvasElement>();

  function emojiFor(r: EnrichedRestaurant): HTMLCanvasElement {
    let c = emojiCache.get(r.categoryId);
    if (!c) {
      c = document.createElement("canvas");
      c.width = c.height = EMOJI_BAKE;
      const ectx = c.getContext("2d")!;
      ectx.font = `${Math.round(EMOJI_BAKE * 0.74)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      ectx.textAlign = "center";
      ectx.textBaseline = "middle";
      ectx.fillText(
        CATEGORY_ICON[r.categoryId] ?? r.categoryName.charAt(0),
        EMOJI_BAKE / 2,
        EMOJI_BAKE * 0.54,
      );
      emojiCache.set(r.categoryId, c);
    }
    return c;
  }

  function baseRadius(): number {
    return window.innerWidth <= 640 ? 12 : 13;
  }

  const layer: CanvasLayerController = createCanvasLayer(map, L, {
    paneName: "food-pins",
    paneZIndex: 600,
    onDraw: (ctx, { project, zoomScale }) => {
      // Divide sizes by the live zoom scale so the canvas's own scale cancels out →
      // pins stay a constant screen size through a zoom (positions still track).
      const z = zoomScale || 1;
      const r0 = baseRadius() / z;
      // Draw the selected pin last so it sits on top of any it overlaps.
      const ordered =
        selectedId == null
          ? list
          : [...list].sort((a, b) => Number(a.id === selectedId) - Number(b.id === selectedId));

      for (const r of ordered) {
        // `tip` points at the exact location; the round head sits √2·R above it.
        const tip = project(r.coordinates.lat, r.coordinates.lng);
        const isSel = r.id === selectedId;
        const inGroup = hoveredCat != null && r.categoryId === hoveredCat;
        const faded = hoveredCat != null && !inGroup && !isSel;
        const radius = r0 * (isSel ? 1.7 : inGroup ? 1.14 : 1);
        const ring = isSel || inGroup ? r.categoryColor || INK : INK;
        const lineWidth = (isSel || inGroup ? 3.5 : 2.2) / z;

        ctx.globalAlpha = faded ? 0.25 : 1;
        drawPinBody(ctx, tip.x, tip.y, radius, ring, lineWidth);
        const headY = tip.y - HEAD_RATIO * radius;
        const es = radius * 1.3; // emoji size, centred in the head
        ctx.drawImage(emojiFor(r), tip.x - es / 2, headY - es / 2, es, es);
        ctx.globalAlpha = 1;
      }
    },
  });

  return {
    setData(l) {
      list = l;
      layer.redraw();
    },
    setSelected(id) {
      selectedId = id;
      layer.redraw();
    },
    setHovered(cat) {
      hoveredCat = cat;
      layer.redraw();
    },
    redraw: () => layer.redraw(),
    hitTest(cx, cy) {
      // Tap target is the round head, which sits above the tip (the latlng).
      const R = baseRadius();
      const headDy = HEAD_RATIO * R;
      const tol = R + 10; // finger-friendly tap tolerance
      let best: string | null = null;
      let bestD = tol * tol;
      for (const r of list) {
        const tip = map.latLngToContainerPoint([r.coordinates.lat, r.coordinates.lng]);
        const dx = tip.x - cx;
        const dy = tip.y - headDy - cy;
        const d = dx * dx + dy * dy;
        if (d <= bestD) {
          bestD = d;
          best = r.id;
        }
      }
      return best;
    },
    destroy: () => layer.destroy(),
  };
}
