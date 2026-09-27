### Task 1: Restore a green baseline and remove the August system

**Files:**

- Modify: `.prettierignore`, `.github/workflows/ci.yml`, `apps/blog/package.json`
- Delete: `packages/ui/src/**`, `packages/ui/AUTHORING.md`, `packages/ui/.babelrc`
- Create: `packages/ui/src/index.ts`, `packages/ui/src/styles.css`, `apps/storybook/src/docs/introduction.mdx`
- Modify: `packages/ui/vite.config.mts`, `apps/storybook/vitest.config.mts`, `apps/storybook/.storybook/main.ts`, `apps/storybook/tsconfig.storybook.json`

**Interfaces:**

- Produces: an empty `@pink-paprikaa-web/ui` (barrel `export {}`, stub `styles.css` importing `@pink-paprikaa-web/design-tokens/theme.css`); Storybook indexes `apps/storybook/src/**`.

- [ ] **Step 1: Prove the three current failures (evidence for the commit)**

Run:

```bash
pnpm nx format:check 2>&1 | tail -3
rm -rf apps/blog/.content-collections && pnpm nx lint @pink-paprikaa-web/blog --skip-nx-cache 2>&1 | tail -5
```

Expected: format:check lists files under `zip-files/` and exits 1; blog lint reports `@typescript-eslint/no-unsafe-*` errors in `apps/blog/src/app/page.tsx`.

- [ ] **Step 2: Ignore the reference material for Prettier**

Append to `.prettierignore`:

```
# Design handoff reference material (read-only input, never reformatted)
zip-files/
```

- [ ] **Step 3: Make blog lint run after the Content Collections generation**

In `apps/blog/package.json` → `"nx"` → `"targets"`, add alongside `build` and `serve`:

```json
"lint": {
  "dependsOn": ["build"]
}
```

(`next build` runs the Content Collections plugin, which writes `.content-collections/generated`; type-aware lint of `page.tsx` needs it.)

- [ ] **Step 4: Install Chromium in the CI verify job**

In `.github/workflows/ci.yml`, job `verify`, insert after the `nrwl/nx-set-shas@v4` step:

```yaml
# storybook:test runs stories in headless Chromium (addon-vitest browser mode).
- run: pnpm exec playwright install --with-deps chromium
```

Locally, run once: `pnpm exec playwright install chromium` (needs network; if the sandbox blocks it, rerun with the sandbox disabled).

- [ ] **Step 5: Remove the August design system**

```bash
git rm -r -q packages/ui/src packages/ui/AUTHORING.md packages/ui/.babelrc
mkdir -p packages/ui/src apps/storybook/src/docs
```

Create `packages/ui/src/index.ts`:

```ts
/**
 * Public surface of @pink-paprikaa-web/ui — the only barrel in the package.
 * Components are re-exported here, by name, as each one lands.
 */
export {};
```

Create `packages/ui/src/styles.css` (replaced in Task 5):

```css
/* Temporary entry — rebuilt by plan 1 task 5. */
@import "@pink-paprikaa-web/design-tokens/theme.css";
```

- [ ] **Step 6: Let the two test targets pass while they have no tests**

In `packages/ui/vite.config.mts`, inside `test: { … }` add:

```ts
    // Temporary: the package has no tests until plan 1 task 5 lands. Remove with that task.
    passWithNoTests: true,
```

In `apps/storybook/vitest.config.mts`, inside `test: { … }` add:

```ts
    // Temporary: no stories exist until plan 1 task 7 (Icon, Logo). Remove with that task.
    passWithNoTests: true,
```

- [ ] **Step 7: Index Storybook's own docs**

`apps/storybook/.storybook/main.ts` → `stories`:

```ts
  stories: [
    // Foundations, kits and docs owned by the Storybook app itself.
    "../src/**/*.mdx",
    "../src/**/*.stories.@(ts|tsx)",
    // Component stories live beside the components in the design system library.
    "../../../packages/ui/src/**/*.mdx",
    "../../../packages/ui/src/**/*.stories.@(js|jsx|ts|tsx)",
  ],
```

`apps/storybook/tsconfig.storybook.json` → `include` add `"src/**/*.ts"`, `"src/**/*.tsx"`.

Create `apps/storybook/src/docs/introduction.mdx`:

```mdx
import { Meta } from "@storybook/addon-docs/blocks";

<Meta title="Introduction" />

# Pink Paprikaa Design System

The production design system for pinkpaprikaa.com, rebuilt from the supplied design-system folder.
Foundations, components and reference kits are added group by group; see
`docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md`.
```

- [ ] **Step 8: Gate (cold)**

Run:

```bash
pnpm nx format:check && pnpm nx sync:check \
  && pnpm nx run-many -t typecheck lint test build --skip-nx-cache --outputStyle=static 2>&1 | tail -25
```

Expected: all tasks succeed (blog lint now builds first; ui/storybook tests pass with zero files; storybook builds with the MDX page).

- [ ] **Step 9: Commit (two commits)**

```bash
git add .prettierignore apps/blog/package.json .github/workflows/ci.yml
git commit -m "ci: restore a green baseline for the design system rewrite

Prettier ignores zip-files/ (reference material), blog lint depends on the
build that generates Content Collections types, and the verify job installs
Chromium for the Storybook browser tests.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git add -A packages/ui apps/storybook
git commit -m "chore(ui): remove the August design system port

The rewrite follows docs/superpowers/specs/2026-09-27-design-system-rewrite-design.md.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

