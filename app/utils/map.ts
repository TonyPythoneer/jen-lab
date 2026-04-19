import type { DivIcon } from 'leaflet'
import { markerIcons } from '@/assets/data/map'

type LeafletInstance = typeof import('leaflet')

type IconOpt = { color: string }

export function makeDotIcon(L: LeafletInstance, opt: IconOpt): DivIcon {
  const { dot } = markerIcons
  return L.divIcon({
    className: '',
    html: `<div style="width:${dot.size}px;height:${dot.size}px;background:${opt.color};border:${dot.border};border-radius:50%;box-shadow:${dot.shadow};"></div>`,
    iconSize: [dot.size, dot.size],
    iconAnchor: [dot.size / 2, dot.size / 2],
  })
}

export function makePinIcon(L: LeafletInstance, opt: IconOpt): DivIcon {
  const { pin } = markerIcons
  return L.divIcon({
    className: '',
    html: `<div style="width:${pin.size}px;height:${pin.size}px;background:${opt.color};border:${pin.border};border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:${pin.shadow};"></div>`,
    iconSize: [pin.size, pin.size],
    iconAnchor: [pin.size / 2, pin.size],
  })
}
