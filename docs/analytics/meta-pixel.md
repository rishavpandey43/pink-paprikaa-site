# Meta Pixel — what is installed, what is deliberately not, and why

Dataset: **1339451664838482** ("Pink Paprikaa Website"). The same pixel is live on the outgoing
static site; this app replaces that installation, it does not add a second one.

**Scope of what shipped: the base pixel and PageView. Nothing else.** No standard events are
instrumented, because at the time of writing there is no user action in `apps/web` to instrument.
That is a fact about the app, not an oversight — see [What to instrument later](#what-to-instrument-later).

## Files

| File                                     | Role                                                                                       |
| ---------------------------------------- | ------------------------------------------------------------------------------------------ |
| `apps/web/src/env.ts`                    | The only `process.env` reader in the app (handbook 02 §3). Validates the id, exposes gates |
| `apps/web/src/components/meta-pixel.tsx` | Client island: the loader, both gates, and the soft-navigation PageView                    |
| `apps/web/src/app/layout.tsx`            | Renders `<MetaPixel>` and the build-time-gated `<noscript>` fallback                       |
| `apps/web/.env.example`                  | Documents `NEXT_PUBLIC_META_PIXEL_ID`                                                      |

## The two gates

Both must pass or nothing loads and no request is made.

1. **Build time** — `NEXT_PUBLIC_META_PIXEL_ID` must be a non-empty numeric string. A missing or
   malformed value fails closed.
2. **Run time** — `window.location.hostname` must be in `PRODUCTION_HOSTNAMES`
   (`pinkpaprikaa.com`, `www.pinkpaprikaa.com`).

The runtime gate is an **allowlist, not a blocklist**, so an unknown host — a new preview domain,
a staging box, a phone on `192.168.x.x` — fails closed. This exists because the predecessor site
used a blocklist and leaked events into this dataset from `localhost:5011` and `localhost:5012`.

**Never add a local hostname to the allowlist to make a test pass.** Serving `out/` locally is
_supposed_ to be gated off. Live verification happens on the deployed domain.

> **The legacy static site is still leaking, and the fix does NOT belong in this repo.** Events
> Manager's Sampled activities panel (24-hour window) shows `http://localhost:5011/index.html`,
> `http://localhost:5011/policies.html` and `http://localhost:5012/contact.html` sending to dataset
> 1339451664838482 as of 2026-08-14 — those rows carry 5 event parameters where the production rows
> carry none. That is the **old** site's ungated pixel, running from a developer machine. It is the
> reason this app gates on an allowlist. Fix it in the legacy repository; do not attempt to fix it
> from here.

## What actually prevents a double `fbq('init')`

Read this before touching `<MetaPixel>`.

- **The primary lock is `id="meta-pixel"` on `<Script>`.** It is LOAD-BEARING, not decoration.
  next/script keys its module-level `LoadCache` on that id and returns early if it is already
  present — `node_modules/next/dist/client/script.js:72`
  (`if (cacheKey && LoadCache.has(cacheKey)) return;`), populated at line 245. That is what makes a
  StrictMode double-mount or any remount unable to execute the loader twice.
  **Renaming or removing the id silently removes the guarantee**: nothing fails, no test breaks, and
  the dataset quietly starts double-counting.
- **`hasInitialisedPixel` is a development tripwire, not the lock.** It is claimed in an effect and
  released on cleanup (so StrictMode's mount→cleanup→mount is not misread as a second instance), and
  it `console.error`s if a genuinely concurrent second `<MetaPixel>` mounts.
- **Single-instance invariant:** `<MetaPixel>` is rendered in exactly ONE place —
  `apps/web/src/app/layout.tsx` — and must never be rendered anywhere else or more than once.
- **Why not a stronger lock:** initialising at module-evaluation time would lock harder but would
  abandon `afterInteractive` scheduling and pull `fbevents.js` into the critical path, spending the
  very performance headroom noted under [Lighthouse CI](#lighthouse-ci-does-not-measure-the-pixel).
  Gating via `setState` inside an effect is a genuine cascading-render bug, not a lint inconvenience.
  The residual failure mode — duplicate PageViews — is observable in Events Manager and reversible.

### The `<noscript>` fallback is gated differently, and has to be

`<noscript>` fires precisely when no JavaScript runs, so the runtime hostname gate cannot reach it.
Its only available gate is build time, so it is emitted only when
`process.env.CONTEXT === "production"` **and** the pixel id is configured.

`CONTEXT` is Netlify's build-time variable (`production` | `deploy-preview` | `branch-deploy`). It
is not `NEXT_PUBLIC_`, so it is readable only while prerendering in Node — which is exactly where
the `<noscript>` is emitted. It is required because **deploy previews inherit production's
environment variables**: gating on the pixel id alone would ship a live, ungated tracking pixel
from every preview URL.

### Static export means the pixel is baked in, not configured

`NEXT_PUBLIC_*` values are inlined into the bundle at build time. **Turning the pixel off, or
changing the dataset, requires a rebuild and redeploy — not a Netlify environment-variable
change.** Changing the variable alone does nothing to the already-deployed files.

## PageView on client-side navigation

The base snippet fires PageView once, on hard load. App Router soft navigations do not re-execute
it, so `<MetaPixel>` subscribes to `usePathname()` and fires PageView on subsequent pathname
changes. The first invocation is skipped via a module-level `lastTrackedPathname` (not a `useRef`,
which would be recreated by StrictMode's double-mount) so the initial load is not counted twice.

**Chosen behaviour: pathname changes only.** Query-param-only and hash-only changes do **not** fire.

- **Why this loses nothing for attribution:** UTM parameters only ever arrive on a hard load, which
  the base snippet already tracks — with the full URL, query string included, since `fbq` reads
  `document.location.href` itself.
- **Why not query params:** on this site they will be filter and sort state. A visitor toggling a
  menu filter four times is one page view, not five.
- **Reversal condition — read this before adding a route:** if any future route uses a query
  parameter as page **identity** rather than page **state** (`/menu?dish=momos`,
  `/menu?category=starters`), pathname-only will under-count. At that point the correct fix is
  `useSearchParams()` alongside `usePathname()`, wrapped in `<Suspense>` — the Suspense boundary is
  required because `useSearchParams()` opts the subtree into client rendering during static export.
  It is deliberately absent today because nothing reads it.

### ⚠️ OUTSTANDING VERIFICATION — soft navigation is unproven

**"One extra PageView per client-side navigation, with the correct `dl`/URL value" has never been
observed.** It could not be: `apps/web` has exactly one route, so there is no soft navigation to
make, and the hostname gate correctly refuses to load on any local host.

This must be confirmed on the **deployed `pinkpaprikaa.com`, once a second real route exists**. Do
not close it out by adding a throwaway route or by allowlisting localhost — both would prove
something other than the thing being tested. Everything else in the install has been verified;
this one item has not.

## `/blog/*` is deliberately uninstrumented

`apps/blog` is a **separate Next application** with its own root layout, deployed as its own
Netlify site and proxied onto `/blog` on the apex domain. It has no pixel.

If blog coverage is ever wanted, it needs the same `env.ts` + `<MetaPixel>` treatment in
`apps/blog`. **Whatever is done there must never result in two `fbq('init')` calls for this dataset
in one page load** — two inits duplicate every event. Since the two apps are separate documents
served under one domain, a navigation from `/` to `/blog` is a hard load and each app inits once;
the hazard is only ever inlining a second loader into the _same_ document.

## Lighthouse CI does not measure the pixel

`.lighthouserc.json` audits `apps/web/out` over `localhost`, where the hostname allowlist gates the
pixel off. The asserted budgets — performance ≥ 0.95, TBT ≤ 200 ms, total byte weight ≤ 1 MB —
therefore **exclude `fbevents.js` (~70–80 KB over the wire, plus its execution time)**.

Those numbers are not a measurement of the shipped production page. This is correct behaviour and
must not be "fixed" by allowlisting localhost.

## What to instrument later

When real components land, these are the events worth adding — and the only ones. Meta has 17
standard events; instrumenting any of them purely to raise the "setup completeness" percentage in
Events Manager produces fake data, not better targeting.

| Event           | Trigger                                                          | Status                                                                                         |
| --------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| **Contact**     | WhatsApp link click (`wa.me/919090704001`) and `tel:` link click | Add when a real contact CTA exists                                                             |
| **Lead**        | Contact/reservation form reaching a genuine success state        | Add only if such a form is built. Never fire on a button click alone                           |
| **ViewContent** | Menu or dish detail route                                        | Add only if such a route exists                                                                |
| **Purchase**    | —                                                                | **Not applicable.** Ordering happens off-domain via Petpooja; there is no checkout in this app |

Notes for whoever does that work:

- Meta already auto-captures a `SubscribedButtonClick` event on outbound button clicks. A manual
  `Contact` event on a WhatsApp link **will overlap with it**. Decide deliberately whether both are
  wanted before adding one.
- WhatsApp links open in a new tab. The handler must not `preventDefault()` and must not delay
  navigation — fire and let the click proceed.
- Never pass raw personal data (name, phone, email, address) into `fbq` parameters. Advanced
  Matching requires SHA-256 hashed values; if it cannot be hashed correctly, skip Advanced Matching
  entirely rather than sending plaintext.
- Any value-bearing event uses **INR**.
- The likely future instrumentation points are the `packages/ui` components `SiteHeader`,
  `CtaBand`, `MenuItemCard`, `MenuList` and `SlotPicker` — **none of which `apps/web` currently
  imports**. The design system must stay presentational: tracking belongs in the app that binds
  them, not in the component library.

## Open items (reported, deliberately not built)

### Cookie consent

The pixel sets `_fbp` immediately on load. This app has **no consent mechanism** and no other
analytics. Under GDPR and India's DPDP Act this arguably requires consent before the pixel loads.

Smallest correct shape when it is addressed: a third gate in `<MetaPixel>` — a stored consent
decision (a first-party cookie or `localStorage` key) that must be affirmative before the `<Script>`
renders, defaulting to _not granted_. Because the loader is already behind a render gate, this is
one added condition, not a rewrite. The banner itself is a separate piece of work.

**This blocks a decision that is already open:** the boilerplate architecture spec (§ "Open
questions") still lists "Analytics choice (GA4 vs Plausible/Umami) — affects the consent story" as
undecided. A cookieless analytics choice would need no banner; the Meta Pixel needs one regardless,
so that decision no longer removes the consent requirement, it only changes how much else sits
behind it.

### Content-Security-Policy

There is **no CSP anywhere in this workspace**, and a static export cannot emit headers from
Next — they would have to come from Netlify (`apps/web/public/_headers` or `netlify.toml`).

If one is ever added, these are the directives the pixel needs:

| Directive     | Value                                                     | Why                                                       |
| ------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| `script-src`  | `https://connect.facebook.net`                            | `fbevents.js` is loaded from here                         |
| `connect-src` | `https://www.facebook.com` `https://connect.facebook.net` | Event beacons and any `fetch`/XHR fallback                |
| `img-src`     | `https://www.facebook.com`                                | The `tr?id=…` tracking pixel and the `<noscript>` `<img>` |

The loader is an **inline** script, so under a CSP it needs either a `nonce` or a `sha256-` hash in
`script-src`. A nonce must be per-response and unguessable — a static export serves identical
bytes to everyone, so a baked-in nonce would be a constant and therefore worthless. **On this stack
the hash is the only correct option**, and it must be regenerated whenever the snippet or the
dataset id changes. `next/script` accepts a `nonce` prop if the stack ever gains a server.

**Never disable or weaken CSP to make the pixel work.**

### X-Frame-Options / frame-ancestors

None are set today. If clickjacking protection is ever added, **leave it alone**. Meta's optional
Event Setup Tool needs to iframe the site and will fail against it. That is an acceptable
trade-off; the tool is a convenience for point-and-click event configuration, and events can be
defined in code instead. Never weaken framing protection for it.

### Conversions API

**Not implemented, and not implementable on this stack as it stands.** The site is
`output: "export"` — no server, no route handlers, no middleware. Server-side events would need a
real endpoint: a Netlify Function (or any small server) that receives the event, adds the
`event_id` used to deduplicate against the browser pixel, and POSTs to Meta's Conversions API with
an access token.

**The access token is a credential.** It must live in a server-only environment variable, never in
a `NEXT_PUBLIC_` variable, never in `.env.example`, and never in any file the client bundle can
reach — a `NEXT_PUBLIC_` token would be inlined into the JavaScript and readable by anyone who
views source.
