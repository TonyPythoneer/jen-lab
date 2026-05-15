# 02 — Language servers (Vue + TS)

## Why

`.vue` needs Volar; TS in `.vue` should go through Volar's takeover, not parallel `vue-tsc` + `tsserver`. Nuxt 4 generates `.nuxt/tsconfig.json` — LSP must pick it up.

## Change

```jsonc
{
  "languages": {
    "Vue.js": {
      "language_servers": ["vue-language-server", "!typescript-language-server", "tailwindcss-language-server"],
      "tab_size": 2,
      "hard_tabs": false
    },
    "TypeScript": {
      "language_servers": ["vtsls", "!typescript-language-server"],
      "inlay_hints": { "enabled": true, "show_parameter_hints": false, "show_other_hints": true, "show_type_hints": true }
    }
  },
  "lsp": {
    "vtsls": {
      "settings": {
        "typescript": {
          "tsserver": { "maxTsServerMemory": 8192 },
          "preferences": { "importModuleSpecifier": "non-relative" },
          "updateImportsOnFileMove": { "enabled": "always" }
        }
      }
    },
    "vue-language-server": {
      "initialization_options": {
        "vue": { "hybridMode": false }
      }
    }
  }
}
```

Notes:
- `vue` `hybridMode: false` → Volar owns TS in `.vue` (takeover). Required because `vtsls` doesn't natively understand `.vue`.
- `!typescript-language-server` disables Zed's bundled tsserver in favor of vtsls (faster, matches VSCode Volar pairing).
- `importModuleSpecifier: non-relative` → matches Nuxt auto-import + `~/`/`#imports` style.

## Prereq

Zed extensions: **Vue**, **TypeScript (vtsls)**. User installs via `zed: extensions`. List in `07_validation.md`.

## Rollback

Remove `lsp` block and `language_servers` arrays. Volar still works with defaults.
