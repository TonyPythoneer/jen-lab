# 10 — Newsletter (UPageCTA + UFormField + UInput + UButton)

Caldera ref: full-width dark band — headline + email input + submit + faint background graphic.

## Goals

- Compose `<UPageCTA>` inline in `app/pages/index.vue`. No wrapper.
- Form submit visual-only: `useToast()` from `@nuxt/ui` shows "Subscribed (placeholder)". No real backend.

## Composition

```vue
<UPageCTA
  :ui="{
    root: 'bg-abyssal-ink rounded-card p-10 md:p-14 relative overflow-hidden',
    title:
      'font-display tracking-[0.02em] leading-[0.95] text-pure-white text-4xl md:text-5xl text-center',
    description: 'text-pure-white/80 text-center mt-4 max-w-prose mx-auto',
  }"
>
  <template #headline>
    <UBadge color="secondary" variant="solid" :ui="{ base: 'rounded-button mx-auto' }">
      Slow mail
    </UBadge>
  </template>
  <template #title>Sign Up For Notes From The Workbench.</template>
  <template #description>
    One short email when something ships. No spam, no daily digest.
  </template>
  <template #links>
    <form class="flex flex-col md:flex-row gap-2.5 w-full max-w-xl mx-auto" @submit.prevent="onSubmit">
      <UFormField name="email" class="flex-1">
        <UInput
          v-model="email"
          type="email"
          required
          placeholder="you@harbour.au"
          :ui="{
            base: 'rounded-input bg-transparent border border-pure-white text-pure-white placeholder:text-pure-white/60 px-8 py-6',
          }"
        />
      </UFormField>
      <UButton type="submit" color="primary" size="xl" :ui="{ base: 'rounded-button' }">
        Subscribe
      </UButton>
    </form>
  </template>

  <!-- Background pixel sail bleed -->
  <HomeOperaHouseSvg
    class="absolute -right-24 -bottom-24 w-[480px] opacity-20 pointer-events-none"
    aria-hidden="true"
  />
</UPageCTA>
```

```ts
const toast = useToast();
const email = ref("");
function onSubmit() {
  toast.add({
    title: "Subscribed (placeholder)",
    description: "Backend not wired yet.",
    color: "primary",
  });
  email.value = "";
}
```

## Files touched

- Edit: `app/pages/index.vue`. No new files (OperaHouseSvg reused from task 04).

## Verification

- Dark band visible between blog cards and footer.
- Input + button align horizontally at ≥768px, stack at mobile.
- Submit triggers toast, page does not reload.
- Tabbing: input → submit → next focusable.

## Out of scope

- Real subscribe endpoint — Jen's account needed.
