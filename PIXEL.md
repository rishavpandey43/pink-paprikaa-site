# Meta Pixel — Pink Paprikaa

Status of the Meta (Facebook) Pixel on `pinkpaprikaa.com`. Keep this file updated when
anything about tracking changes.

## Dataset

| | |
|---|---|
| Pixel / Dataset ID | `1339451664838482` |
| Events Manager | Datasets → **Pink Paprikaa Website** |
| Currency for value-bearing events | INR |
| Host | Netlify (deploy config lives in the Netlify UI, not in this repo) |

## Which pages carry the base code

All five user-facing pages. There are no other real pages in this repo.

| Page | Base code | Placement |
|---|---|---|
| `src/index.html` | yes | in `<head>`, immediately before `</head>` |
| `src/about.html` | yes | same |
| `src/menu.html` | yes | same |
| `src/contact.html` | yes | same |
| `src/policies.html` | yes | same |

The block is **byte-for-byte identical** on all five (sha1 of the block: `399ecb84…`).
Verify with:

```sh
for f in src/*.html; do
  sed -n '/<!-- Cookie Consent + Meta Pixel -->/,/<!-- End Cookie Consent + Meta Pixel -->/p' "$f" \
    | shasum | cut -d' ' -f1
done | sort -u   # must print exactly one hash
```

These pages are fully duplicated by design — there is no layout include. **Any change to the
pixel block must be applied to all five files and re-verified with the command above.**

## Consent gate — read this before debugging "the pixel isn't firing"

The pixel is **opt-in**. It does not load on page view. Nothing is sent to Meta until the
visitor clicks **Accept** on the cookie banner.

- The base snippet lives inside a `loadPixel()` function, called only on Accept.
- Choice is stored in `localStorage` under `pp-cookie-consent` (`granted` / `denied`).
- `window.ppCookieSettings()` reopens the banner. `policies.html` exposes it as a
  "Change your cookie preferences" button.
- The `<noscript>` fallback from Meta's stock snippet was **deliberately removed**. It fires
  only when scripting is disabled, and a visitor without scripting can never be shown a
  consent banner, so it could not be gated.

**Consequence: event volume in Events Manager will read well below raw site traffic.**
Anyone who declines, or who ignores the banner, is invisible to Meta. That gap is the gate
working, not a tracking bug. Do not "fix" it by ungating without a deliberate decision.

**To add any future marketing tag** (GA, Google Ads, TikTok), put it inside `loadPixel()`
behind the same gate — never directly in the `<head>`.

## Events

| Event | Status | Trigger | Where the code lives |
|---|---|---|---|
| `PageView` | **live** | Accept on the cookie banner | inside `loadPixel()`, all 5 pages |
| `Contact` | **live** | click on `tel:`, `mailto:`, or `wa.me/…` | `CLICK_EVENTS` → `trackClick()`, all 5 pages |
| `FindLocation` | **live** | click on a Google Maps link | same |
| `InitiateCheckout` | **live** | click on **Order Now** (`order.pinkpaprikaa.com`) | same |
| `ViewContent` | **no code** | visit to `menu.html` | URL-rule custom conversion in Events Manager |

The three click events use one delegated listener (`trackClick`) registered in `start()`.
It is guarded by `if (!window.fbq) return;` — since `fbq` only exists after Accept, the
click events are gated exactly like `PageView`, with no separate consent check to keep in
sync. Internal navigation deliberately matches nothing.

`ViewContent` is intentionally **not** in the code and is scoped to `menu.html` only.
Putting it on every page would just duplicate `PageView` and teach Meta nothing. Keeping it
as a custom conversion also preserves the byte-identical-block invariant above — no page
carries a snippet the others don't.

Verified in-browser: all four fire `https://www.facebook.com/tr/?id=1339451664838482` with
the expected `ev=` value and HTTP 200, and none fire when consent is declined.

Deliberately **not** tracked:

- `Purchase` — orders complete on Petpooja, not on this site. No server confirmation and no
  refresh de-duplication is possible here, so firing it would fabricate revenue.
- `Lead`, `CompleteRegistration`, `SubmitApplication` — **this site has no form.** Contact
  happens via `mailto:`, `tel:`, and WhatsApp. There is no thank-you page. Never fire `Lead`
  on a button click; that counts people who never submitted anything.
- `Schedule`, `Search`, `Subscribe`, `StartTrial`, `AddToCart`, `AddToWishlist`,
  `AddPaymentInfo`, `CustomizeProduct`, `Donate` — no corresponding action exists.

### The higher-value move

Ordering is handed off to Petpooja (`order.pinkpaprikaa.com` → 301 → Petpooja, see
`src/_redirects`). Real revenue events can only fire there. Getting pixel
`1339451664838482` onto the Petpooja ordering domain — so `Purchase` fires with true INR
value — is worth more than any event on this brochure site.

## Event Setup Tool — deliberately not used

Meta's point-and-click Event Setup Tool is **not** used, and should not be.

It cannot load this site in its frame. Note that this is **not** caused by a security
header: as of this writing the site sends no `X-Frame-Options` and no
`Content-Security-Policy` (only HSTS), and there is no `_headers`, `netlify.toml`,
`vercel.json`, `.htaccess`, `static.json`, or `firebase.json` in the repo. The likely cause
is the consent gate — the pixel never initialises for the tool, and `localStorage` is
partitioned inside a third-party iframe so consent could not persist there anyway.

Events are defined in code (or as URL-rule custom conversions) instead. **Do not weaken or
remove a security header to make this optional tool work.**

Related open item: because no `X-Frame-Options` / `frame-ancestors` is set, the site
currently has **no clickjacking protection**. Adding it is a one-line Netlify `_headers`
file. Undecided.

## No-code alternative

Meta custom conversions can log standard events from URL rules with no code:

| Event | Doable as a URL rule? |
|---|---|
| `ViewContent` on the menu | **yes** — URL contains `menu.html`. Preferred: no deploy, reversible in the UI |
| `Contact`, `FindLocation` | no — outbound clicks never change the URL, so Meta receives nothing to rule on |
| `InitiateCheckout` | only if the pixel were on the Petpooja ordering domain |

## How to verify

1. Load each of `/`, `/about.html`, `/menu.html`, `/contact.html`, `/policies.html`.
2. **View source** → search `1339451664838482`. Expect exactly **one** match per page.
3. **DevTools → Network**, filter `facebook`:
   - Before clicking Accept: **zero requests.** This is correct.
   - Click **Accept** → expect `connect.facebook.net/en_US/fbevents.js`, then
     `signals/config/1339451664838482`, then `facebook.com/tr?…&ev=PageView`.
   - Check the `ev=` value matches the event you expect.
4. **Meta Pixel Helper** shows nothing until you Accept. Not a fault.
5. **Events Manager → Datasets → Pink Paprikaa Website → Overview**, then break PageView
   down **by URL** to confirm each page reports. Only pages visited *after* an Accept will
   appear, so accept once and then visit all five yourself.

## Custom conversion to create in Events Manager

Not yet created. Events Manager → Custom Conversions → Create:

- Data source: **Pink Paprikaa Website** (`1339451664838482`)
- Rule: **URL contains** `menu.html`
- Event: `ViewContent`

## Open questions

- **Restore the `<noscript>` fallback?** Only meaningful if the gate is removed.
  Decision so far: keep it out.
- **Add clickjacking protection?** None exists today. One-line Netlify `_headers` file.
- **Pixel on the Petpooja ordering domain?** The single highest-value tracking change
  available — it is the only place a real `Purchase` with true INR value can fire.
  `InitiateCheckout` on this site is a click-intent proxy, not a confirmed order.

Settled: the consent gate stays (decided 2026-08-14).
