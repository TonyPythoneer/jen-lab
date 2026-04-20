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

  // --- Animation params ---
  const hop1Height = -40    // px, first bounce height
  const hop2Height = -20    // px, second bounce height (should be smaller)
  const duration   = '0.7s'   // total animation duration

  // --- Pin shape params ---
  const dotSize    = '40%'  // white circle size relative to pin

  // easing: rise = ease-out (slow at top), fall = ease-in (accelerate down)
  const easeRise = 'cubic-bezier(0.215,0.61,0.355,1)'
  const easeFall = 'cubic-bezier(0.55,0.055,0.675,0.19)'

  const keyframes = `
    @keyframes pin-hop {
      0%  { transform: translateY(0);             animation-timing-function: ${easeRise} }
      25% { transform: translateY(${hop1Height}px); animation-timing-function: ${easeFall} }
      50% { transform: translateY(0);             animation-timing-function: ${easeRise} }
      75% { transform: translateY(${hop2Height}px); animation-timing-function: ${easeFall} }
      100%{ transform: translateY(0) }
    }
  `

  const wrapperStyle = [
    `width: ${pin.size}px`,
    `height: ${pin.size}px`,
    `animation: pin-hop ${duration} 1 forwards`,
  ].join('; ')

  const pinStyle = [
    `width: 100%`,
    `height: 100%`,
    `background: ${opt.color}`,
    `border: ${pin.border}`,
    `border-radius: 50% 50% 50% 0`,
    `transform: rotate(-45deg)`,
    `box-shadow: ${pin.shadow}`,
    `display: flex`,
    `align-items: center`,
    `justify-content: center`,
  ].join('; ')

  const dotStyle = [
    `width: ${dotSize}`,
    `height: ${dotSize}`,
    `background: white`,
    `border-radius: 50%`,
  ].join('; ')

  const html = `
    <style>${keyframes}</style>
    <div style="${wrapperStyle}">
      <div style="${pinStyle}">
        <div style="${dotStyle}"></div>
      </div>
    </div>
  `

  return L.divIcon({
    className: '',
    html,
    iconSize: [pin.size, pin.size],
    iconAnchor: [pin.size / 2, pin.size],
  })
}
