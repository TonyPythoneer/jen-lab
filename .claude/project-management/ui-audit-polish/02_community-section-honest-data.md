# 02 — Remove Fake Community Data

## WHY

Fake follower counts and fabricated subscriber numbers undermine trust on a personal site.
Any visitor who checks the actual social profiles will see the numbers are invented.

## WHAT was observed

**Fake counts in `SectionCommunity.vue`:**

```js
const communityPills = [
  { label: "Threads", icon: "i-simple-icons-threads", count: "3.6K" },
  { label: "RSS", icon: "i-lucide-rss", count: "2.7K" },
  { label: "Email", icon: "i-lucide-mail", count: "1.1K" },
];
```

Playwright `12_community.png` shows "3.6K / 2.7K / 1.1K" prominently in large display font.

**Fake subscriber copy in three files (must fix all three):**

- `SectionCommunity.vue` ~line 83: `"ROUGHLY ONE EMAIL PER MONTH · 312 READERS · 0 SPAM"`
- `SectionContact.vue` ~line 96: `"~1 email / month · 312 readers · 0 spam"`
- `SectionNewsletter.vue` ~line 79: `"Roughly one email per month · 312 readers · 0 spam"`

## HOW (exact steps)

1. In `SectionCommunity.vue`: replace `communityPills` array with links pulled from
   `appConfig.contacts` (same source used by SectionContact and Footer). Render as simple
   icon buttons, no counts:
   ```vue
   <script setup>
   const appConfig = useAppConfig();
   </script>
   <!-- in template: -->
   <a v-for="c in appConfig.contacts" :key="c.label" :href="c.url" ...>
     <UIcon :name="c.icon" />
   </a>
   ```
2. In all three files: remove the `"312 readers"` copy entirely. Replace with neutral text
   e.g. `"One short email when something ships"` or leave blank.

## VERIFY

- `vp check` passes
- Grep: string `"312"` does not appear in `app/components/home/`
- Grep: string `"3.6K"` / `"2.7K"` / `"1.1K"` does not appear in `app/components/home/`
- Playwright re-run: Community section shows real social icons, no fabricated numbers
