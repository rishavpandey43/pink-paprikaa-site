# Brand facts & assets

## brand.js — single source of truth

Every footer, contact block, legal line, invoice and ordering link reads from this object. Port it as `src/brand.js` (the ES-module twin is `tokens/brand.module.js` — keep the two identical). Never retype a phone number, GSTIN or URL in a component.

**Fields still `TODO` (need real values from the company):** `hours`, `bankName`, `accountNumber`, `ifsc`, `upi`. Opening hours per outlet and guest reviews are also placeholders.

```js
/**
 * Pink Paprikaa — company facts. ONE source of truth.
 * Every footer, invoice, receipt, contact block, legal line and marketing
 * signature reads from here. Never retype a phone number or GSTIN in a design.
 *
 * Legal, tax and contact details are CONFIRMED. Remaining TODOs are
 * per-outlet numbers and bank details — replace once, everything updates.
 * Works as an ES module (import) and as a plain <script> (window.PP_BRAND).
 */
const PP_BRAND = {
  name: "Pink Paprikaa",
  nameDevanagari: "पैप्रिका",
  tagline: "India's First Desi Urban Café",
  statement: "Desi at heart. Urban by nature.",
  vegStatement: "100% vegetarian kitchen.",
  est: 2025,
  about: "Opened in 2025.",

  legal: {
    entity: "Paprikaa Culinary Ventures Private Limited",
    cin: "U56101HR2025PTC133469",
    gstin: "06AAPCP9130L1ZW",
    fssai: "10825005001702",
    pan: "AAPCP9130L",
    registeredAddress: "Booth No. 67P, Sector 57, HSVP Market, Gurgaon 122003, Haryana, India",
  },

  contact: {
    website: "pinkpaprikaa.com",
    websiteUrl: "https://pinkpaprikaa.com",
    phone: "+919090704001",
    phoneDisplay: "+91 90907 04001",
    whatsapp: "+919090704001",
    email: "business@pinkpaprikaa.com",
    ordersEmail: "business@pinkpaprikaa.com",
    franchiseEmail: "business@pinkpaprikaa.com",
    careersEmail: "business@pinkpaprikaa.com",
  },

  social: {
    instagram: { handle: "@thepinkpaprikaa", url: "https://www.instagram.com/thepinkpaprikaa/", icon: "instagram" },
  },

  ordering: {
    website: { label: "Order Online", url: "https://order.pinkpaprikaa.com/" },
    swiggy: { label: "Swiggy", url: "https://www.swiggy.com/menu/1234520?source=sharing" },
    zomato: { label: "Zomato", url: "https://zomato.onelink.me/xqzv/scvd80ce" },
  },

  reviews: {
    google: { rating: 4.3, count: 98, label: "Google reviews", url: "https://maps.app.goo.gl/y8xr1QtSW1kfQKwD7?g_st=ic" },
  },

  hours: { weekday: "8am – 11:30pm", weekend: "8am – 11:30pm", display: "8am – 11:30pm, every day" },

  outlets: [
    { id: "sector-57", city: "Gurgaon", name: "Sector 57", address: "Booth No. 67P, HSVP Market, Sector 57, Gurgaon 122003", hours: "TODO", phone: "+919090704001", maps: "https://maps.app.goo.gl/y8xr1QtSW1kfQKwD7?g_st=ic" },
  ],

  billing: {
    gstRate: 0.05,          // 5% on restaurant service
    gstSplit: { cgst: 0.025, sgst: 0.025 },
    currency: "INR",
    currencySymbol: "₹",
    taxNote: "Inclusive of all taxes.",
    invoicePrefix: "PPK",
    bankName: "TODO",
    accountName: "Paprikaa Culinary Ventures Private Limited",
    accountNumber: "TODO",
    ifsc: "TODO",
    upi: "TODO@upi",
  },

  policies: ["Privacy", "Terms", "Refunds"],
};

// Derived strings — use these rather than concatenating by hand.
PP_BRAND.lines = {
  copyright: "© " + new Date().getFullYear() + " " + PP_BRAND.legal.entity,
  fssai: "FSSAI Lic. " + PP_BRAND.legal.fssai,
  gstin: "GSTIN " + PP_BRAND.legal.gstin,
  cin: "CIN " + PP_BRAND.legal.cin,
  outletsCount: "One kitchen in Sector 57, Gurgaon",
  cities: Array.from(new Set(PP_BRAND.outlets.map((o) => o.city))).join(" · "),
  footerPolicies: [...PP_BRAND.policies, "FSSAI Lic. " + PP_BRAND.legal.fssai],
  contactShort: PP_BRAND.contact.website + " · " + PP_BRAND.contact.phoneDisplay,
  googleRating: PP_BRAND.reviews.google.rating + " · " + PP_BRAND.reviews.google.count + " Google reviews",
  est: "Est. " + PP_BRAND.est,
};

if (typeof window !== "undefined") window.PP_BRAND = PP_BRAND;
if (typeof module !== "undefined" && module.exports) module.exports = { PP_BRAND };
```

## Assets — `assets/` (copy to `public/assets/`)

All SVG, tightly cropped, transparent except `badge`. Always place through the `Logo` / `LogoLockup` components.

| File | Use |
|---|---|
| `logo-lockup-pink.svg` | **The official logo** (tagline included) on white/light |
| `logo-lockup-white.svg` | Official logo on pink, ink or photography |
| `logo-lockup-badge.svg` | Logo on a pink plate — social headers, covers |
| `logo-wordmark-pink.svg` | Wordmark only — units under ~120px wide |
| `logo-wordmark-white.svg` | Wordmark only on pink/ink |
| `logo-wordmark-badge.svg` | Wordmark on a pink plate |
| `symbol-pink.svg` | Diamond mark on light, 1:1 |
| `symbol-white.svg` | Mark on pink/ink; pattern tile; inside every small diamond (StatusDot, Rating, SpiceLevel, StepTracker, Menu selected row) |
| `symbol-badge.svg` | Mark on pink plate — app icon, favicon, avatar |

**Logo rules:** clear space = height of the "P"; lockup min width 200px, wordmark min 140px; never recolour, outline, rotate, add effects, or retype the tagline in live type.

**Brand-mark-in-diamond treatment (B):** rotated square, mark upright inside. White mark at 35–62% opacity on coloured fills depending on size (smaller = stronger: <14px 0.80–0.85, 14–20px 0.62–0.66, ≥20px 0.50); pink mark at 45–55% on empty `--ink-200` fills. Mark scale 86% / 80% / 74% of the diamond for the same size bands. Reference: `components/atoms/StatusDot.jsx`.

## Fonts
Poppins (display, headings, buttons, overlines; carries Devanagari), DM Sans (body, UI, labels), Space Mono (order codes, promo codes, receipt lines). Loaded from Google Fonts in `tokens/fonts.css`. To self-host: `npm i @fontsource/poppins @fontsource/dm-sans @fontsource/space-mono` and drop the `@import`s. **No substitutions.**

## Icons
Lucide (`lucide-static@0.408.0`, fetched by name in `components/atoms/Icon.jsx`). In production: `npm i lucide-react` and make `Icon` render `lucide-react` by kebab-case name, keeping the same props (`name`, `size` xs 14 / sm 16 / md 20 / lg 24 / xl 32, stroke 2 at ≤16px else 1.75, `currentColor`). Or keep the fetch and set `window.__ppIconUrl = (n) => "/icons/" + n + ".svg"` for self-hosted files.

## Original brand files
`uploads/` holds the client-supplied PNG/SVG masters (reference only — never ship).
