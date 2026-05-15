# 03 — Tailwind CSS v4 LSP

## Why

Tailwind v4 = CSS-first config. No `tailwind.config.ts`. Entry CSS is `app/assets/css/main.css` (per CLAUDE.md). LSP must autocomplete utility classes inside `.vue` `class=""`, `:class`, and `@apply`.

## Change

```jsonc
{
  "languages": {
    "Vue.js": {
      "language_servers": ["vue-language-server", "tailwindcss-language-server", "!typescript-language-server"]
    }
  },
  "lsp": {
    "tailwindcss-language-server": {
      "settings": {
        "tailwindCSS": {
          "experimental": {
            "configFile": "app/assets/css/main.css"
          },
          "classAttributes": ["class", "className", "ngClass", ":class"],
          "includeLanguages": {
            "vue": "html",
            "vue-html": "html"
          }
        }
      }
    }
  }
}
```

`experimental.configFile` pointing at a `.css` file is the v4 LSP convention (LSP detects v4 via `@import "tailwindcss"` directive inside that file).

## Verify

1. Open `app/components/home/Profile.vue`.
2. Type `class="bg-`. Expect Tailwind palette autocomplete.
3. Hover `text-teal-500` → tooltip with resolved CSS.

If autocomplete missing, check Zed log: `~/Library/Logs/Zed/Zed.log` for `tailwindcss-language-server` errors. Most likely cause: extension not installed.

## Prereq

Zed extension: **Tailwind CSS** (provides `tailwindcss-language-server`).

## Rollback

Drop the `tailwindcss-language-server` block — extension idles silently.
