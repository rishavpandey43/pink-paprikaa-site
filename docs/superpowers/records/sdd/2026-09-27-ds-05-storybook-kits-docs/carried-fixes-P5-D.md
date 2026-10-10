# Carried fixes after P5-C (from review P5-B) — one fix dispatch with P5-C's review findings

1. Minor, ruling R62 — catalogue.ts `["color-", …]`: chips by role, derived from the name (no hand list): `color-text-*` → `text-` only; `color-surface-*` → `bg-` only; `color-border-*` → `border-` only; status + accent fills (`color-status-*` non-strong, accents) → `bg-`/`border-`; strong companions → `text-`; primitives (pink/ink ramps, white-alpha) keep bg/text/border. Update the class-mapping contract story.
2. Minor — colors.stories.tsx SemanticPanels: hand-typed `--color-*` labels → `token(name).cssVar` via CopyButton.
3. Minor — brand/colors plays: shared `spyOnClipboard()` docs-kit test helper, restore in try/finally.
4. Minor — Storybook vitest config: add the deps Vite re-optimises on the first cold run to `optimizeDeps.include` so the first run is clean.
Deferred to the follow-up pass (after 2b–3b): prose that over-claims absent specimens (pattern.mdx:890, logo.mdx:854, heat.mdx); FactList keyWidth sm/md; CompanyDetails xl check.

## From review P5-C (ruling R63)
5. IMPORTANT — catalogue.spec.ts:163-169 + spacing.stories.tsx:922-928: R61 marker spec forbids markers on tokens not yet used as classes, so primitive sizing tokens get padding chips (`p-header`, `mt-tabbar`, `gap-hit`). Relax: a USED token's marker must equal its uses; an UNUSED token MAY carry one. Mark `spacing-header` + `-header-compact` → h, `spacing-tabbar` → h, `spacing-hit` → min-h + min-w (check every other primitive px spacing token — dock-clearance, card-min, etc. — and mark by its documented use). Update the DERIVED probe at docs-kit.stories.tsx:133-141.
6. Minor — motion.stories.tsx:626: animation chips show class only; add the CSS var (`--animate-*`).
7. Minor — catalogue.spec.ts:148-152: add a comment naming the regex's blind spots (var()/arbitrary-value/template-built classes → read as unused).
8. Minor — spacing.stories.tsx:930 DEPTH_LADDER hand-typed: select shadows by prefix/tier from the catalogue.
