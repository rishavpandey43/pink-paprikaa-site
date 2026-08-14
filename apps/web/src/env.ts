/**
 * The ONLY reader of `process.env` in `apps/web` (engineering handbook 02 §3).
 * Nothing else in this app touches `process.env` — new variables are declared,
 * validated and named here, and consumers import the typed value.
 *
 * Deliberately dependency-free. A single variable does not justify pulling in a
 * schema library, and adding one here would quietly pre-commit the workspace to
 * a validation choice nobody has made yet. Revisit when a third variable lands.
 *
 * Static-export caveat: `NEXT_PUBLIC_*` values are INLINED at build time, so
 * changing or removing the pixel later needs a rebuild + redeploy, not a
 * Netlify config change. See `docs/analytics/meta-pixel.md`.
 */

const rawMetaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

/**
 * A Meta dataset id is a plain numeric string. Anything else — empty, quoted,
 * a pasted placeholder — is treated as "not configured" rather than shipped to
 * Meta, so a typo fails closed instead of silently mis-attributing traffic.
 */
const isValidMetaPixelId = typeof rawMetaPixelId === "string" && /^\d+$/.test(rawMetaPixelId);

/** The Meta Pixel dataset id, or `""` when unset or malformed. Never `undefined`. */
export const META_PIXEL_ID: string = isValidMetaPixelId ? rawMetaPixelId : "";

/** Whether a usable dataset id was baked into this build. */
export const isPixelEnabled = META_PIXEL_ID !== "";

/**
 * Netlify sets `CONTEXT` at build time to `production` | `deploy-preview` |
 * `branch-deploy`. It is not `NEXT_PUBLIC_`, so it is readable only while
 * prerendering in Node — which is exactly where the `<noscript>` fallback is
 * emitted, and the only gate available to it.
 *
 * This matters because deploy previews inherit the same environment variables
 * as production: gating the `<noscript>` on the pixel id alone would ship a
 * live, ungated tracking pixel from every preview URL. The client-side loader
 * has a second, independent runtime hostname gate; `<noscript>` cannot have one
 * (it fires precisely when no JavaScript runs), so this build-time gate is it.
 */
export const isProductionBuild = process.env.CONTEXT === "production";
