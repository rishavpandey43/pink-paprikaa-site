import { MetaPixel } from "@/components/meta-pixel";
import { isPixelEnabled, isProductionBuild, META_PIXEL_ID } from "@/env";

import "./global.css";

export const metadata = {
  title: "Pink Paprikaa",
  description: "Pink Paprikaa. New site under construction.",
};

/**
 * Meta's `<noscript>` fallback, kept byte-for-byte from Events Manager.
 *
 * (a) Raw HTML rather than JSX, deliberately: a JSX `<img>` would have to carry
 * an `alt` attribute to satisfy the `jsx-a11y/alt-text` gate, and Meta's snippet
 * has none — adding one would mean this is no longer Meta's snippet. Raw HTML
 * keeps the markup exact AND clears the gate, so no lint suppression is needed
 * anywhere in this file. Do not "fix" it by adding `alt=""`.
 *
 * (b) SECURITY INVARIANT — this string is injected unescaped into the document.
 * `META_PIXEL_ID` is the ONLY value that may ever be interpolated here, and it
 * is safe only because `env.ts` asserts it matches `/^\d+$/` before export.
 * NOTHING user-supplied, request-derived, content-authored or otherwise
 * unvalidated may EVER be interpolated into this template. There is no escaping
 * step to save you: a value reaching here reaches the DOM verbatim.
 */
const metaPixelNoscriptHtml = `<img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1"
/>`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/*
          Gated at BUILD time, not runtime: `<noscript>` fires precisely when no
          JavaScript runs, so the client-side hostname allowlist cannot reach
          it. `isProductionBuild` (Netlify's `CONTEXT`) is what keeps deploy
          previews — which inherit production's environment variables — from
          shipping a live pixel.
        */}
        {isProductionBuild && isPixelEnabled ? (
          <noscript dangerouslySetInnerHTML={{ __html: metaPixelNoscriptHtml }} />
        ) : null}
        {/*
          Rendered unconditionally so the gate decision (and its one-line
          console notice) lives in one place. It returns null and issues no
          network request whenever either gate fails.

          `/blog/*` is a SEPARATE Next app (`apps/blog`) with its own root
          layout and is deliberately UNINSTRUMENTED. If blog coverage is ever
          wanted it needs the same treatment there — and must never produce a
          second `fbq('init')` for this dataset. See `docs/analytics/meta-pixel.md`.
        */}
        <MetaPixel pixelId={META_PIXEL_ID} />
        {children}
      </body>
    </html>
  );
}
