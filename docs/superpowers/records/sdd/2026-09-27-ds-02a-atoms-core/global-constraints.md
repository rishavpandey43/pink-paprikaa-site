## Global Constraints

- Package manager **pnpm only**; install with `pnpm add` (never hand-write a version in `package.json`). Workspace deps: `pnpm add <pkg> --workspace --filter <project>`.
- TypeScript stays on **6.x** (typescript-eslint caps `<6.1.0`). Node ≥ 24.
- **Never write a literal hex colour** in `.ts/.tsx/.js/.jsx` (`pink-paprikaa/no-raw-hex`, error). Test fixtures that need hex live in `.json` files.
- `#EE2C68` exists once: `packages/design-tokens/tokens/primitive/color.json`.
- **`Pink Paprikaa`** — two `a`s, everywhere. **No founder names** anywhere (source, comments, fixtures, output) — `scripts/check-founder-names.mjs` regex is `/rishav|pandey|anand/i`.
- **Pure veg brand:** nothing non-veg, not even egg (owner, 2026-09-27). Founded **2025**.
- Nx inferred tasks only — **no `project.json`**; per-project overrides go in `package.json` → `"nx"`.
- Named exports, function declarations, **no default exports** (except framework/tool config files). `ref` is a prop (React 19) — **no `forwardRef`**. No TS `enum`; use `as const`.
- Files kebab-case; one primary export per file; booleans prefixed `is/has/should/can/did/will/does`.
- Imports inside `packages/{utils,content,design-tokens}` use `nodenext` resolution → relative imports end in `.js`. Inside `packages/ui` (bundler resolution) relative imports have **no** extension.
- Class names: **only token-backed utilities** — no arbitrary values (`h-[13px]`, `bg-[#…]`, `w-(--x)`); a missing value becomes a token first.
- Commits: Conventional Commits, author with `git commit -m` (commitlint runs in the `commit-msg` hook). Allowed scopes: `web blog storybook ui tokens content seo utils tools ci deps`. Every commit message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **Never `--no-verify`**, never `eslint-disable` a LAW rule.
- Verify APIs against the **installed** package (`node_modules/<pkg>`), never memory.
- A task is done only when its gate command output is green and pasted in the report.

**Atom-tier rules (this plan):**

- **Imports.** An atom file — component, test **and story** — imports only `../icon/*`, `../../lib/*`, `../../../vitest.setup`, its own folder and packages. Stories never compose another atom; they use plain elements with token classes (a raw `<h4>` or `<p>` gets its type and surface colour from the base layer).
- **Skins on surfaces.** A skin with its own fill (white Tag, inverse Button, soft Badge) uses **fixed primitives** and looks the same on every field. A transparent or text-only skin (ghost, link, divider, outline) paints with **semantic tokens**, which follow `data-surface` for free. Only a flip no semantic token describes (primary Button on pink → white) gets a **component colour token**, overridden in `surface/brand.json` / `surface/ink.json` and restored in `surface/light.json`. A component token never aliases a semantic token that a surface overrides: an alias resolves once, where it is declared (`:root`). Task 1's `surface-aliases.spec.ts` fails the build if one does.
- **Dimensions.** Sizes the design system names for a component (control heights, glyph sizes, label type, off-scale radii) are component tokens. Paddings, gaps and offsets use quarter steps of the 4px `--spacing` multiplier (`px-3.5`, `gap-1.25`).
- **Props.** Public `…Props` interfaces spell every variant union out, exactly as in the contract. Never `extends VariantProps<…>`: Storybook's docgen filters out types declared in `node_modules`, so those props would vanish from the tables. `exactOptionalPropertyTypes` is on: use a defaulted parameter (`disabled = false`), not `x || y` on an optional boolean. `prefer-nullish-coalescing` would flag it, and `??` changes the meaning.
- **`asChild`.** `const Component: ElementType = asChild ? Slot.Root : "<el>"`. When the component injects glyphs, the content goes through `<Slot.Slottable child={children}>{(content) => …}</Slot.Slottable>` (verified in `@radix-ui/react-slot@1.3.3`). `type` and `disabled` never reach a slotted child; use `aria-disabled` instead. Put classes on the component, never on the slotted child: `Slot` joins the child's `className` onto the component's without tailwind-merge, so `<Card asChild><a className="rounded-xl">` would ship both `rounded-lg` and `rounded-xl`.
- **Pills** (Button, Tag, Badge): `whitespace-nowrap max-w-full shrink-0` on the root and `min-w-0 truncate` on the label span, so a label never wraps and never pushes the page sideways.
- **Before each gate,** run `pnpm exec prettier --write <the task's files>`: Prettier owns class order (D18), so do not hand-sort classes to match. If lint reports only `perfectionist/*` import order, run `pnpm nx lint @pink-paprikaa-web/ui --fix`.

## Controller amendments (2026-09-27)

- **Ruling R13 — optional props accept `undefined`.** Every optional custom prop is declared `name?: T | undefined` (matching React's own DOM prop types) so molecules and organisms can forward a possibly-undefined value under `exactOptionalPropertyTypes` without conditional spreads. Apply this to every `…Props` interface in this plan, including the contract types in `lib/link-as.ts`.
- **Ghost on brand** = white text, no border (C9) — confirmed.
- **Slot class rule** — classes go on the component, never on the slotted child (Slot joins child classes without tailwind-merge) — confirmed as a system rule; AUTHORING.md records it.
- **Ruling R15 — file paths in tests.** Any spec/test in `packages/ui` that reads a file builds its path with `join(import.meta.dirname, "…")` (`node:path`), never `new URL("…", import.meta.url)`: under Vitest's jsdom environment Vite rewrites the latter to an `http://localhost` URL and `readFileSync` fails (found in Plan 1 Task 5).

## Controller amendments — ruling R19 and 2b rulings (2026-09-27)

- **R19 — the symbol is one shared CSS mask, never inline SVG per instance.** Plan 1 Task 7 generates `packages/ui/src/lib/brand-artwork.css` (imported by `styles.css`) defining `--pp-symbol-mask` once and the utility `mask-symbol` (`background-color: currentColor` + the mask). `SymbolMark` (Plan 2a Task 1) is therefore `<span aria-hidden="true" className={…"mask-symbol"…} />` sized by className — no path data in the HTML. Its test asserts the class and `aria-hidden`, and that the rendered HTML contains no `<path`. PatternField uses `mask-image: var(--pp-symbol-mask)` (a class or `style={{ maskImage: "var(--pp-symbol-mask)" }}`) instead of inlining `SYMBOL_DATA_URI_WHITE` per instance. Reason: a 20-dish menu with spice levels would otherwise carry ~80 copies of ~5 KB path data (page budget ≤1 MB). Plan 2b's Rating/SpiceLevel/Spinner and `lib/brand-diamond.tsx` build on this `SymbolMark`.
- **One diamond corner token:** `radius.diamond` (2px) is created once, in Plan 2a (StatusDot's task), and used as `rounded-diamond` by StatusDot and by Plan 2b's `lib/brand-diamond.tsx`; drop `radius-status-dot` / `radius-brand-diamond`.
- **Tooltip** opens with `delayDuration={0}` as designed — accepted.
- **No on-brand variants** for Checkbox/Radio/Switch/Slider (none designed) — YAGNI, accepted.
- **Read-only Select** renders disabled for the visual, **plus a hidden `<input type="hidden" name={name} value={value}>`** so the value is still submitted (react-hook-form reads it) — add a test.
- **R25 — no `SYMBOL_DATA_URI_WHITE` export.** Plan 1 removed it (it tempted per-instance inlining). Task 0 must not expect it; PatternField and SymbolMark use `var(--pp-symbol-mask)` / `mask-symbol` only. Logo no longer accepts SVG `width`/`height` props — size it with classes (`w-50`, or `h-12 w-auto` for header sizing).
