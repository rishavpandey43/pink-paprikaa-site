### Task 9: The authoring contract and the records

**Files:**

- Create: `packages/ui/AUTHORING.md`
- Modify: `docs/engineering/02-architecture.md`, `docs/engineering/05-tooling-and-config.md`, `docs/engineering/06-quality-gates.md`, `docs/engineering/09-decision-log.md`, `docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`, `.claude/commands/new-component.md`, `packages/ui/README.md`

**Interfaces:**

- Produces: the binding rules every Plan 2–4 implementer reads before writing a component.

- [ ] **Step 1: `packages/ui/AUTHORING.md`** — the binding contract, in this order (concise, examples from the real Icon/Logo code):
  1. Sources: read the component's `.d.ts`, `.jsx`, `.card.html`, `.prompt.md` in `zip-files/Pink Paprikaa Design System/components/<tier>/` and spec §9 row first.
  2. File set and placement (`<layer>/<kebab>/<kebab>.tsx|.test.tsx|.stories.tsx`), layers and the atom import rule.
  3. Canonical shape (spec §8.1) with `componentVariants`, native props spread, `className` merge, `asChild` via `Slot` from `radix-ui` where the spec row says so.
  4. The prop translation table (spec §8.2) verbatim.
  5. Tokens first: any value not in the token build becomes a component token in `packages/design-tokens/tokens/component/<name>.json`, placed in the Tailwind namespace of its type (`spacing` for sizes, `text` for font sizes (typography composite), `color` for colours, `radius`, `shadow`); add the name to the list in `component-variants.ts`; if it paints text on a new background, add the pair to `contrast-pairs.json`.
  6. No arbitrary values; named utilities for motion/z (`duration-fast`, `z-header`, `press-scale`, `lift`).
  7. Surfaces: never an `on` prop; components that paint a field set `data-surface`.
  8. Server-first: `"use client"` only for state/effects/browser APIs, in the smallest file.
  9. Accessibility checklist (spec §5.5).
  10. Tests: behaviour by role/label, each variant's observable effect, keyboard paths, `expectNoA11yViolations`.
  11. Stories: card parity, `Playground`, `OnSurfaces` where surface-aware, `play` for client components, docs description from `.prompt.md`.
  12. Export from `src/index.ts`; gate commands.

- [ ] **Step 2: Handbook and spec records**
  - `02-architecture.md` §2: layers are `atoms → molecules → organisms → layouts`; `src/lib/` holds library internals (variant builder, artwork, reveal observer).
  - `05-tooling-and-config.md` registry: add `packages/design-tokens/contrast-pairs.json` (owner: contrast policy; change protocol: adding pairs is free, lowering a `min` is a decision-log event), `.prettierrc` plugin keys, `packages/ui/scripts/build-brand-artwork.mjs`.
  - `06-quality-gates.md` §2 registry: contrast policy test; `no-arbitrary-value`; `no-custom-classname`; atom-imports-only-Icon; naming-convention error; guard over `storybook-static`; class order by Prettier.
  - `09-decision-log.md`: add rows D1–D18 from the spec (one line each + spec link); close drift-ledger items "prettier-plugin-tailwindcss not installed" and "naming-convention promotion"; add "component tokens live in Tailwind namespaces; motion/z via named utilities" and "twMerge scale lists are hand-listed and asserted equal to the token build (no runtime token payload)".
  - Spec §6.2/§6.4/§8.3: amend to the implemented reality — component tokens are placed in Tailwind namespaces (`spacing`, `text`, `color`, `radius`, `shadow`) so they are named utilities; durations and z-indices are `@utility` classes; the twMerge lists are hand-written and asserted by `component-variants.spec.ts`.
  - `.claude/commands/new-component.md`: replace the stale `axe(...)` call with `expectNoA11yViolations`, `tv()` with `componentVariants`, add "read the four design-system source files", "tokens first", "card-parity stories".
  - `packages/ui/README.md`: consumer contract (two CSS imports, `transpilePackages` in Next apps), where the contract lives (AUTHORING.md).

- [ ] **Step 3: Final gate for Plan 1 (cold) and commit**

Run:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static 2>&1 | tail -30 \
  && pnpm guard:founder
```

Expected: every task green; guard clean. Paste the summary lines.

```bash
git add -A docs packages/ui/AUTHORING.md packages/ui/README.md .claude/commands/new-component.md
git commit -m "docs: the design system authoring contract and plan 1 records

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```
