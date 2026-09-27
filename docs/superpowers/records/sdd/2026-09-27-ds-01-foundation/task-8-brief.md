### Task 8: Storybook on the consumer contract — fonts, groups, guard

**Files:**

- Create: `apps/storybook/.storybook/fonts.ts`
- Replace: `apps/storybook/.storybook/styles.css`
- Modify: `apps/storybook/.storybook/preview.tsx`, `apps/storybook/package.json`, root `package.json` (`guard:founder`)

**Interfaces:**

- Consumes: `@pink-paprikaa-web/ui/styles.css` (Task 5), `Logo`/`Icon` stories (Task 7).
- Produces: Storybook sidebar order `Introduction, Brand, Colors, Type, Spacing, Layout, Motion, Marketing, Atoms, Molecules, Organisms, Layouts, Website, App`; self-hosted fonts; `guard:founder` scanning `apps/storybook/storybook-static`.

- [ ] **Step 1: Dependencies**

```bash
pnpm add -D @fontsource/poppins @fontsource/dm-sans @fontsource/space-mono --filter @pink-paprikaa-web/storybook
pnpm add @pink-paprikaa-web/content @pink-paprikaa-web/design-tokens --workspace --filter @pink-paprikaa-web/storybook
ls node_modules/@fontsource/poppins/ | head -20; ls node_modules/@fontsource/dm-sans/ | head -20
```

(Confirm the CSS entry file names — e.g. `400.css`, `600-italic.css` — before writing Step 2.)

- [ ] **Step 2: Fonts and the consumer stylesheet**

`apps/storybook/.storybook/fonts.ts` (weights exactly as the design system's `tokens/fonts.css`; each Fontsource weight file carries every subset with `unicode-range`, so Devanagari loads only where used):

```ts
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/500.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/600-italic.css";
import "@fontsource/poppins/700.css";
import "@fontsource/poppins/800.css";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/400-italic.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/space-mono/400.css";
import "@fontsource/space-mono/700.css";
```

Replace `apps/storybook/.storybook/styles.css`:

```css
/*
 * Storybook consumes the design system exactly as an app does (spec §6.5): Tailwind, then the
 * library's single stylesheet. The library scans itself; only this app's own docs need a @source.
 */
@import "tailwindcss";
@import "@pink-paprikaa-web/ui/styles.css";

@source "../src";
```

- [ ] **Step 3: Preview — group order, fonts, surfaces, a11y policy**

In `apps/storybook/.storybook/preview.tsx`:

- First lines: `import "./fonts";` then `import "./styles.css";`.
- `backgrounds` add `soft: { name: "Soft — light pink", value: "var(--color-surface-brand-soft)" }`.
- Replace the `a11y.config.rules` comment + rule with:

```tsx
        rules: [
          /**
           * `color-contrast` is owned by the token contrast policy (spec §5.4): every text/background
           * pair the components use is measured in `packages/design-tokens` on every build, with white
           * on the brand pink as the single declared exception at the AA-large floor. axe cannot scope
           * an exception to one pair, so here it is off; every other axe rule fails the story.
           */
          { id: "color-contrast", enabled: false },
        ],
```

- `options.storySort.order`:

```tsx
        order: [
          "Introduction", "Brand", "Colors", "Type", "Spacing", "Layout", "Motion", "Marketing",
          "Atoms", "Molecules", "Organisms", "Layouts", "Website", "App",
        ],
```

- Decorator: `<div className="font-body text-body text-text-body"><Story /></div>`.

- [ ] **Step 4: Founder guard covers the Storybook build**

Root `package.json` → `"guard:founder": "node scripts/check-founder-names.mjs apps/web/out apps/blog/out apps/storybook/storybook-static"`.

- [ ] **Step 5: Prove the consumer contract and the guard**

Run:

```bash
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -5
rtk proxy grep -l -- "--color-text-body" apps/storybook/storybook-static/assets/*.css | head -2
rtk proxy grep -l "w-logo-lockup" apps/storybook/storybook-static/assets/*.css | head -2
pnpm nx run-many -t build -p @pink-paprikaa-web/web @pink-paprikaa-web/blog 2>&1 | tail -3 && pnpm guard:founder
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -8
```

Expected: the built CSS contains the semantic variables and the library's classes (the library scanned itself — Review Focus 4); the guard prints `Founder-name guard: clean.`; story tests pass.
If the guard flags a machine path under the user's home directory inside `storybook-static`, the build is embedding absolute paths (usually docgen or source maps): find the file with `rtk proxy grep -rl "Users/" apps/storybook/storybook-static | head`, remove the cause in `.storybook/main.ts` (e.g. disable build source maps in `viteFinal`), and rerun. **Never narrow the guard.**

- [ ] **Step 6: Visual check**

Run `pnpm nx run @pink-paprikaa-web/storybook:serve` and open `http://localhost:6006`. Confirm: sidebar starts with Introduction then Atoms; Atoms/Logo renders the lockup in brand pink in Poppins-free vector form, the white tone on the pink panel, the badge on its plate; Atoms/Icon renders all sizes. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A apps/storybook package.json pnpm-lock.yaml
git commit -m "feat(storybook): consume the design system like an app

Tailwind plus the library's one stylesheet, self-hosted brand fonts, the
design system's thirteen tab groups as the sidebar order, and the contrast
policy documented in place of the old blanket exemption. The founder guard
now scans the Storybook build too.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

