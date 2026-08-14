"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useSyncExternalStore } from "react";

declare global {
  interface Window {
    /** Defined by Meta's loader below. Absent until it runs — and forever when the pixel is gated off. */
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * The hosts allowed to send events to the production dataset.
 *
 * An ALLOWLIST, never a blocklist: an unrecognised host — a new deploy-preview
 * domain, a staging box, a phone hitting `192.168.x.x` — fails closed. The
 * predecessor site leaked events into this same dataset from `localhost:5011`
 * and `localhost:5012`. Do not add a local hostname here to make a test pass;
 * verify on the deployed domain instead.
 */
const PRODUCTION_HOSTNAMES: readonly string[] = ["pinkpaprikaa.com", "www.pinkpaprikaa.com"];

/**
 * Meta's official base-code loader, byte-for-byte as Events Manager emits it.
 * The one substitution is the dataset id, which comes from `env.ts` so the
 * pixel can be environment-gated — it is the same value, read from config
 * rather than hard-coded.
 *
 * Do NOT reformat, minify, re-indent or "modernise" this body. The line breaks
 * are Meta's. It lives in a template literal because Prettier does not touch
 * template-literal contents.
 *
 * SECURITY INVARIANT — this string is injected unescaped as an inline script.
 * `pixelId` is the ONLY interpolated value, and it is safe only because
 * `env.ts` asserts `/^\d+$/` before exporting it. Nothing user-supplied,
 * request-derived or otherwise unvalidated may EVER be interpolated here.
 */
const buildLoaderSnippet = (pixelId: string) => `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');`;

/**
 * Module-level, deliberately NOT `useRef`.
 *
 * A ref is per-instance, so it is recreated by React 19 StrictMode's
 * double-mount, by a Fast Refresh remount, and by any second `<MetaPixel>` in
 * the tree — each of which would mean a second `fbq('init')`, and two inits
 * duplicate every event in the dataset. Module scope survives all three.
 *
 * Claimed in an effect and RELEASED on cleanup, so StrictMode's
 * mount→cleanup→mount does not read as a genuine second instance.
 */
let hasInitialisedPixel = false;
let hasLoggedGateNotice = false;

/**
 * The pathname the last PageView was attributed to. `null` means "nothing
 * tracked yet", which is how the initial load is skipped: the base snippet's
 * own `fbq('track', 'PageView')` already reported it.
 */
let lastTrackedPathname: string | null = null;

/**
 * The hostname gate cannot be evaluated while prerendering — a static export
 * ships one set of files to every host, so only the browser knows where it is.
 *
 * `useSyncExternalStore` is React's sanctioned way to read a browser-only value
 * without a hydration mismatch and without calling `setState` inside an effect:
 * it returns the server snapshot (`false`) during prerender and hydration, then
 * the real value. The subscription is a no-op because a document's hostname
 * cannot change without a full page load.
 */
const subscribeToHostname = () => () => {
  // Intentionally empty: hostname is immutable for the lifetime of the document.
};
const getIsProductionHostSnapshot = () => PRODUCTION_HOSTNAMES.includes(window.location.hostname);
const getIsProductionHostServerSnapshot = () => false;

/**
 * The single `fbq` call site in this app. No-ops safely when the pixel is gated
 * off, when the loader has not finished, and outside a browser — so no caller
 * needs its own guard.
 */
function trackPageView(): void {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") return;
  window.fbq("track", "PageView");
}

/**
 * One line, once, explaining why nothing is firing.
 *
 * `console.warn` rather than `console.log` because the workspace lint config
 * permits only `warn`/`error`. No `NODE_ENV` check is needed: on a genuine
 * production host both gates pass, so this is unreachable there. It surfaces
 * exactly on localhost and preview deploys, which is the point.
 */
function logGateNoticeOnce(reason: string): void {
  if (hasLoggedGateNotice) return;
  hasLoggedGateNotice = true;
  console.warn(`[meta-pixel] not loaded — ${reason}. No events will be sent.`);
}

export interface MetaPixelProps {
  /**
   * The dataset id from `env.ts`, passed down rather than imported so this
   * client module never reads `process.env` itself (handbook 02 §3). `""` means
   * no id was configured for this build.
   */
  pixelId: string;
}

/**
 * Loads the Meta Pixel and reports App Router soft navigations.
 *
 * SINGLE-INSTANCE INVARIANT — this component is rendered in exactly ONE place,
 * `apps/web/src/app/layout.tsx`, and must never be rendered anywhere else or
 * more than once. Two mounted instances mean two `fbq('init')` calls, which
 * duplicates every event in the dataset. The `id` prop on `<Script>` below and
 * `hasInitialisedPixel` above both exist to blunt that, but neither makes a
 * second instance correct.
 *
 * Two independent gates, BOTH of which must pass or this renders nothing and
 * makes no network request at all:
 *
 *   1. build time — `NEXT_PUBLIC_META_PIXEL_ID` was baked into this bundle;
 *   2. run time — `window.location.hostname` is on `PRODUCTION_HOSTNAMES`.
 *
 * Both are constant for the lifetime of the document, so once hydration
 * settles this component's output never flips: the loader mounts exactly once.
 * `id="meta-pixel"` is next/script's own dedupe key, which independently
 * prevents the body from executing twice.
 *
 * PageView on navigation fires on PATHNAME changes only — never on query-param
 * or hash changes. Rationale, and the condition that reverses it, are in
 * `docs/analytics/meta-pixel.md`.
 */
export function MetaPixel({ pixelId }: MetaPixelProps) {
  const pathname = usePathname();
  const isProductionHost = useSyncExternalStore(
    subscribeToHostname,
    getIsProductionHostSnapshot,
    getIsProductionHostServerSnapshot
  );

  const isPixelConfigured = pixelId !== "";
  const isGateOpen = isPixelConfigured && isProductionHost;

  useEffect(() => {
    if (isGateOpen) {
      if (hasInitialisedPixel) {
        console.error(
          "[meta-pixel] a second <MetaPixel> is mounted — fbq('init') must run exactly once."
        );
        return;
      }
      hasInitialisedPixel = true;
      return () => {
        hasInitialisedPixel = false;
      };
    }

    logGateNoticeOnce(
      isPixelConfigured
        ? `"${window.location.hostname}" is not a production host`
        : "NEXT_PUBLIC_META_PIXEL_ID is not set in this build"
    );
    return undefined;
  }, [isGateOpen, isPixelConfigured]);

  useEffect(() => {
    // The first run of this effect IS the initial page load, which the base
    // snippet already reported. Record it and send nothing.
    if (lastTrackedPathname === null) {
      lastTrackedPathname = pathname;
      return;
    }

    // Same pathname means a StrictMode re-run or a plain re-render, not a
    // navigation. Comparing pathnames rather than counting invocations is what
    // makes the initial-load skip idempotent under double-mount.
    if (lastTrackedPathname === pathname) return;

    lastTrackedPathname = pathname;
    trackPageView();
  }, [pathname]);

  if (!isGateOpen) return null;

  return (
    <Script
      // LOAD-BEARING — do not rename or remove.
      //
      // `id` is not decoration and not merely next/script's requirement for
      // inline scripts: it is the key of next/script's own module-level
      // `LoadCache` (`node_modules/next/dist/client/script.js:72` — `if (cacheKey
      // && LoadCache.has(cacheKey)) return;`, populated at line 245). That cache
      // is the PRIMARY lock preventing `fbq('init')` from executing twice across
      // a StrictMode double-mount or any remount.
      //
      // Changing this string silently removes that guarantee — nothing fails,
      // no test breaks, and the dataset quietly starts double-counting.
      // `hasInitialisedPixel` above is a development tripwire, not the lock.
      id="meta-pixel"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: buildLoaderSnippet(pixelId) }}
    />
  );
}
