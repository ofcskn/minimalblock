---
name: i18n-engineer
description: Automatically internationalize React components in the minimalblock app for Turkish (tr) and English (en). Detects static text, generates keys, adds translations to both locale files, and replaces hardcoded strings with t() calls. No static text allowed — only i18n.
---

# I18n Engineer

## Use when
- A component or page contains any hardcoded string literal rendered in JSX
- A new page or component is added and needs translating
- A user requests "add i18n", "internationalize this", or "no static text"
- `placeholder`, `aria-label`, `title`, `alt` attributes have hardcoded strings

## Never leave behind
- String literals inside JSX (e.g. `<p>Loading...</p>`)
- Template literals with UI text (e.g. `` `Hello ${name}` ``)
- `placeholder="..."`, `aria-label="..."`, `alt="..."` with literal values
- Button/label/option text hardcoded in JSX

---

## Project i18n stack

| Item | Value |
|------|-------|
| Library | `react-i18next` + `i18next` |
| Config | `apps/web/src/i18n/index.ts` |
| English | `apps/web/src/i18n/locales/en.ts` |
| Turkish | `apps/web/src/i18n/locales/tr.ts` |
| Hook | `useTranslation()` from `react-i18next` |
| Call | `t('namespace.key')` or `t('namespace.key', { var })` |
| Default lang | Turkish (`tr`) |
| Fallback lang | English (`en`) |

Both locale files export a **TypeScript `as const` object** — no JSON files, no separate namespace files.

---

## Namespace map

Pick the namespace based on where the component lives:

| Namespace | Use for |
|-----------|---------|
| `nav` | Sidebar, top-bar navigation labels |
| `common` | Shared actions: Cancel, Save, Delete, Back, Refresh |
| `auth` | Login, signup, password, email, OAuth strings |
| `profile` | User profile menu items |
| `category` | Product category labels |
| `gallery` | Gallery page, QA queue, toolbar, empty states |
| `upload` | Upload/conversion form and flow |
| `dashboard` | Analytics dashboard, charts, orders widget |
| `orders` | Orders list page, table columns, statuses |
| `product` | Product detail, QA review, modals (embed, reject, trendyol) |

Add a new top-level namespace only when the content clearly does not fit any existing one.

---

## Key naming rules

- `camelCase` for all key names
- Nest with objects when a screen section groups ≥ 3 keys (e.g. `deleteModal.title`)
- Use `_one` / `_other` suffixes for plurals (i18next plural convention)
- Use `{{variableName}}` for interpolated values
- Prefix with the namespace in the `t()` call: `t('gallery.loadMore')`

---

## Workflow — step by step

### 1. Read the target file
Read the full component. Identify every hardcoded string:
- Text nodes: `<span>Foo</span>` → `Foo`
- Attribute strings: `placeholder="Enter name"`, `aria-label="Close"`, `alt="Product image"`
- Conditional text: `error ? 'Failed' : 'Success'`
- Template literal UI text: `` `${count} items` ``

### 2. Determine namespaces and keys
Map each string to a `namespace.key`. Reuse existing keys from the locale files when they match exactly (check `en.ts` first).

### 3. Write translations for both locales

**English (`en.ts`)**: use the original English text (or a clean version of it).

**Turkish (`tr.ts`)**: translate accurately. Guidelines:
- "Cancel" → "İptal", "Save" → "Kaydet", "Delete" → "Sil", "Back" → "Geri"
- Use formal/polite tone (siz-based where needed)
- Keep brand names (Trendyol, Gemini, GLB) unchanged
- Preserve `{{variable}}` placeholders verbatim

Edit **both** locale files in the same response — never add a key to one without the other.

### 4. Replace static text in the component

Add the import if missing:
```tsx
import { useTranslation } from 'react-i18next';
```

Add the hook inside the component if missing:
```tsx
const { t } = useTranslation();
```

Replace each hardcoded string:
```tsx
// Before
<button>Save changes</button>
// After
<button>{t('common.save')}</button>

// Before — interpolation
<p>{count} products synced</p>
// After
<p>{t('nav.productsSynced', { count })}</p>

// Before — attribute
<input placeholder="Enter product name" />
// After
<input placeholder={t('upload.productNamePlaceholder')} />
```

### 5. Verify
- No string literals remain in JSX or attributes (except technical values like CSS class names, IDs, event names, URLs)
- Both `en.ts` and `tr.ts` have the new keys at identical paths
- The component still type-checks (`npx nx typecheck web`)
- Run `npx nx dev web` if possible to do a quick visual check

---

## Locale file editing rules

Both files end with `} as const;`. Insert new keys inside the correct namespace object, maintaining alphabetical order within the group where possible.

**Example — adding `gallery.filterLabel`:**

In `en.ts`:
```ts
  gallery: {
    // ... existing keys ...
    filterLabel: 'Filter products',
    // ...
  },
```

In `tr.ts`:
```ts
  gallery: {
    // ... existing keys ...
    filterLabel: 'Ürünleri filtrele',
    // ...
  },
```

---

## Edge cases

| Situation | Handling |
|-----------|----------|
| String is purely a CSS class / HTML attribute with no user-visible meaning | Leave as-is |
| String is a URL or route path | Leave as-is |
| String is a log message or `console.error` | Leave as-is |
| String is an enum value / status code passed to logic | Leave as-is; only translate the display label |
| Component receives a string prop from parent | Translate at the call site, not inside the component |
| Dynamic key (e.g. `t(\`category.${slug}\`)`) | Use only when the key set is finite and all variants exist in locales |
