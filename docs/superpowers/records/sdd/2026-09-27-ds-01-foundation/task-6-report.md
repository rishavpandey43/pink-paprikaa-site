# Task 6 report: lint and format gates

**Status:** DONE
**Branch:** `feat/design-system`
**Commits:**

- `d471636` style: sort Tailwind classes with prettier-plugin-tailwindcss (8 md files, 130/130 lines, class reordering only)
- `d4efadf` feat(tools): token-only classes, strict naming and the layouts tier

## Changes

| Step | File | Change |
| --- | --- | --- |
| 1 | `tools/eslint-config/atomic-layering.js` | Layers are now `atoms → molecules → organisms → layouts` (was `templates`). Built with `upperLayerPatterns(layer)`, and the atom block adds the "an atom imports only Icon" pattern. The explanatory comment is kept, with the layer list added. **Per R3 the atom pattern is a `regex`, not the brief's gitignore `group`** (see Probe 1). |
| 2 | `tools/eslint-config/base.js` | `@typescript-eslint/naming-convention` is now `error`. The comment reads "LAW since the design system rewrite (drift ledger P-08 closed)." |
| 3 | `tools/eslint-config/react.js` | Added a block after `tailwindcss.configs.recommended`. It sets `settings.tailwindcss.functions: ["componentVariants","tv","cn","clsx"]`, turns `classnames-order` off, and sets `no-arbitrary-value` and `no-custom-classname` to `error`. |
| 4 | `.prettierrc`, `package.json`, `pnpm-lock.yaml` | Ran `pnpm add -D -w prettier-plugin-tailwindcss`, which resolved `^0.8.1`. `.prettierrc` matches the brief exactly. |
| R1 | `apps/storybook/.storybook/preview.tsx` | Changed the decorator from `text-body1 leading-body1 font-body text-text-body` to `font-body text-body text-text-body`. `no-custom-classname` flagged it, as R1 predicted. This is in the gates commit, not the style commit, because it is a lint fix rather than formatting. |

**Checked against the installed packages:**

- eslint-plugin-tailwindcss 4.2.0 README, "Settings" section: the key is `functions` (not `callees`). Its default list is replaced by ours. `no-arbitrary-value` and `no-custom-classname` both exist.
- ESLint 10.8.0 `lib/config/flat-config-schema.js:578`: `settings` uses `deepObjectAssignSchema`. So the shared `functions` setting and each consumer's own `cssConfigPath` deep-merge rather than overwrite each other. Probe 1b confirms this: a `componentVariants({...})` call was checked in `packages/ui`.
- ESLint 10.8.0 `lib/rules/no-restricted-imports.js:121`: a pattern accepts `regex`, compiled at line 340 with the `iu` flags (`u` only when `caseSensitive: true`).
- prettier-plugin-tailwindcss 0.8.1 README: the option names are `tailwindStylesheet` (v4 entry) and `tailwindFunctions`.

## Probes

Each probe file was created, run, checked for the expected text, then deleted. `git status` shows none left.

**Probe 1: an atom imports a sibling atom** (`packages/ui/src/atoms/probe/probe.tsx` importing `../probe2/probe2`), run with `pnpm nx lint @pink-paprikaa-web/ui --skip-nx-cache`:

With the brief's gitignore `group` (`"../*", "!../icon", "../*/**", "!../icon/**"`), the sibling import failed as intended:

```
1:1  error  '../probe2/probe2' import is restricted from being used by a pattern. Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages)  no-restricted-imports
✖ 1 problem (1 error, 0 warnings)
```

The positive half (an atom importing `../icon/icon` and `../../lib/component-variants`) showed the R3 failure mode:

```
1:1  error  '../../lib/component-variants' import is restricted from being used by a pattern. Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages)  no-restricted-imports
```

The cause is that gitignore `../*` also matches `../..`, so everything under it is restricted. I replaced the pattern with `regex: "^\\.\\./(?!icon(?:/|$))[^./]"`. Results after the change:

- Positive half, with a temporary `atoms/icon/icon.tsx` stub that was later deleted:

  ```
  NX  Successfully ran target lint for project @pink-paprikaa-web/ui
  ```

- Sibling import, plus an extra atom → `../../molecules/card/card` check:

  ```
  1:1  error  '../../molecules/card/card' import is restricted from being used by a pattern. Atomic layering: atoms cannot import from molecules (layers only go upward)  no-restricted-imports
  1:1  error  '../probe2/probe2' import is restricted from being used by a pattern. Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages)  no-restricted-imports
  ✖ 2 problems (2 errors, 0 warnings)
  ```

- Extra check of the new tier, organisms → `../../layouts/shell/shell`:

  ```
  1:1  error  '../../layouts/shell/shell' import is restricted from being used by a pattern. Atomic layering: organisms cannot import from layouts (layers only go upward)  no-restricted-imports
  ```

**Probe 2: arbitrary value** (`className="h-[13px]"`):

```
2:26  error  Arbitrary value detected in 'h-[13px]'  tailwindcss/no-arbitrary-value
✖ 1 problem (1 error, 0 warnings)
```

**Probe 3: unknown class** (`className="rounded-lgg"`):

```
2:26  error  Classname 'rounded-lgg' is not a Tailwind CSS class  tailwindcss/no-custom-classname
✖ 1 problem (1 error, 0 warnings)
```

**Probe 4: stock Tailwind colour** (`className="bg-red-500"`):

```
2:26  error  Classname 'bg-red-500' is not a Tailwind CSS class  tailwindcss/no-custom-classname
✖ 1 problem (1 error, 0 warnings)
```

**Extra check: `functions` reaches inside `componentVariants({...})`** (`base: "rounded-lgg"`, `variants.size.sm: "h-[13px]"`):

```
4:10  error  Classname 'rounded-lgg' is not a Tailwind CSS class  tailwindcss/no-custom-classname
5:28  error  Arbitrary value detected in 'h-[13px]'               tailwindcss/no-arbitrary-value
✖ 2 problems (2 errors, 0 warnings)
```

**Probe 5: boolean naming** (`packages/utils/src/probe.ts` containing `export const open = true;`), run with `pnpm nx lint @pink-paprikaa-web/utils --skip-nx-cache`:

```
1:14  error  Variable name `open` must have one of the following prefixes: is, should, has, can, did, will, does, disable, enable  @typescript-eslint/naming-convention
✖ 1 problem (1 error, 0 warnings)
```

**Probe 6: class order** (`className="text-text-muted p-4 flex"`):

```
$ pnpm exec prettier --check packages/ui/src/atoms/probe/probe.tsx
Checking formatting...
[warn] packages/ui/src/atoms/probe/probe.tsx
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
exit=1
$ pnpm exec prettier --write ...
export function Probe() {
  return <div className="flex p-4 text-text-muted" />;
}
```

Inside `componentVariants({ base: "text-text-muted p-4 flex" })`, `--write` also sorts the string to `"flex p-4 text-text-muted"`, which confirms `tailwindFunctions` works.

## Gates

**`pnpm nx format:write`** changed 9 files:

- `apps/storybook/.storybook/preview.tsx`, which was then replaced by the R1 fix.
- `docs/engineering/03-patterns.md`.
- Seven plan files, `docs/superpowers/plans/2026-09-27-ds-0{2a,2b,2c,3a,3b,4,5}-*.md`.

All the md changes are class reordering inside code blocks and went into their own `style:` commit. Per R2, I included the md files, overriding the brief's `':!*.md'` pathspec. Leaving them out would have left the tree dirty and `format:check` red.

**Lint sweep**, `pnpm nx run-many -t lint --skip-nx-cache --outputStyle=static`:

- First run: failed only on `apps/storybook/.storybook/preview.tsx` (`text-body1` and `leading-body1` rejected by `no-custom-classname`). Fixed per R1.
- After the fix:

  ```
  NX  Successfully ran target lint for 12 projects and 2 tasks they depend on
  ```

  There are two warnings, both `playwright/no-conditional-in-test`, in `apps/blog-e2e/src/blog.spec.ts:21` and `apps/web-e2e/src/home.spec.ts:20`. They are pre-existing and in files this task did not touch.
- The sweep was re-run after both commits and is still green.

**Other checks after committing:**

- `pnpm nx format:check`: exit 0.
- `pnpm nx sync:check`: "All files are up to date."
- The husky `pre-commit` hook (lint-staged: eslint --fix and prettier) and `commit-msg` hook (commitlint) both passed.
- My first attempt at the gates commit was rejected by `body-max-line-length` (100). I shortened the probe lines and did not use `--no-verify`.

## Renames

None. `naming-convention` at `error` flags nothing in the existing workspace.

## Self-review

- The brief's code is followed verbatim except for the R3-sanctioned regex. That is documented in a code comment and in the commit body.
- The regex `^\.\./(?!icon(?:/|$))[^./]` behaves as follows:
  - flags `../<anything>`, including `../icon-button`, because the lookahead requires `icon` followed by `/` or end of string;
  - allows `../icon` and `../icon/…`;
  - allows `../../…`, because the character after `../` is `.`;
  - allows `./…`, the atom's own files;
  - allows package imports.
- `functions` sits in `react.js` and deep-merges with each consumer's `cssConfigPath`. This was verified on `packages/ui` and on `apps/storybook` (the first sweep run flagged storybook's classes, which it could only do if the settings were live there).
- No probe files remain, and the working tree is clean.

## Concerns

1. **The atom rule does not cover roundabout paths.** An atom could import `../../atoms/other/other` or the `../../index` barrel and pass the rule. The brief's gitignore version had the same gap, and no current code does this. Closing it would need a second regex such as `^\.\./\.\./(?!lib/)`. I did not add one because it is not in the brief.
2. **The plan docs' classes are now sorted as "unknown" classes.** The code blocks use tokens that do not exist yet in `styles.css` (for example `rounded-app-shell`, `h-app-shell-home`, `px-app-shell-status-x`) and August classes in `03-patterns.md` (`rounded-6`, `text-body2`). Prettier puts classes it does not recognise first, so those strings are in an order that will shift again once the tokens land. This is cosmetic: implementers' own files get re-sorted by Prettier when they commit.
3. **`nx run-many -t lint` rewrites `apps/blog/next-env.d.ts`.** A dependency task switches `./.next/dev/types/routes.d.ts` to `./.next/types/routes.d.ts`. I reverted it both times. This is pre-existing behaviour and not part of this task, but it will keep dirtying the tree after every lint sweep. It is worth gitignoring or pinning in a later task.
4. **`storySort` in `preview.tsx` still lists `"Templates"`, not `"Layouts"`.** I left it for Task 8, which owns Storybook.

---

# Fix round 1 (controller ruling R23)

**Commit:** `9c76db5` feat(tools): ban arbitrary shorthand classes and roundabout atom imports. It is staged from `tools/eslint-config` only: 7 files.

## Changes

### F1: `rules/no-arbitrary-shorthand.js` (new)

The rule has the same shape as `no-raw-hex.js`: it scans `Literal`, `TemplateElement` and `JSXText` values and splits them on whitespace. For each token, `utilityOf()` strips the variants and `!`. A variant ends at a `:` outside brackets or parens, so `[mask-type:alpha]` keeps its own colon and `[&>*]:shrink-0` resolves to `shrink-0`. The utility is then tested against two patterns:

- `/-\((?:--|[a-z-]+:)/` catches the CSS-variable shorthand, including type hints: `w-(--x)`, `text-(length:--fs)`.
- `/^\[-{0,2}[a-z][a-z-]*:[^\]]+\]/` catches arbitrary properties, including `[--x:1px]`. It requires a complete lowercase `[prop:value]`, so prose in `JSXText` such as `[Note: …]` is not flagged.

The message is the ruling's: "Arbitrary shorthand class '{{value}}' — add a token and use its named utility instead."

### F1: `rules/plugin.js` (new, needed for the registration)

ESLint 10.8.0's `flat-config-schema.js:397` throws `Cannot redefine plugin "pink-paprikaa"` when two different objects are registered under the same plugin name for one file. base.js already registers `pink-paprikaa` for `**/*.ts`, so registering the new rule for `.ts` in react.js with a second object literal would crash every React-preset lint. The fix is one shared plugin object, `{ rules: { no-arbitrary-shorthand, no-raw-hex } }`, which both base.js and react.js now import. The rule is enabled only in react.js, in a new block for `**/*.tsx`, `**/*.jsx` and `**/*.ts`, next to no-raw-hex.

### F1: `rules/no-arbitrary-shorthand.test.mjs` (new)

This is a RuleTester suite written like `no-raw-hex.test.mjs`. The existing test runs as a bare `node` script, not through an Nx target, so this one does too.

- **Valid:** `"h-button-h-md px-4"`, `"hover:bg-brand-primary md:flex [&>*]:shrink-0"`, `{ color: "var(--color-pink-500)" }`, `"[data-surface=brand]"`.
- **Invalid:** `w-(--x)`, `flex hover:h-(--button-h-sm)`, `text-(length:--fs)`, `[mask-type:alpha]`, `` `md:[scrollbar-width:none] p-4` ``.

### F2: `atomic-layering.js`

Added a second atom pattern, `regex: "^(?:\\.\\./)+(?:atoms/(?!icon(?:/|$))|index$)"`, with the same message as the first.

### F3: stale comments

- `rules/naming-convention.js`: the header now says base.js wires the options at "error", a LAW since the design system rewrite.
- `react.js`: the comment now says `packages/ui` keeps its Tailwind entry at `tailwind.css`, not `.storybook/styles.css`.

## Tests

```
$ node tools/eslint-config/rules/no-arbitrary-shorthand.test.mjs
no-arbitrary-shorthand: all RuleTester cases passed        (exit 0)
$ node tools/eslint-config/rules/no-raw-hex.test.mjs
no-raw-hex: all RuleTester cases passed                    (exit 0)
```

As a mutation check, I ran the suite against a temporary copy with `ARBITRARY_PROPERTY` neutered. It failed with `AssertionError [ERR_ASSERTION]: Should have 1 error but had 0: []`, which proves the suite can fail. The copy was deleted afterwards.

## Probes

All probes are at a real call site, `packages/ui/src/atoms/probe/` under `pnpm nx lint @pink-paprikaa-web/ui --skip-nx-cache`, and were deleted afterwards.

- **`className="w-(--x)"`:**

  ```
  2:25  error  Arbitrary shorthand class 'w-(--x)' — add a token and use its named utility instead  pink-paprikaa/no-arbitrary-shorthand
  ✖ 1 problem (1 error, 0 warnings)
  ```

- **`className="[mask-type:alpha]"`:**

  ```
  2:25  error  Arbitrary shorthand class '[mask-type:alpha]' — add a token and use its named utility instead  pink-paprikaa/no-arbitrary-shorthand
  ✖ 1 problem (1 error, 0 warnings)
  ```

- **F2 and `.ts` coverage, in one run.** `probe.tsx` imports `../../atoms/text/text` and `../../index`. `probe-ok.tsx` imports `../../atoms/icon/icon`, `../../lib/component-variants`, `../../assets/logo` and `../../../vitest.setup`. `probe-ts.ts` contains `"h-(--button-h-sm)"`.

  ```
  probe-ts.ts  1:27  error  Arbitrary shorthand class 'h-(--button-h-sm)' — add a token and use its named utility instead  pink-paprikaa/no-arbitrary-shorthand
  probe.tsx    1:1   error  '../../atoms/text/text' import is restricted from being used by a pattern. Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages)  no-restricted-imports
  probe.tsx    2:1   error  '../../index' import is restricted from being used by a pattern. Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages)  no-restricted-imports
  ✖ 3 problems (3 errors, 0 warnings)
  ```

  `probe-ok.tsx` produced no errors, so all four allowed forms pass.

## Commands

- `pnpm nx run-many -t lint --skip-nx-cache --outputStyle=static`: "Successfully ran target lint for 12 projects and 2 tasks they depend on". The only warnings are the same two pre-existing playwright ones in the e2e specs.
- `pnpm nx format:check`: exit 0.
- `apps/blog/next-env.d.ts` churned again and was reverted before committing, as the ruling asked.
- The pre-commit hook (lint-staged) and commitlint both passed, without `--no-verify`.
- The working tree is clean.

## Concerns

`no-arbitrary-shorthand` scans every string in React-preset `.ts`, `.tsx` and `.jsx` files, not just class positions, the same way no-raw-hex does. A non-class string shaped exactly like `x-(--y)` or `[prop:value]` would therefore be flagged. No such string exists in the workspace today, and the lint sweep is clean.
