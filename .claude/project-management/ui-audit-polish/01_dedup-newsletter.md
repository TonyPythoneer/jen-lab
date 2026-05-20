# 01 — Deduplicate Newsletter Form

## WHY (root cause)

`subscribeEmail` ref + `onSubscribe()` are defined identically in three separate components.
Pages renders all three consecutively (Community → Contact → Newsletter) giving users three
subscription CTAs back-to-back, which kills credibility and feels spammy.

## WHAT was observed

- `app/components/home/SectionCommunity.vue` — violet card with inline email form
- `app/components/home/SectionContact.vue` — ash card "Notes From The Workbench" form
- `app/components/home/SectionNewsletter.vue` — full dark band with form
- `app/pages/index.vue` lines 43–49: all three rendered sequentially with no visual buffer
- Playwright screenshot `12_community.png` + `13_contact.png` + `14_newsletter.png` confirms
  users see three subscribe prompts in ~600px of scroll

## HOW (exact steps)

1. Create `app/composables/useNewsletterSubscribe.ts`:
   ```ts
   export function useNewsletterSubscribe() {
     const toast = useToast();
     const email = ref("");
     function onSubscribe() {
       if (!email.value) return;
       toast.add({
         title: "Thanks — placeholder.",
         description: "Backend not wired yet.",
         color: "primary",
       });
       email.value = "";
     }
     return { email, onSubscribe };
   }
   ```
2. In SectionCommunity, SectionContact, SectionNewsletter: replace local `subscribeEmail`/`onSubscribe`
   with `const { email: subscribeEmail, onSubscribe } = useNewsletterSubscribe()`
3. Remove `<HomeSectionNewsletter />` from `app/pages/index.vue` (line 49).
   SectionCommunity's subscribe card should also be removed (see task 02) — if doing 01+02
   together, only SectionContact's form remains.

## VERIFY

- `vp check` passes (= `pnpm lint && pnpm typecheck`)
- Grep: `subscribeEmail` and `onSubscribe` appear in source only inside the composable + import sites
- Page renders Contact section with working form; Newsletter section absent
