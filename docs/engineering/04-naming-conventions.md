# 04 — Naming Conventions

Names are the cheapest documentation and the first thing lint can check. Most of this section is
LAW (`@typescript-eslint/naming-convention` + curated rules); the rest is CONVENTION verified in
review. By-example, because examples out-teach rules.

## 1. Files

| Kind               | Rule                          | Example                                                     |
| ------------------ | ----------------------------- | ----------------------------------------------------------- |
| Component file     | kebab-case = component name   | `offer-strip.tsx` → `OfferStrip`                            |
| Hook file          | kebab-case, `use-` prefix     | `use-offer-dismissal.ts`                                    |
| Feature role files | kebab + role suffix           | `menu-constants.ts`, `menu-transformer.ts`, `menu-utils.ts` |
| Test / stories     | same stem + role              | `offer-strip.test.tsx`, `offer-strip.stories.tsx`           |
| Generated          | never hand-edited, gitignored | `dist/`, `.content-collections/`                            |
| Config             | tool's own convention         | `next.config.mjs`, `eslint.config.mjs`                      |

One primary export per file; the file is named after it. (Adopted from the reference codebase's
role-suffix system, R-14 — its PascalCase component filenames were **not** adopted; kebab-case
avoids the case-sensitivity class of git/filesystem bugs and matches every config file's
convention.)

## 2. Symbols (LAW — lint-enforced)

| Thing              | Rule                                                 | Example                                |
| ------------------ | ---------------------------------------------------- | -------------------------------------- |
| Component          | PascalCase, named export                             | `export function MenuSection`          |
| Props type         | `<Name>Props`, exported beside the component         | `MenuSectionProps`                     |
| Hook               | `useX` camelCase                                     | `useOfferDismissal`                    |
| Boolean            | prefixed `is/has/should/can/did/will/does/…`         | `isOpen`, `hasVariants`, `canOrder`    |
| Handler (internal) | `handleX`                                            | `handleDismiss`                        |
| Handler (prop)     | `onX`                                                | `onDismiss`                            |
| Constant primitive | `UPPER_SNAKE_CASE`                                   | `OFFER_DISMISS_TTL_HOURS`              |
| Constant object    | camelCase or UPPER_SNAKE, always `as const`          | `MENU_TAG_LABELS`                      |
| Type/interface     | PascalCase; **never `I`-prefixed** (lint rejects)    | `MenuView`, not `IMenuView`            |
| Type property      | camelCase; `snake_case` only mirroring a wire format | `periodStart` / `pay_run_id` (API DTO) |
| Enum-like          | `as const` object + union type — **no TS `enum`**    | `const ROUTES = {…} as const`          |
| Generic param      | PascalCase, descriptive beyond `T` when non-trivial  | `TItem`, `TSchema`                     |

## 3. Imports (LAW — perfectionist + boundaries; auto-fixed on save)

Order: Node builtins → external → internal (`@pink-paprikaa-web/*`, then `@/*`) → relative.
One blank line between groups. Reach rules:

| Distance                 | Form                                      |
| ------------------------ | ----------------------------------------- |
| Cross-package            | scope only: `@pink-paprikaa-web/ui`       |
| In-app, cross-folder     | alias: `@/features/menu/menu-transformer` |
| Same module directory    | relative: `./menu-utils`                  |
| Another package's `src/` | **never** (boundary violation)            |

## 4. Copy & domain terms (this repo's binding — hard rules)

- `Pink Paprikaa` — two `a`s, everywhere, including comments and test fixtures (a misspelling in
  a fixture will end up asserted against).
- Founder names never appear in source, comments, fixtures, or output (CI-gated on output; the
  guard's own regex and its e2e twin are the only sanctioned occurrences).
- Rupee amounts in copy: `₹310` plainly — no `/-`, no "starting at just".

## 5. Naming review heuristics (CONVENTION)

- A name that needs a comment to disambiguate is wrong — rename, don't annotate.
- Plural = collection, singular = item; no `data`/`info`/`item2` names.
- Transformers say both ends: `toMenuView`, `fromCsvRow` — never `process`, `handleData`.
- If two names differ by one typo-able character (`payRun`/`payrun`), rename one — the
  reference codebase shipped twin transformer files differing by a typo (R-15's lesson).

## 6. Props — translating a design-system `.d.ts` (LAW for booleans; CONVENTION otherwise)

Every design-system prop keeps its name and meaning except these translations (spec §8.2):

| Design system prop pattern                               | This system                                                                             |
| -------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `icon?: string` (a Lucide name)                          | `icon?: IconComponent` — a `lucide-react` icon or a brand glyph                         |
| `style?: CSSProperties`                                  | `className?: string` (+ native props)                                                   |
| `on?: "light" \| "brand"`                                | removed — surface-aware through `data-surface` (D5)                                     |
| `base?: string` (asset folder)                           | removed — artwork is inlined                                                            |
| boolean `fullWidth`, `loading`, `selected`, `chevron`, … | `isFullWidth`, `isLoading`, `isSelected`, `hasChevron`, … (`is/has` prefixes — LAW)     |
| numeric px `size`/`width`/`min`/`tile`                   | token-backed enums (`size: "sm" \| "md" \| "lg"`, AutoGrid `min: "xs" … "2xl"`)         |
| free CSS strings (`radius`, a tone colour, `measure`)    | token enums only                                                                        |
| `onClick` used for navigation                            | `href` / `asChild`                                                                      |
| `onChange(value)`                                        | `onValueChange(value)` (native-backed controls keep native `onChange` for `register()`) |
| `open` + `onClose`                                       | `open` / `defaultOpen` / `onOpenChange`                                                 |
| `error?: boolean \| string` on a control                 | control `status` + `aria-invalid`; the message is rendered by `Field`                   |
| string-or-object option lists                            | object lists only (`{ value, label }`) — strings are not control flow                   |

Controlled/uncontrolled pairs follow Radix: `value`/`defaultValue`/`onValueChange`,
`checked`/`defaultChecked`/`onCheckedChange`, `open`/`defaultOpen`/`onOpenChange`. Titled
components take `headingLevel`.
