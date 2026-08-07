# assets-src

Original, unoptimised image source files — the inputs to `tools/image-pipeline`.

- **Never deployed.** Nothing under this directory ships to `apps/web/public` or
  `apps/blog/public`; it is excluded from every app build. Only the AVIF/WebP/JPEG ladder,
  LQIP placeholders and `manifest.json` produced by `tools/image-pipeline` are shipped.
- **Not inside any app's `public/`.** This sits at the workspace root, a sibling of `apps/` and
  `packages/`, so it can never be picked up by Next.js's static asset copy.
- **Why this exists:** the old site (`../pink-paprikaa-site`, read-only reference material)
  shipped 43 MB of raw PNGs straight into its `public/` directory. The Lighthouse byte-weight
  budget in CI exists specifically to make that regression impossible to repeat — originals stay
  here, only processed output ships.
- **What lands here:** Phase 3 migrates the 25 PNGs currently in
  `pink-paprikaa-site/src/assets/images/` into this directory (deciding which survive the
  redesign rather than porting all of them as-is). Phase 0 only proves the pipeline library
  itself works, against synthetic images generated on the fly in
  `tools/image-pipeline/src/pipeline.test.ts` — this directory is intentionally empty until then.

## Usage (from Phase 3 onward)

```bash
node tools/image-pipeline/dist/cli.js assets-src apps/web/public/images
```

Reads every `.jpg` / `.jpeg` / `.png` / `.webp` file directly under `srcDir`, emits an
AVIF + WebP + JPEG-fallback ladder (`640`/`960`/`1280`/`1920`px, never upscaled past the
original), a 16px-wide inlined WebP LQIP per source image, and a `manifest.json` describing
every variant. See `tools/image-pipeline/src/pipeline.ts` for the exact contract.
