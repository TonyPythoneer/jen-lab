/// <reference types="../_cloudflare/env.d.ts" />

declare module '*.md' {
  import type { ComponentOptions } from 'vue'
  const Component: ComponentOptions
  export default Component
}
