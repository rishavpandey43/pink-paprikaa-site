# 06 — Quality & Gates

**Universal rules:** quality is enforced by gates, not promised by process; tests assert
behaviour, not implementation; every claimed protection is probe-verified (proven to fail when
it should); "done" is defined by the gate registry, not by narrative. The bar does not scale
down with project size.

## 1. Testing philosophy

- **Behaviour, not implementation.** Query by role/label (`getByRole("button", { name: "Order Now" })`);
  never by class, DOM shape, or internal state. A restyle must not break a test; a behaviour
  change must.
- **Per layer:**
  - `utils`/`content`/`seo`: plain unit tests. Schemas test valid + invalid + the edge each
    field's rule exists for (empty alt text rejected, 15-char GSTIN, null price with variations).
  - `ui`: render + interaction + **axe in every component test file**.
  - Transformers: pure-function tests — the highest-value tests in the codebase; input/output
    tables, no mocks.
  - Apps: e2e user journeys against the **real static export** (never `next dev`) — the thing
    users get is the thing tested.
- **No mocking our own code.** Mock only true externals (time, storage, network). Needing to
  mock a sibling means the composition is wrong — fix the design, not the test.
- **Test names state the rule:** `it("rejects a gallery item with empty alt text")`, not
  `it("works")`.
- Deterministic and pristine: inject time, no flake-retries papering over races, zero console
  noise in output (noise in test output is a review finding).

## 2. The gate registry (this repo's binding)

| Gate                   | Tool                                                                                                                                                                                                                                                                                                                                                                                                                   | Blocking where       |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Types                  | `tsc` strict (max flags, incl. `exactOptionalPropertyTypes`)                                                                                                                                                                                                                                                                                                                                                           | verify, pre-push, CI |
| Lint policy (all LAWs) | ESLint 10 flat config — boundaries, `no-raw-hex`, `no-arbitrary-shorthand`, `atomic-layering` (atoms → molecules → organisms → layouts; atoms import only Icon, Typography + lib), `naming-convention` (error), `tailwindcss/no-arbitrary-value` + `no-custom-classname` (token classes only)                                                                                                                          | verify, pre-push, CI |
| Unit/component tests   | Vitest + Testing Library + axe (`expectNoA11yViolations` — every rule but `color-contrast`); `ui:test` `component-variants.spec.ts` asserts twMerge lists equal the token build                                                                                                                                                                                                                                        | verify, CI           |
| Story tests            | `storybook:test` — every story in headless Chromium (`@storybook/addon-vitest`), axe `test: "error"` (every rule but `color-contrast`), `play` interactions; includes the foundation specimens (a missing token fails), Company details (every null fact listed), the Contrast matrix (the exception shown as an exception), the kits at 360px (no sideways scroll) and the React Hook Form + Zod form (keyboard only) | verify, CI           |
| Contrast policy        | `design-tokens:test` over `contrast-pairs.json` — ≥ 4.5, or ≥ 3 only for `brand-fill` over the brand pink                                                                                                                                                                                                                                                                                                              | verify, CI           |
| Token build contract   | `design-tokens:test` (`theme.spec.ts`: namespace resets, references kept, light island restores every override, brand hex once in `tokens/primitive/color.json`)                                                                                                                                                                                                                                                       | verify, CI           |
| Stylesheet literals    | `ui:test` (`styles.spec.ts`) — no hex/rgb/hsl/oklch in `packages/ui/src/**/*.css`                                                                                                                                                                                                                                                                                                                                      | verify, CI           |
| Brand facts            | `content:test` — the two-`a` literal, GSTIN/FSSAI/CIN/PAN/phone formats, nulls not TODOs, no founder names                                                                                                                                                                                                                                                                                                             | verify, CI           |
| Build                  | `next build` static exports + package builds + `storybook:build`                                                                                                                                                                                                                                                                                                                                                       | verify, CI           |
| Formatting             | Prettier, run inside ESLint (`prettier/prettier`) for JS/TS and directly for json/md/css/yaml; `nx format:check` is the CI check; `prettier-plugin-tailwindcss` class order                                                                                                                                                                                                                                            | CI, lint-staged      |
| TS project references  | `nx sync:check`                                                                                                                                                                                                                                                                                                                                                                                                        | CI                   |
| E2E + a11y             | Playwright + @axe-core (vs the real export)                                                                                                                                                                                                                                                                                                                                                                            | CI                   |
| Performance/a11y/SEO   | Lighthouse budgets (perf ≥ 0.95, a11y = 1, SEO = 1, LCP ≤ 2.5s, CLS ≤ 0.1, TBT ≤ 200ms, ≤ 1MB total, ≤ 600KB images)                                                                                                                                                                                                                                                                                                   | CI                   |
| Founder-name ban       | `guard:founder` over `apps/web/out`, `apps/blog/out`, `apps/storybook/storybook-static` (incl. sourcemaps, extensionless, svg)                                                                                                                                                                                                                                                                                         | CI                   |
| Commit hygiene         | commitlint + Commitizen                                                                                                                                                                                                                                                                                                                                                                                                | commit-msg hook      |
| Package manager        | only-allow + engines + workspace protocol                                                                                                                                                                                                                                                                                                                                                                              | preinstall           |

**Known gaps** (recorded, not yet closed; tracked in the [09](09-decision-log.md) drift ledger):

- Inside `compoundVariants` and `compoundSlots` (listed in the plugin's default `ignoredKeys`),
  `eslint-plugin-tailwindcss` checks only the `class` property. A `className:` there is unchecked:
  `className: "h-[13px] bg-red-500"` passes, while the same classes under `class:` fail (probed
  2026-09-27). `no-arbitrary-shorthand` still sees every literal. The rule for authors is to write
  `class:` (AUTHORING §6).
- `no-arbitrary-shorthand` misses the opacity-modifier form (`bg-pink-500/(--alpha)`) and variable
  variants (`max-(--bp):`).

Budget values and guard coverage are LAW: **fix the page, never the budget; widen the guard,
never narrow it** (narrowing = decision-log event with justification).

## 3. The promotion rule

A CONVENTION violated more than twice becomes a LAW: write the lint rule / script / CI step,
prove it bites (§4), register it here and in [05](05-tooling-and-config.md). Prose that keeps
being ignored is a bug in the system, not in the people.

## 4. Probe discipline (the rule that keeps rules honest)

**Every protection is proven by a deliberate violation at introduction time** — and the probe's
output is recorded in the PR:

1. Introduce the violation (raw hex in a package, downward atomic import, founder name planted
   in built output, boundary-crossing import, misordered imports).
2. Run the gate — it must FAIL with the expected message. Capture the output.
3. Remove the probe; run green; verify no residue (`git status` clean).

History proves why: this repo's atomic-layering rule passed its original validation but was
**dead under real invocation** (config-discovery base-path mismatch) — only a probe at the real
call site caught it. A gate that has never failed is unverified, and an unverified gate is
prose with extra steps.

## 5. Review rubric (what a reviewer — human or AI — checks beyond gates)

In order: (1) placement per the decision tree; (2) shape matches the canonical pattern;
(3) state on the lowest ladder rung; (4) names per 04; (5) tests assert the actual rule;
(6) no scope creep beyond the task's written intent; (7) docs updated in-PR if a decision
changed. Findings carry severity (Critical/Important/Minor) with file:line evidence — vague
review comments are rejected the same as vague names.
