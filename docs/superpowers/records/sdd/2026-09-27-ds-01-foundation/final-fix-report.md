# Plan 1 — final fix wave: report

Branch `feat/design-system`. Base for this wave: `a0c89fa` (the plan-3a agent's last commit when I
started committing). Ten commits, none touching `docs/superpowers/plans/**`
(`git diff --stat a0c89fa..HEAD -- docs/superpowers/plans` is empty). Every commit went through
husky (lint-staged + commitlint); none used `--no-verify`. Files were staged by explicit path and
committed with `git commit … -- <paths>`, so nothing the concurrent agent had staged could ride
along.

| Commit    | Items                         | Subject                                                                  |
| --------- | ----------------------------- | ------------------------------------------------------------------------ |
| `b232175` | C1                            | fix(ci): build the design tokens on install and before lint              |
| `ef99127` | I1                            | fix(ci): key the typecheck cache on test and story files                 |
| `99eff8c` | I2                            | test(ui): guard the barrel and every component's file trio               |
| `6a65c84` | I3, M6 (main.ts)              | fix(storybook): fail a build that leaks the workspace path               |
| `e941a9b` | M1                            | fix(utils): round negative halves away from zero                         |
| `554cc8d` | M2, M4                        | fix(ui): declare optional props as T \| undefined and close Logo's markup |
| `7d77755` | M3                            | fix(tools): ban the package barrel from every tier by any spelling       |
| `bbe51e0` | M5                            | test(tools): run the eslint-config tests under nx                        |
| `d8abc96` | Dev-parity ADDs               | test(ui): carry dev's Icon and Logo coverage into the rewrite            |
| `c1bc57c` | M6 (README, CLAUDE.md), M7    | docs: correct stale state in CLAUDE.md, the tokens README and AUTHORING  |

---

## C1 — design-tokens `dist` missing breaks Prettier and ESLint

**Change**

- `package.json:13`: `"prepare": "husky && nx build @pink-paprikaa-web/design-tokens"` (project
  name verified with `pnpm nx show projects`).
- `nx.json:91`: `targetDefaults.lint = { "dependsOn": ["^build"] }`. There was no lint default to
  merge with. `apps/blog` keeps its own `lint.dependsOn: ["build"]` (package.json overrides the
  default); its `build` depends on `^build`, so the tokens are still built first (`nx show project
  @pink-paprikaa-web/blog`: lint `["build"]`, build `["^build"]`). `ui` lint resolves to
  `["^build"]`.

**Evidence**

Before the fix, with `packages/design-tokens/dist` moved to
`/Users/rishavpa/.claude/jobs/1b9ffb57/tmp/dist-bak`:

```
$ pnpm nx format:check            → exit=1
$ pnpm exec prettier --check packages/ui/src/atoms/icon/icon.tsx
[error] packages/ui/src/atoms/icon/icon.tsx: Error: Can't resolve '@pink-paprikaa-web/design-tokens/theme.css' in '…/packages/ui/src'
[error]     at finishWithoutResolve (…/prettier-plugin-tailwindcss@0.8.1…/resolve-pWjAK-4f.mjs:3293:35)
```

After the fix, dist still absent:

```
$ ls packages/design-tokens/dist  → No such file or directory
$ pnpm install --frozen-lockfile
. prepare$ husky && nx build @pink-paprikaa-web/design-tokens
. prepare: > nx run @pink-paprikaa-web/design-tokens:build
. prepare: ✔︎ dist/theme.css   ✔︎ dist/surfaces.css   ✔︎ dist/tokens.json
. prepare:  NX   Successfully ran target build for project @pink-paprikaa-web/design-tokens
Done in 7.8s using pnpm v10.26.1
$ diff -r packages/design-tokens/dist …/tmp/dist-bak   → dist identical to backup
$ pnpm nx format:check            → exit=0
```

Lint path, dist deleted again:

```
$ pnpm nx lint @pink-paprikaa-web/ui --skip-nx-cache
> nx run @pink-paprikaa-web/design-tokens:build   (✔︎ dist/theme.css …)
> nx run @pink-paprikaa-web/ui:lint
 NX   Successfully ran target lint for project @pink-paprikaa-web/ui and 1 task it depends on
```

The lockfile was unchanged by the install (`git status` showed only `nx.json` and `package.json`).

## I1 — typecheck cache ignored test and story files

**Change** `nx.json:94`: `targetDefaults.typecheck.inputs = ["default", "^production",
{ "externalDependencies": ["typescript"] }]`. `nx show project @pink-paprikaa-web/ui` now reports
exactly those inputs (was `["production", "^production", …]`).

**Evidence** (probe line appended to `packages/ui/src/atoms/icon/icon.test.tsx`, then removed):

```
before:  typecheck (green) → append `const probeTypeError: number = "not a number"` → typecheck
         Cache: 3/3 hit (100%), exit=0          ← the false pass
after:   typecheck → src/atoms/icon/icon.test.tsx:44:7 - error TS2322: Type 'string' is not
         assignable to type 'number'.  Cache: 0/2 hit.  exit=1
revert:  typecheck green again
```

## I2 — public API spec ported from dev

**Change** new `packages/ui/src/index.spec.ts`, from `git show dev:packages/ui/src/index.spec.ts`
(never checked out). Layers `atoms, molecules, organisms, layouts`; a layer with no folder yet is
skipped (`existsSync`). Four tests: every folder re-exported by path (the path check ends at the
closing quote, so `icon` cannot match `icon-button`); every folder's PascalCase name is an export;
every folder has `<name>.tsx`, `.test.tsx`, `.stories.tsx`; no default export. Dev's
`componentVariants` export check is dropped (spec §9.6 lists `RevealObserver`, the glyphs,
`POST_FORMATS`, types and `styles.css`, not the builder — verified). Uses `import.meta.dirname`
(R15), not dev's `fileURLToPath(import.meta.url)`.

**Evidence** passes today: `src/index.spec.ts (4 tests)`, 4 passed. Probe: an `atoms/probe-chip/`
folder holding only an empty `probe-chip.tsx`:

```
× re-exports every atoms component folder from the barrel   expected [ 'probe-chip' ] to deeply equal []
× exports a PascalCase component for every atoms folder      expected [ 'ProbeChip' ] to deeply equal []
× gives every atoms component the full file trio             + "atoms/probe-chip/probe-chip.test.tsx", + "…stories.tsx"
✓ has no default export
```

Probe folder removed.

## I3 — storybook-static publish path

**Change**

- `apps/storybook/.storybook/main.ts:109`: `relativeDocgenPaths()` gains `generateBundle(_options,
  bundle)`. It walks every emitted chunk (`code`) and asset (`source`, decoded with `TextDecoder`
  when it is a `Uint8Array`) and calls `this.error(…)` if `WORKSPACE_ROOT` appears. The API was
  verified in the installed rolldown 1.2.3 (Vite 8.2.1): `generateBundle(this: PluginContext,
  outputOptions, bundle: OutputBundle, isWrite)`, `OutputAsset.source: AssetSource`,
  `OutputChunk.code: string`. The doc comment explains the self-check.
- `apps/storybook/package.json:61`: the `chromatic` target is
  `node ../../scripts/check-founder-names.mjs storybook-static && chromatic …`. The target's `cwd`
  is `apps/storybook` (confirmed in `nx show project`), so `../../scripts` is the workspace's.

**Evidence**

- Deliberate leak: the docgen rewrite disabled (`return false && code.includes(absolute)`), then
  `pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache`:

  ```
  ■  Vite ✗ Build failed in 920ms
  ■  Build failed with 1 error:
  │  RolldownError: assets/icon.stories-Vs5ne9O6.js contains the absolute
  │  workspace path; keep it out of builds.
  ```

  Reverted from a backup copy. The build is then green: `Successfully ran target build for project
  @pink-paprikaa-web/storybook and 2 tasks it depends on`.
- The chromatic prefix, run from `apps/storybook`: `Founder-name guard: clean.` With a probe file
  holding a banned name in `storybook-static`: `FOUNDER-NAME GUARD: … found in
  storybook-static/probe-leak.txt`, exit 1, so `&&` stops chromatic. Probe file removed.
- `storybook` typecheck and lint are green.

## M1 — negative halves rounded toward +∞

**Change** `packages/utils/src/format-rupees.ts:17`: one `roundHalfAwayFromZero(value)`
(`Math.sign(value) * Math.round(Math.abs(value))`, then `rounded === 0 ? 0 : rounded`, so `-0`
never escapes). It is used by `formatRupees` (:24) **and** `formatCount` (:40). `formatCount` had the
same `Math.round` bug and also printed `"-0"` for `-0.4`: one root-cause fix, not two patches.

**Evidence** tests written first (`format-rupees.spec.ts`), and they failed:

```
× rounds the half in -499.5 away from zero, to −₹500
✓ rounds the half in 49.5 away from zero, to ₹50
× rounds halves away from zero and never prints a negative zero   (formatCount(-2.5) → "-3", formatCount(-0.4) → "0")
```

After the fix, utils test, lint and typecheck: 18 passed. The existing `formatRupees(-0.4) → "₹0"`
case still passes. The expected string uses U+2212, matching the existing `−₹500` case (checked
with `od -c`).

## M2 — R13 `?: T | undefined`

**Change** `icon.tsx:49` `label`, `logo.tsx:35,37` `title` / `isDecorative`,
`reveal-observer.tsx:10` `selector`, `brand-glyphs.tsx:9` `size`. I grepped every `?:` in
`packages/ui/src` (non-test). The only other one is `IconComponent`'s `size` (`icon.tsx:15`), and it
**stays** `size?: number | string`. Widening it failed typecheck:

```
src/atoms/icon/icon.test.tsx:10:40 - error TS2322: Type 'ForwardRefExoticComponent<Omit<LucideProps, "ref"> & …>'
is not assignable to type 'IconComponent' … with 'exactOptionalPropertyTypes: true'.
```

lucide-react's `size?: string | number` (`node_modules/lucide-react/dist/lucide-react.d.ts:14`)
cannot accept an explicit `undefined`, and `IconComponent` is the parameter type of a component
lucide must be assignable to. The reason is in the type's doc comment (`icon.tsx:10-12`) and in
AUTHORING §3.

AUTHORING: the §3 canonical example (`AUTHORING.md:79`) is now `label?: string | undefined;`. The
R13 bullet (:108) no longer says Icon, Logo and RevealObserver predate R13. It now names the one
exception and why.

## M4 — LogoProps and `dangerouslySetInnerHTML`

**Change** `logo.tsx:29-32`: `Omit<ComponentProps<"svg">, "children" | "dangerouslySetInnerHTML"
| "viewBox" | "width" | "height">`. `children` was already omitted. Both roots render the artwork
themselves, which matches plan 2a's `SymbolMarkProps`. A type test in `logo.test.tsx`
(`expectTypeOf<LogoProps>().not.toHaveProperty("children" | "dangerouslySetInnerHTML")`) failed
typecheck first (`TS2554` at the `dangerouslySetInnerHTML` line), then passed after the Omit.
AUTHORING §6's Logo bullet lists the two omitted keys.

## M3 — barrel reachable by other spellings

**Change** `tools/eslint-config/atomic-layering.js`:

- `barrelPattern` (:31), regex `^(?:\.\./)*\.\.(?:/(?:index(?:\.[jt]sx?)?)?)?$` exactly as briefed,
  is added to **every** tier through `tierPatterns(layer)`: atoms (:45), and molecules, organisms
  and **layouts** (:66). Layouts had no block before.
- The atom roundabout regex drops its `|index$` arm, because the barrel pattern covers it. ESLint
  10.8.0's `no-restricted-imports` reports once per matching pattern group
  (`lib/rules/no-restricted-imports.js:845`), so keeping both would double-report `../../index`.
- The header comment states what is enforced.

New `tools/eslint-config/atomic-layering.test.mjs` (node:test + ESLint's `Linter`), written first:

```
before:  ✖ no tier imports the package barrel, by any spelling
         AssertionError: atoms importing ".."   0 !== 1
         caught per tier:  atoms ../../index=1, everything else 0; molecules/organisms/layouts all 0
after:   ℹ pass 4  ℹ fail 0
         atoms|molecules|organisms|layouts: ..=1 ../..=1 ../../=1 ../../index=1 ../../index.ts=1
```

It also pins what is allowed (`../../lib/*`, `../../assets/*`, `../../styles.css`,
`../../../vitest.setup`, packages), upward bans and downward allows, and atom-imports-only-Icon
(direct and roundabout).

Probe at a real call site (`packages/ui/src/{atoms,layouts}/probe/probe.ts` importing `../..`,
`../../`, `../../index.ts` and `../../lib/component-variants`), `pnpm exec eslint`: 6 errors, 3
per file. Each reads "Atomic layering: never import the package barrel from inside the package".
The lib import was clean. Probe folders removed.

**Docs** now say exactly what the lint enforces: `packages/ui/AUTHORING.md:37-46`,
`docs/engineering/02-architecture.md:25-31`, `docs/engineering/06-quality-gates.md:35` (the
registry row), and spec §11.2's atomic-layering row. The row now reads "no layer imports a higher
one or the barrel (…); atoms import no atom but `atoms/icon`", with the spec's usual
`_Amended 2026-09-28 (implementation)_, was "…"` note. Prettier re-padded that table, so 13 lines
changed there.

## M5 — eslint-config tests never ran

**Change** `tools/eslint-config/package.json:6-8`: `"scripts": { "test": "node --test *.test.mjs
rules/*.test.mjs" }`. Nx infers the target (`nx:run-script`, `dependsOn: ["^build"]`), so no
project.json is needed. The RuleTester files run standalone under `node --test`, because ESLint's
RuleTester falls back to direct calls when no `describe`/`it` globals exist, so a failure throws.

**Evidence** `pnpm nx run-many -t test -p @pink-paprikaa-web/eslint-config`: `ℹ tests 6 ℹ pass 6`.
Probe: one `no-raw-hex` valid case replaced with a hex literal gave `✖ rules/no-raw-hex.test.mjs`,
`ℹ fail 1`, and the target failed. Restored from a backup.

## M6 — stale docs

- `apps/storybook/.storybook/main.ts:61-71` (in `6a65c84`): the comment no longer claims the rest
  of the config is verbatim (it is not, after the stories globs, `env` and the docgen plugin) or
  counts 6 or 69 components. It keeps the two real reasons for `include` and `tsconfigPath`.
- `packages/design-tokens/README.md`:
  - :9 — `theme.spec.ts` scans every token source file (all four tiers) for the brand hex (matches
    the "writes the brand hex exactly once across every token source file" test).
  - :15 — primitives are the only place for a *colour* literal. I grepped: no hex, rgb, hsl or oklch
    in semantic, surface or component.
  - :16 — semantic: the focus-ring composite carries a `3px` literal
    (`tokens/semantic/shadow.json`).
  - :17 — `component/` holds `icon.json` (`size-icon-*`) and `logo.json` (`w-logo-*`). A px literal
    is allowed there; a colour always references a token (AUTHORING §5).
  - :27 — `theme.css` carries primitive, semantic **and component** tokens.
- `CLAUDE.md`, all verified with git:
  - :139-142 — `nx affected` vs `main`: `main` is the live site's unrelated history, so every
    project is always affected. `pnpm nx show projects --affected` lists all 13. Suggest
    `--base=dev`.
  - :155-194 "Current state": Phase 0 lives on `dev` together with the August port.
    `feat/design-system` carries the rewrite, with Plan 1 done.
  - `origin` exists and is GitHub. `main`/`origin/main` share no commit with this workspace:
    `git merge-base main dev` prints nothing, and `main`'s tree is the old site (`PIXEL.md`,
    `sitemap.xml`, `src/`).
  - `ci.yml` triggers only on pushes to `main` and on PRs, so CI is treated as unexercised.
  - `dev`/`origin/dev` (same sha `5403413`) is the dev-parity source (contracts §0.0; `git show`
    only). `feat/design-system` has no upstream. `feat/phase-0-foundation` no longer exists
    (`git for-each-ref refs/heads`).
  - The SDD records location is stated with its git status (see concern 1).
  - The Nx markers and every hard rule are untouched.

## M7 — `max-w-prose`

`packages/ui/AUTHORING.md:251`: "**Never `max-w-prose`.** Tailwind's built-in `max-w-prose` is a
static `65ch` and wins over the system's `--container-prose` (`64ch`), so it lints clean and
renders the wrong measure. Use `max-w-text-measure-prose` … which Plan 2a Task 2 adds."

I verified this by compiling `packages/ui/tailwind.css` with the installed `@tailwindcss/node` and
building `max-w-prose`, `max-w-prose-narrow` and `max-w-content`:
`.max-w-prose { max-width: 65ch; }`, `.max-w-prose-narrow { max-width:
var(--container-prose-narrow); }`. The static 65ch does shadow the token. See concern 2 for the
token that does not exist yet.

## Dev-parity ADDs (read with `git show dev:packages/ui/src/atoms/{icon,logo}/…`)

| dev item                                                                               | Rewrite                                                                                                                                                                   |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Icon "merges a caller className" (`size-8` replaces `size-5`)                          | `icon.test.tsx` "lets a caller's className replace the size class": `size="md" className="size-8"` → root has `size-8`, not `size-icon-md` (the root span carries the size here, not the svg) |
| Icon "hides a decorative icon" + `queryByRole("img")` absent                           | the existing decorative test also asserts `queryByRole("img", { hidden: true })` is absent. `hidden: true` makes it stronger than dev's, since a role on an aria-hidden node is still found |
| Icon story `Labelled`                                                                  | `icon.stories.tsx` `Labelled`: `{ icon: MessageCircle, label: "Chat on WhatsApp", size: "lg" }`, with a doc comment. It ran in Chromium under `storybook:test` (11 story tests pass) |
| Logo title/label override                                                              | `logo.test.tsx` "names itself with a caller's title instead of the default" (`title="Pink Paprikaa home"`)                                                               |
| Logo "leaves the plate off the transparent colourways"                                 | `it.each(["pink","white"])` "leaves the plate off the transparent %s tone": no `rect`, no nested `svg`. The artwork markup has no `<rect>` (grepped `brand-artwork.ts`: 0) |
| Logo a11y over default + badge + decorative                                            | the a11y test now renders `<Logo />`, `<Logo tone="badge" variant="symbol" />` and `<Logo tone="white" isDecorative />` together                                          |

Mutation check. I made three temporary source mutations and restored them from backups:

- Icon `role="img"` always
- Logo ignores `title`
- Icon concatenates `className` instead of merging

Each failed exactly its new test (`3 failed | 26 passed`).

## Final gate (run after the last commit, HEAD `c1bc57c`)

```
$ pnpm nx run-many -t typecheck lint test build --skip-nx-cache
 NX   Successfully ran targets typecheck, lint, test, build for 12 projects and 1 task they depend on
  Run duration: 25.2s   Cache: Skipped (--skip-nx-cache)   exit=0
  test counts: design-tokens 135 · eslint-config 6 (node --test) · utils 18 · ui 96 · content 20 ·
               storybook 11 (stories in Chromium) · image-pipeline 1 · seo 1
$ pnpm nx format:check            exit=0   (nothing flagged; the plan-3a file was already committed
                                            by its agent as a0c89fa before this gate)
$ pnpm nx sync:check              [@nx/js:typescript-sync]: All files are up to date.  exit=0
$ pnpm nx run storybook:build     Successfully ran … exit=0
$ pnpm guard:founder              Founder-name guard: clean.  exit=0
$ git status --short              (clean)
```

## Concerns

1. **The SDD records are not in git.** `docs/superpowers/records/sdd/.gitignore` contains `*`. It
   is a verbatim copy of `.superpowers/sdd/.gitignore`, and it ignores the whole archive:
   `git ls-files docs/superpowers/records` is empty. Commit `e6d73d8` says the records "are copied
   to docs/superpowers/records/sdd/", but its diff touches only `.prettierignore` and the contracts
   file. CLAUDE.md therefore says the records exist only in this working copy, rather than calling
   them archived. To really archive them, delete that `.gitignore` and commit the folder (about
   1.2 MB with the evidence). That is outside this brief, so I left it to you.
2. **M7's token does not exist yet.** There is no `max-w-text-measure-prose` or
   `text-measure-prose` in the tree; Plan 2a Task 2 creates them. The AUTHORING line says so. It is
   CONVENTION, not LAW: `max-w-prose` is a real Tailwind class, so no lint rule rejects it.
3. **M2 exception.** `IconComponent`'s `size` keeps `?: number | string`. Adding `| undefined`
   breaks the assignability of every lucide-react icon under `exactOptionalPropertyTypes` (TS2322,
   quoted above). This is documented in the code and in AUTHORING §3.
4. **CLAUDE.md origin URL.** The brief quoted the GitHub URL, whose owner segment is the founder's
   name. Following the spirit of hard rule 2, CLAUDE.md says "`origin` is the GitHub repository
   (`git remote -v`)" without the URL.
5. **Barrel spellings the briefed regex does not cover.** `../../../src/index` (through the package
   root) and a self-import by name (`@pink-paprikaa-web/ui`) both still lint clean. I kept the regex
   exactly as briefed; say if you want either closed.
6. **M1 scope.** `formatCount` had the same `Math.round` bug, plus a `"-0"` output. It now shares
   the fix and has its own test.
7. **`nx affected` against `main`.** `main` shares no history with this workspace, so locally
   `affected` always selects all 13 projects, and so does the pre-push `pnpm verify`. CLAUDE.md now
   says so. Whether `nrwl/nx-set-shas` finds a usable base on a PR into this `main` is unverified;
   CI has never run.
