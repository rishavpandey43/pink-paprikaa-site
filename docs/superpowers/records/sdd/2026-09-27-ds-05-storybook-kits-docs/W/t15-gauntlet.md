# Plan 5 T15 — full gauntlet

Branch: `feat/design-system`
Date: 2026-10-03
Mode: read-only (commands re-run only; no source edits, no commit)

Failures: **none**. No command failed. `storybook:test` was a 100% cache hit; the cold-cache "Failed to fetch dynamically imported module" flake did **not** occur, so it was **not** re-run.

---

## 1. `pnpm nx run-many -t typecheck lint test build`

**Exit code:** 0  
**Result:** PASS

Nx: `Successfully ran targets typecheck, lint, test, build for 12 projects and 1 task they depend on`  
Tasks: 35 total, cache **33/35 hit (94%)**  
Run duration: 4.9s (wall ~11.6s including process startup)

Projects:

- `@pink-paprikaa-web/design-tokens`
- `@pink-paprikaa-web/image-pipeline`
- `@pink-paprikaa-web/eslint-config`
- `@pink-paprikaa-web/content`
- `@pink-paprikaa-web/storybook`
- `@pink-paprikaa-web/utils`
- `@pink-paprikaa-web/blog-e2e`
- `@pink-paprikaa-web/seo`
- `@pink-paprikaa-web/web-e2e`
- `@pink-paprikaa-web/ui`
- `@pink-paprikaa-web/blog`
- `@pink-paprikaa-web/web`

Plus the one depended-on task: `design-tokens:build`.

### Test counts

| Project | Files | Tests |
| --- | ---: | ---: |
| utils | 1 passed (1) | 18 passed (18) |
| content | 2 passed (2) | 20 passed (20) |
| image-pipeline | 1 passed (1) | 1 passed (1) |
| seo | 1 passed (1) | 1 passed (1) |
| design-tokens | 4 passed (4) | 288 passed (288) |
| ui | 108 passed (108) | 1619 passed (1619) |
| storybook (included as `test` target) | 107 passed (107) | 989 passed (989) |
| eslint-config (`node --test`) | — | 11 pass / 0 fail |

Vitest file total (excluding eslint-config): **224 files**, **2936 tests**.  
Plus eslint-config: **11 tests**. Combined **2947 tests**, **0 failed**.

Lint (non-failing): two existing Playwright warnings, 0 errors:

```
apps/blog-e2e/src/blog.spec.ts
  21:16  warning  Avoid having conditionals in tests  playwright/no-conditional-in-test
✖ 1 problem (0 errors, 1 warning)

apps/web-e2e/src/home.spec.ts
  20:16  warning  Avoid having conditionals in tests  playwright/no-conditional-in-test
✖ 1 problem (0 errors, 1 warning)
```

Quoted failures: none.

---

## 2. `pnpm nx format:check`

**Exit code:** 0  
**Result:** PASS

No unformatted files listed. Nx/Prettier printed no file list (empty stdout besides process status).

Quoted failures: none.

---

## 3. `pnpm nx sync:check`

**Exit code:** 0  
**Result:** PASS

```
NX   The workspace is up to date

[@nx/js:typescript-sync]: All files are up to date.
```

Quoted failures: none.

---

## 4. `pnpm nx run storybook:test`

**Exit code:** 0  
**Result:** PASS (first run; no re-run)

Cache: **2/2 hit (100%)** — output is the cached vitest run from 22:51:37 (duration 19.67s).

```
 Test Files  107 passed (107)
      Tests  989 passed (989)
```

Warning (not a failure): `No story files found for the specified pattern: ../../packages/ui/src/**/*.mdx`

Cold-cache flake (`Failed to fetch dynamically imported module`): **not observed**. Second run skipped.

Quoted failures: none.

---

## 5. `pnpm guard:founder`

**Exit code:** 0  
**Result:** PASS

Scanned: `apps/web/out`, `apps/blog/out`, `apps/storybook/storybook-static`

```
Founder-name guard: clean.
```

Quoted failures: none.

---

## Scoreboard

| # | Command | Exit | Pass/fail |
| --- | --- | ---: | --- |
| 1 | `pnpm nx run-many -t typecheck lint test build` | 0 | pass |
| 2 | `pnpm nx format:check` | 0 | pass |
| 3 | `pnpm nx sync:check` | 0 | pass |
| 4 | `pnpm nx run storybook:test` | 0 | pass (107 files / 989 tests; no flake re-run) |
| 5 | `pnpm guard:founder` | 0 | pass |

Failure names: none.
