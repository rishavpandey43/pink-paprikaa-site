# Visual snapshots

One full-page screenshot per story, at two viewports — `mobile` (360×800) and `desktop` (1280×800).
The story list comes from the built `storybook-static/index.json`, so a new story is picked up with
no change here. It exists so the design-parity pass can prove that a change meant for one
component did not alter another.

| File                      | What it does                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------ |
| `visual.spec.ts`          | Opens every story, waits for render + play + fonts, compares to the baseline         |
| `playwright.config.mts`   | Two projects, reduced motion, fixed locale/timezone/scale, serves the static export  |
| `serve.mjs`               | A 50-line Node `http` static server for `storybook-static/` (Playwright `webServer`) |
| `Dockerfile`, `docker.sh` | The pinned Playwright image, and the script that runs the suite in it (needs Docker) |
| `__screenshots__/`        | The baselines: `mobile/<story-id>.png`, `desktop/<story-id>.png` — committed         |
| `test-results/`           | Failure diffs (actual / expected / diff). Git-ignored                                |

## Run it

```bash
pnpm nx run storybook:visual                             # builds Storybook, compares everything
pnpm nx run storybook:visual -- --grep atoms-button--    # one component's stories (id prefix)
pnpm nx run storybook:visual -- --update-snapshots --grep atoms-button--   # re-baseline those only
```

`--grep` takes a plain id prefix. Nx hands the arguments to a shell, so a regex with `|` or `(` is
split there — run one prefix at a time, or call `pnpm exec playwright test --config
visual/playwright.config.mts --grep "a|b"` from `apps/storybook`.

`storybook:visual` depends on `build-storybook`, so it always tests the current source. Extra
arguments after `--` go straight to `playwright test`. Tolerance is `maxDiffPixelRatio: 0.001` in
`visual.spec.ts` — never widen it globally.

## The rule for later tasks

- Your own component's screenshots change as intended → update **only those**
  (`--update-snapshots --grep <prefix>`), open each diff image first, stage the PNGs with your task.
- **Any other** story's screenshot changes → that is an unintended side effect. Fix the code. Never
  update those baselines.
- The batch gate runs the full suite with no updates.

## Skipping a story

Fix the cause first: a flaky story is a story whose play doesn't end in one settled state. Await
the animations it starts and any self-closing timer (toast, countdown) before the play returns —
see `website-homepage--homepage`. Only content that can never be deterministic (a live clock,
randomness, a network image) may be tagged `no-visual` (`tags: ["no-visual"]`), with a `Ruling:`
line in the ledger saying why. Never loosen the tolerance. A story that fails the `test` tag
(`!test`) is skipped as well.

## The baselines are macOS-generated

Rendering differs between operating systems (font hinting, anti-aliasing), so a baseline only
matches on the OS that made it. These were generated **natively on macOS** with Chromium from
Playwright 1.62.1 because Docker was not available when they were created. Consequences:

- Run the suite on a Mac. It will fail on Linux/CI as-is, which is why it is **not** in
  `.github/workflows/ci.yml`.
- To make the baselines OS-independent, regenerate them once inside the official Playwright image
  (the tag must match the installed `@playwright/test`, currently 1.62.1) and commit the result:

```bash
apps/storybook/visual/docker.sh --update-snapshots   # builds ./Dockerfile, runs the suite, copies PNGs back
```

(`docker.sh` is equivalent to `docker run … mcr.microsoft.com/playwright:v1.62.1-noble pnpm nx run
storybook:visual -- --update-snapshots` on a clean copy of the repo; `Dockerfile` pins the image tag
and `docker.sh` refuses to run if that tag drifts from the installed `@playwright/test`.)

After that, run the same image without `--update-snapshots` to verify, and delete this section.

## Determinism

`reducedMotion: "reduce"` freezes loops and transitions, Playwright's `animations: "disabled"` and
caret hiding apply to every screenshot, `deviceScaleFactor` is 1 so a retina Mac and a 1x machine
agree, and locale/timezone are fixed. A story whose play function has not finished, or whose fonts
or images have not loaded, never reaches the screenshot, and scroll positions must hold still for
ten frames first.

Scroll-snap tracks (carousels) are scrolled back to their start before the screenshot. A play
function that tabs through or pages a carousel leaves it wherever focus-scrolling last settled,
which varied with machine load (`organisms-reviewcarousel--mobile|desktop|paging` differed on about
one run in four). Their states are still asserted by the plays in `storybook:test`.
