# Pink Paprikaa — Website Rebuild: Product Requirements

**Date:** 2026-08-07
**Status:** **Superseded (2026-09-27)** — by the design handoff in `zip-files/pink-paprikaa-handoff/` and [the design system rewrite spec](./2026-09-27-design-system-rewrite-design.md). Kept for history; its still-valid items are listed in §16 of that spec.
**Supersedes:** the five hand-written static pages in `src/`
**Next step:** implementation plan (writing-plans), then HLD/LLD

> **Scope note.** This document covers _what the site must do and contain_ — pages, sections,
> content, data, behaviour, constraints. **Visual design is out of scope**: colour, typography,
> spacing, and the component library are owned by the existing design system. Where a section
> below names an image, it is specifying _that an asset is required_, not how it should look.

---

## 1. Purpose

Rebuild `pinkpaprikaa.com` as a React application that does three jobs the current site cannot:

1. **Make the menu findable.** 207 real dishes with prices, categories and descriptions exist in
   `Sales & Menu Engineering/menu/parsed/new-offline-menu.csv`. The live site shows 16 photos with
   no prices and no text. Google cannot read a photograph, so the restaurant is invisible for every
   dish-level and category-level local search.
2. **Capture demand instead of only forwarding it.** The current site has zero forms. Every CTA
   pushes the visitor to Petpooja, WhatsApp or Reelo and captures nothing. The corporate and PG
   channel — which the Corporate-B2B project calls survival-critical — has no page, no form and no
   mention anywhere on the site.
3. **Sell the room nobody can see.** The road-facing stall hides the AC dine-in. That is a named
   active problem in the business context, and the website is the cheapest place to fix it.

### Non-goals

Ordering, payment, and delivery stay on Petpooja. This was tested, not assumed — see §11.

---

## 2. Decisions locked

| #   | Decision          | Chosen                                                                             | Rationale                                                                                                  |
| --- | ----------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| D1  | Menu prices shown | **Dine-in prices**, with a visible note that delivery platforms price differently  | Site's job is footfall, the weak channel. Dine-in ₹310 vs online ₹377 on the same thali.                   |
| D2  | Corporate / B2B   | **Dedicated `/corporate` page**, nav link, enquiry form                            | Survival-critical per Corporate-B2B project; currently absent. Gives field sales a link to send.           |
| D3  | Content updates   | **Typed JSON in the repo**, deployed by Rishav                                     | ₹0/month, git history, no vendor. Rishav is a frontend lead; editing JSON is trivial.                      |
| D4  | About page        | **Brand-led story, no individuals named**                                          | Conflict-of-interest — see §3.3.                                                                           |
| D5  | Form handling     | **WhatsApp prefill primary + form-service fallback** → `business@pinkpaprikaa.com` | Matches customer behaviour; still captures a structured record.                                            |
| D6  | Interior photos   | **Available** — the AC dine-in section is built on real photography                | Directly attacks the invisibility problem.                                                                 |
| D7  | Blog              | **In v1**                                                                          | Local SEO surface.                                                                                         |
| D8  | Gallery scope     | Food · Interiors · Catering · Events · Kitchen · Customer moments                  | All six approved.                                                                                          |
| D9  | Menu depth        | **Category pages** — `/menu` + 11 category routes                                  | 11 genuine ranking surfaces from data already owned. Item-level pages rejected as thin content.            |
| D10 | Brand posture     | **Confident neighbourhood, premium craft**                                         | Prices stay visible and value-led. A ₹400-café posture fights the ₹110 corporate thali on the same domain. |
| D11 | Virtual brands    | **Not surfaced.** Pink Paprikaa only                                               | The Urban Thali Co. and Chow Chow Chinese are delivery-only. Surfacing them dilutes the brand.             |

### Open decisions

| #   | Question                                                                | Owner  | Blocks                                                                                                                   |
| --- | ----------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| O1  | Blog on a subdomain (`blog.pinkpaprikaa.com`) or a route (`/blog`)      | Rishav | Nothing in v1 — build as `/blog`, keep the content layer portable so a subdomain move is a routing change, not a rewrite |
| O2  | Menu data sync — manual JSON export vs Petpooja API                     | Rishav | Post-launch. v1 ships a committed JSON generated once from the CSV                                                       |
| O3  | Hosting target — confirm whether the deploy publishes `src/` or `dist/` | Rishav | §10 build pipeline                                                                                                       |

---

## 3. Brand & content constraints

### 3.1 Positioning

> A pure-vegetarian neighbourhood restaurant in Sector 57 that cooks North Indian, Chinese and
> café food with more care than its price suggests — with an air-conditioned dining room most
> passers-by don't know exists.

Three claims, all defensible: **pure veg**, **AC dine-in**, **Sector 57**. Every page should make at
least one of them within the first screen.

**Do not** use unverifiable superlatives ("India's First…", "Best in Gurgaon"). They invite challenge
and Google treats them as noise.

### 3.2 Copy voice

Concrete and sensory. Name the dish, the ingredient, the time of day.

| Instead of                                              | Write                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| "Crafted with love, laughter, and a dash of Delhi soul" | "Dal Makhani that sits on the flame overnight"                |
| "A celebration of colours, aromas, and craft"           | "Sixteen kinds of momo. Four of them we invented."            |
| "Premium taste, pure veg"                               | "Pure veg since day one. No exceptions, no separate kitchen." |

Rules: short sentences; rupee amounts written plainly (₹310, not "starting at just ₹310/-"); no
exclamation marks in body copy; emoji only in CTAs where they aid scanning, never in headings.

### 3.3 Founder identity — hard constraint

**Rishav Pandey must not appear anywhere on this website as founder or owner.**

The Growth project direction (2026-06-15) states: _"Keep Rishav OUT as founder/owner — no name,
narrator voice, founder story."_ The reason is conflict-of-interest exposure from his full-time MNC
engineering role.

The current live `src/about.html` violates this. It reads: _"**Rishav Pandey**, a senior frontend
engineer with a knack for precision, and his friend **Anand**…"_ — on an indexed, canonical page.

**Required in v1:**

- No founder names anywhere in markup, alt text, meta tags, or structured data.
- No "from code to kitchen" framing or any software-engineering reference.
- Legal entity name (Paprikaa Culinary Ventures Private Limited) stays — that is a statutory
  disclosure, not a personal identity.
- A repo check so the names cannot silently return (§10.4).

### 3.4 Audience

| Segment           | Wants to know                        | Lands on                  |
| ----------------- | ------------------------------------ | ------------------------- |
| Youth 18–32       | Is it good, is it cheap, is there AC | `/`, `/menu/china-town`   |
| Families          | Pure veg, hygiene, can we sit        | `/`, `/about`, `/gallery` |
| PG / co-living    | Monthly plan cost                    | `/corporate`              |
| Corporate admin   | Per-thali price, Pluxee, capacity    | `/corporate`              |
| Delivery customer | What's on the menu, any offers       | `/menu`, `/offers`        |

---

## 4. Global elements

Behavioural requirements only. Appearance is the design system's call.

### 4.1 Header

- Sticky across all pages.
- Logo links home.
- Primary nav: **Menu · Corporate · Gallery · About · Contact**.
- Persistent **Order Now** action opening `order.pinkpaprikaa.com` in a new tab.
- Collapses to a toggle nav below the desktop breakpoint.

**No cart.** We do not take checkout — a cart that isn't a cart is a broken promise.
**No header search.** Search belongs on `/menu`, where there is something to search.

### 4.2 Offer strip

The "banners with active offers" requirement. A strip directly beneath the header.

- Renders **only** when `offers.json` has an entry active for today. Zero active offers → not in
  the DOM, no space reserved.
- One offer: static. Two or more: rotates on a timer, pauses on hover and focus, and does not
  animate at all under `prefers-reduced-motion`.
- Dismissible; dismissal persists in `localStorage` for 24h, keyed by a hash of the active offer
  set, so a **new** offer reappears even if the previous one was dismissed.
- Click target routes to `/offers`.

### 4.3 Footer

Four link groups:

| Group     | Links                                                                  |
| --------- | ---------------------------------------------------------------------- |
| EAT       | Full Menu · Thalis & Meals · Momos & Chinese · Chaat & Snacks · Offers |
| VISIT     | Hours · Directions · Gallery · Book a table (WhatsApp)                 |
| CORPORATE | Corporate lunch · PG meal plans · Bulk & party catering · Enquire      |
| COMPANY   | About · Blog · Policies · Contact                                      |

Plus: legal name, GSTIN `06AAPCP9130L1ZW`, FSSAI `10825005001702`, `business@pinkpaprikaa.com`,
address, phone, Instagram, and `© <year> Paprikaa Culinary Ventures Pvt Ltd`.

Year is computed at build time, not by a per-page inline script (the current site runs one in every
file).

### 4.4 Floating WhatsApp action

Persistent on every page, labelled for assistive tech. **The icon must be a local asset** — the
current site hot-links it from jsDelivr, making a third-party CDN a dependency of the primary
contact channel.

---

## 5. Page requirements

Ten routes. For each: what the page is for, what it must contain, and what it must drive.

---

### 5.1 `/` — Home

**Title:** Pink Paprikaa — Pure Veg Restaurant & AC Dine-In | Sector 57, Gurgaon
**Meta:** Pure-veg North Indian, Chinese, momos and café food in Sector 57 Gurgaon. AC dine-in,
takeaway and corporate catering.

| #   | Block                 | Must contain                                                                                      | Drives        |
| --- | --------------------- | ------------------------------------------------------------------------------------------------- | ------------- |
| 1   | Offer strip           | §4.2                                                                                              | `/offers`     |
| 2   | **Hero**              | What we are, where we are, in one screen. Trust row: Pure Veg · FSSAI · AC Dine-In · Sector 57    | Order / Menu  |
| 3   | **Active offers**     | 2–4 live offers with terms                                                                        | `/offers`     |
| 4   | **Most ordered**      | 6–8 dishes carrying the `bestseller` tag, with prices                                             | `/menu`       |
| 5   | **AC Dine-In Inside** | Plain statement that an air-conditioned room sits behind the counter; capacity; hours; directions | Footfall      |
| 6   | Explore the menu      | All 11 categories with live item counts                                                           | `/menu/[cat]` |
| 7   | Corporate teaser      | Silver ₹110 / Gold ₹150, Pluxee accepted                                                          | `/corporate`  |
| 8   | Paprikaa Rewards      | Four tiers (4% / 7% / 12% / 15%)                                                                  | Reelo signup  |
| 9   | Reviews               | Google 4.5★ (linked) + three testimonials                                                         | Trust         |
| 10  | Gallery teaser        | Six-image strip                                                                                   | `/gallery`    |
| 11  | Visit us              | Address, three service windows, lazy map                                                          | Directions    |

**Block 5 is the highest-value block on the site.** A first-time visitor standing at the stall does
not know a dining room exists. The copy must state the physical relationship plainly.

**Assets:** hero dish shot; one image per offer (optional); one per bestseller dish; **three
interior shots — wide room, seating detail, entrance from the road**; one per category; one catering
setup; six gallery images.

### 5.2 `/menu` — Menu hub

**Title:** Menu — 200+ Pure Veg Dishes with Prices | Pink Paprikaa, Gurgaon

| #   | Block              | Requirement                                                                                                                       |
| --- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero               | Dish and category counts rendered from data, never hard-coded                                                                     |
| 2   | **Price note**     | Persistent, not dismissible, placed above the first item: _"Dine-in prices. Swiggy, Zomato and delivery apps price differently."_ |
| 3   | **Filters**        | Sticky. Category chips (All + 11) · tag toggles `Bestseller` `Chef Special` `Spicy`                                               |
| 4   | **Search**         | Client-side over name + description. Debounced, min 2 characters. Empty-result state suggests categories                          |
| 5   | Category sections  | 11 sections: heading, item count, short intro, item grid, "See all →"                                                             |
| 6   | Pure-veg statement | One kitchen, no exceptions                                                                                                        |
| 7   | CTA                | Order · WhatsApp to reserve a table                                                                                               |

**Filter semantics:** additive within a group, intersecting across groups — `Bestseller` + `Spicy`
returns items that are both. State reflects into the URL query so a filtered view is shareable
(`?tag=bestseller&cat=china-town`).

**There is no veg/non-veg filter.** Everything is vegetarian; offering the filter implies otherwise.

### 5.3 `/menu/[category]` — 11 category pages

| Slug                   | Category                | Items | Search intent targeted                    |
| ---------------------- | ----------------------- | ----- | ----------------------------------------- |
| `thalis-and-meals`     | Paprikaa Meals & Thalis | 15    | "veg thali sector 57", "meal box gurgaon" |
| `chaat-and-snacks`     | Chaat & Snacks          | 20    | "chaat near me", "breakfast sector 57"    |
| `sandwiches-and-fries` | Sandwiches & Fries      | 8     | "sandwich gurgaon"                        |
| `china-town`           | China Town              | 78    | "momos sector 57", "chinese near me"      |
| `breads-and-rice`      | Aroma of Bread & Rice   | 15    | "naan", "biryani gurgaon"                 |
| `paprikaa-ki-rasoi`    | Paprikaa Ki Rasoi       | 30    | "paneer near me", "dal makhani"           |
| `accompaniments`       | Accompaniments          | 9     | support page                              |
| `tandoor`              | Tandoor-e-Paprikaa      | 6     | "tandoori starters gurgaon"               |
| `desserts`             | Desserts                | 4     | "dessert sector 57"                       |
| `beverages-and-cafe`   | Continental & Beverages | 18    | "cold coffee gurgaon", "shakes near me"   |
| `packaged-drinks`      | Beverages               | 4     | support page                              |

**Per page:** breadcrumb → heading + 2–3 sentence category intro (authored once, stored in
`menu.json`) → sub-category groups with items → three sibling categories → order CTA.

`china-town` carries 78 items across 9 sub-categories and needs in-page sub-navigation. It is also
the strongest SEO target on the site — momos are the highest-intent local query in this menu.

### 5.4 `/offers`

**Title:** Today's Offers & Deals | Pink Paprikaa, Sector 57 Gurgaon

Active offers → rewards tiers → how to redeem → CTA.

Each offer states: title, one-line terms, valid dates, applicable channel (dine-in / takeaway /
delivery / all), and time window where relevant.

**The empty state matters.** With no active offers the page falls back to the rewards programme and
a "check back" line. It must never show an expired offer — the current site's failure mode, where
`index.html` hard-codes "Live Now" offers into markup with no expiry.

Seed offers (migrated from current markup, dates to be supplied by Rishav): Lunch Happy Hour 2–4 PM
15% off thalis · Continental Happy Hour 4–7 PM 15% off pasta/sandwich/fries · Fries @ ₹99 with any
sandwich or pasta · Buy 1 coffee get 2nd 50% off · Buy 1 mocktail get 2nd 50% off · Desi meal bowls
from ₹139.

### 5.5 `/corporate`

**Title:** Corporate Lunch & Bulk Catering in Gurgaon | Pure Veg | Pink Paprikaa
**Highest revenue-per-visitor page on the site.**

| #   | Block                     | Must contain                                                                                                         |
| --- | ------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| 1   | Hero                      | "Pure-veg corporate lunch in Sector 57, from ₹110 a thali." Quote-on-WhatsApp + enquiry CTAs                         |
| 2   | Why us                    | Pure veg (no separate kitchen) · **Pluxee accepted** · FSSAI licensed · own kitchen, not a reseller · daily capacity |
| 3   | **Corporate thali plans** | Silver **₹110**, Gold **₹150** — contents, minimum order, delivery window                                            |
| 4   | **PG & individual plans** | Monthly subscription **₹3,000–3,500** — who it's for, what's included, billing                                       |
| 5   | Bulk & party catering     | Headcount range, notice period, custom menu                                                                          |
| 6   | How it works              | Four steps: enquire → menu & quote → trial meal → daily delivery                                                     |
| 7   | **Enquiry form**          | name · organisation · type (Corporate / PG / Event) · headcount · location · phone · preferred start · notes         |
| 8   | Proof                     | 4–6 catering setup photographs                                                                                       |
| 9   | FAQ                       | Pluxee, GST invoicing, notice period, trial meals, delivery radius, cancellation                                     |
| 10  | Closing CTA               | Phone + WhatsApp                                                                                                     |

Copy must be plain and commercial. This reader is an office admin comparing three vendors on price,
hygiene and reliability — not browsing for inspiration.

### 5.6 `/gallery`

Filters: **All · Food · AC Dine-In · Catering · Events · Kitchen · Moments**.

Lazy-loaded grid; opening an image gives keyboard navigation (←/→/Esc), a focus trap, and focus
restored to the trigger on close. **Every image carries descriptive alt text** — gallery alt text is
where most sites quietly fail accessibility.

`Kitchen` and `AC Dine-In` are the two filters doing business work: hygiene proof for families and
corporates, and the invisibility fix.

### 5.7 `/about`

**No individual is named.** See §3.3.

Story (kitchen and food, not people) → what we stand for (pure veg · cooked to order · in-house
masala · hygiene) → stats → milestones → kitchen & hygiene → CTA.

**Stats — real, verifiable numbers only:** `207 dishes on the menu` · `100% pure vegetarian, since
day one` · `2,500+ customers served` · `4.5★ on Google`

**Milestones** (from existing content, de-personalised):

| When         | What                                                 |
| ------------ | ---------------------------------------------------- |
| Dec 2024     | The idea, and the first experiments                  |
| Jan–Mar 2025 | An existing dhaba acquired and rebuilt               |
| Jun 2025     | Rebranded as Pink Paprikaa                           |
| Oct 2025     | Re-launch — stall, AC dine-in and corporate catering |

### 5.8 `/contact`

Contact actions (WhatsApp · call · email) → hours → map → feedback form → social.

**Hours** — three service windows, presented as a table because they genuinely differ:

| Kitchen               | Hours               |
| --------------------- | ------------------- |
| Chaat & Snacks        | 9:00 AM – 9:00 PM   |
| Indian Main Course    | 11:00 AM – 11:00 PM |
| Chinese & Continental | 5:00 PM – 11:00 PM  |

Map mounts only on scroll into view. The current site loads a Google Maps iframe eagerly, which is
one of the heaviest things on the page.

Table booking is a WhatsApp prefill, not a reservation system. At ₹200 average spend and one outlet,
a booking engine is over-built.

### 5.9 `/blog` and `/blog/[slug]`

Markdown with front-matter (`title`, `slug`, `date`, `excerpt`, `cover`, `tags`,
`author: "Pink Paprikaa"`). Index newest-first; post pages carry breadcrumbs, related posts, and an
order CTA.

**Launch with three posts or zero.** An empty blog linked from the footer is worse than no blog.

Starter topics, all local-intent: "Where to eat pure veg in Sector 57" · "Momos in Gurgaon: what
makes ours different" · "Planning a corporate lunch for 50 people".

Per O1, the content layer stays portable so a later move to `blog.pinkpaprikaa.com` is a routing
change.

### 5.10 `/policies`

Existing content, restructured: legal identity (name, GSTIN, FSSAI) → certificates → Privacy →
Refunds & Cancellations → Terms → grievance contact.

Substance is unchanged — this is a migration, not a legal rewrite. **`Last updated` must be a real
date driven by file mtime**, not a string someone forgets to change.

---

## 6. Data model

All content lives in typed JSON under `src/data/`, validated at build. A schema violation fails the
build rather than shipping a broken page.

### 6.1 `menu.json`

```ts
type Menu = {
  updatedAt: string; // ISO date
  priceNote: string;
  categories: Category[];
};

type Category = {
  slug: string; // 'china-town'
  name: string; // 'China Town'
  intro: string; // 2-3 sentences, SEO copy
  image: ImageRef;
  subCategories: SubCategory[];
};

type SubCategory = { name: string; items: MenuItem[] };

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number | null; // null only when variations carry all pricing
  variations?: { label: string; price: number }[]; // 'Half' | 'Full'
  tags: ("bestseller" | "chef-special" | "spicy")[];
  image?: ImageRef;
  available: boolean;
};
```

Source: `new-offline-menu.csv` (207 rows). `Highlight` maps to `tags`; the `Variation` column
(`H/F`) maps to `variations`, splitting the `155/ 195` price pattern. **This transform runs once
into a committed JSON — it is not a runtime dependency on the Sales project.**

### 6.2 `offers.json`

```ts
type Offer = {
  id: string;
  title: string;
  terms: string;
  validFrom: string; // ISO date
  validTo: string; // ISO date
  channels: ("dine-in" | "takeaway" | "delivery")[];
  timeWindow?: { from: string; to: string }; // '14:00' | '16:00'
  image?: ImageRef;
  featured: boolean; // eligible for the offer strip
};
```

Filtered by date at build **and** re-checked in the client, so a page cached mid-campaign cannot
show a lapsed offer.

### 6.3 `gallery.json`, `corporate.json`, `site.json`

```ts
type GalleryItem = {
  id: string;
  src: ImageRef;
  alt: string; // required — build fails if empty
  category: "food" | "dine-in" | "catering" | "events" | "kitchen" | "moments";
};

type ImageRef = { src: string; width: number; height: number; blurHash?: string };
```

`site.json` is the single source of truth for NAP data — legal name, address, phone, email, GSTIN,
FSSAI, hours, social URLs, Petpooja and Reelo links. Every page and all structured data read from
it. Today those strings are copy-pasted into five files; a phone-number change means five edits and
a near-certain miss.

---

## 7. SEO & structured data

### 7.1 JSON-LD

None exists today. All of it is new.

| Type                                | Where                     | Key fields                                                                                                                    |
| ----------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `Restaurant`                        | `/`                       | name, address, geo, telephone, `servesCuisine`, `priceRange: "₹₹"`, `openingHoursSpecification`, `aggregateRating`, `hasMenu` |
| `Menu` + `MenuSection` + `MenuItem` | `/menu`, `/menu/[cat]`    | name, description, `offers.price`, `priceCurrency: "INR"`, `suitableForDiet: VegetarianDiet`                                  |
| `LocalBusiness`                     | `/contact`                | NAP, hours, map                                                                                                               |
| `BreadcrumbList`                    | category, blog post       | trail                                                                                                                         |
| `FAQPage`                           | `/corporate`, `/policies` | Q&A pairs                                                                                                                     |
| `Article`                           | `/blog/[slug]`            | headline, datePublished, image                                                                                                |
| `Organization`                      | site-wide                 | legal name, logo, sameAs                                                                                                      |

`suitableForDiet: VegetarianDiet` on every item is worth calling out — it is a machine-readable
version of the single strongest differentiator, and no competitor in the area will have it.

### 7.2 Fixes carried in from the audit

| Problem today                                                              | Fix                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------- |
| `sitemap.xml` lists `offers.html` → 404                                    | `/offers` becomes real; sitemap generated from routes |
| `robots.txt` + `sitemap.xml` at repo root, never copied by `npm run build` | Generated into the deploy output                      |
| OG/Twitter images are Unsplash stock on all 5 pages                        | Owned OG images per page                              |
| `about.html` hero is a stock Unsplash kitchen                              | Real kitchen photography                              |
| `menu.html` references `main-menu-cover.png` — file does not exist         | Removed; asset references validated at build          |
| No canonical strategy beyond hard-coded tags                               | Canonicals derived from route                         |

### 7.3 Redirects

`src/_redirects` keeps the two Petpooja 301s. Add old-path redirects so existing rankings survive:

```
/index.html    /           301
/about.html    /about      301
/menu.html     /menu       301
/contact.html  /contact    301
/policies.html /policies   301
```

The pickup subdomain currently resolves correctly to `pinkpaprikaa.petpooja.com/menu/`.
`/orders/menu` returns HTTP 500 and must not be used anywhere.

---

## 8. Asset requirements

Existing assets: 25 PNGs totalling **43 MB**, individually 1.2–2.2 MB. The subjects are usable; the
files are not (§9). They need re-export, not re-shooting.

**New photography required:**

| Subject                                                        | Count | Needed for                             |
| -------------------------------------------------------------- | ----- | -------------------------------------- |
| AC dine-in — wide room, seating detail, entrance from the road | 3     | The invisibility fix (`/`, `/gallery`) |
| Kitchen at work                                                | 1–2   | Hygiene proof (`/about`, `/gallery`)   |
| Masala / prep detail                                           | 1     | `/about`                               |
| Catering setups                                                | 4–6   | `/corporate` proof                     |
| Category headers                                               | 11    | `/menu` category tiles                 |
| Hero dish                                                      | 1     | `/`                                    |

**Alt text is mandatory on every image.** The build fails on empty alt for gallery and dish images.

---

## 9. Performance & accessibility requirements

Enforced in CI. A build that exceeds these fails.

| Metric                   | Requirement | Today                                |
| ------------------------ | ----------- | ------------------------------------ |
| Any single image         | ≤ 200 KB    | up to 2.2 MB                         |
| Homepage total transfer  | ≤ 1.2 MB    | ~15 MB+                              |
| LCP (mobile, 4G)         | ≤ 2.5 s     | unmeasured, near-certainly failing   |
| CLS                      | ≤ 0.1       | offer strip and images are the risks |
| Lighthouse Performance   | ≥ 90        | failing                              |
| Lighthouse Accessibility | 100         | —                                    |

**Image pipeline:** source → AVIF + WebP + fallback, responsive `srcset`, explicit `width`/`height`
on every image to reserve space, lazy below the fold, high fetch priority on the hero only.

**Accessibility requirements:** keyboard-operable filters, gallery and accordions · visible focus
indication · `prefers-reduced-motion` respected by the offer strip and any motion · real `<label>`s
on form fields, not placeholder-as-label · skip-to-content link · logical heading order with exactly
one `h1` per page · WCAG 2.1 AA contrast on every pair (verify against the design system's tokens
before shipping — measure, don't eyeball).

Third-party assets currently hot-linked from jsDelivr (Instagram, WhatsApp icons) move local. The
Google Maps embed is lazy and behind an intersection observer.

---

## 10. Build & repo requirements

Detailed architecture belongs to the HLD. Recorded here only where the product depends on it.

1. **Shared chrome is a component.** Header, nav, footer and the WhatsApp action exist once. The
   current site copy-pastes ~170 lines into all five HTML files — the root cause of drift.
2. **`output.css` stops being committed.** It is a build artifact; today it is tracked and produces
   diff noise on every dev run.
3. **Content is validated at build.** Schema violation, missing alt text, broken internal link, or
   a referenced image that doesn't exist → build fails.
4. **Founder-name guard.** CI greps the built output for the founder names and fails if present.
   §3.3 is a business constraint, not a style preference, and it has already regressed once.
5. **`robots.txt` and `sitemap.xml` are generated** into the deploy output, not hand-maintained at
   the repo root.
6. **Delete `src/embed-test.html`** before launch — the Petpooja diagnostic from §11.

---

## 11. Ordering — why there is no iframe

Tested 2026-08-07, not assumed.

| URL                                     | HTTP        | `X-Frame-Options` | Result in a frame  |
| --------------------------------------- | ----------- | ----------------- | ------------------ |
| `pinkpaprikaa.petpooja.site/`           | 200         | `SAMEORIGIN`      | refused to connect |
| `pinkpaprikaa.petpooja.com/menu/`       | 200         | `SAMEORIGIN`      | refused to connect |
| `order.pinkpaprikaa.com/`               | 301→200     | `SAMEORIGIN`      | refused to connect |
| `pinkpaprikaa.petpooja.com/orders/menu` | 302→**500** | `SAMEORIGIN`      | refused to connect |

Petpooja sends `X-Frame-Options: SAMEORIGIN` on every response. The browser enforces it before any
of our code runs; no proxy, sandbox attribute or subdomain changes it. Only Petpooja can lift it by
allow-listing `pinkpaprikaa.com` via `frame-ancestors`.

Even if lifted, third-party cookie restrictions in Safari and Chrome would likely break cart and
session inside a cross-site frame — a working iframe would still be a broken checkout on iPhone.

**Every Order CTA is therefore a full-page navigation to `order.pinkpaprikaa.com` in a new tab.**

---

## 12. Delivery phasing

This document describes the whole site. It is deliberately larger than one implementation plan, so
the build is sequenced into three independently shippable phases, each with its own plan.

| Phase                        | Scope                                                                                                                                          | Ships when                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| **P1 — Foundation & parity** | Tooling, data layer, shared chrome, `/`, `/menu`, `/menu/[cat]`, `/about`, `/contact`, `/policies`, redirects, structured data, image pipeline | Replaces the current site with no regression and a real menu |
| **P2 — Demand capture**      | `/corporate` + enquiry form, `/offers` + offer strip, `/gallery`                                                                               | The revenue-facing surfaces                                  |
| **P3 — Content**             | `/blog` + first three posts, remaining schema, analytics review                                                                                | Once there is a posting cadence                              |

Only P1 must complete before cutover. P2 and P3 land incrementally on the live site.

**Ordering rationale:** `/menu` sits in P1 rather than P2 because it is both the largest SEO win and
the page most likely to surface data-model problems. Finding those in P1 is cheap; finding them in
P3 is not.

---

## 13. Out of scope for v1

Online payment or checkout · table reservation system · user accounts or login · multi-language ·
loyalty points UI (Reelo owns it) · franchise, careers, press, gift cards, private dining
(no substance behind them) · virtual brand pages (D11) · per-dish pages (D9) · live order tracking ·
push notifications · **visual design system** (owned separately).

---

## 14. Success criteria

| Goal               | Measure                                                  | Baseline                                                                                   |
| ------------------ | -------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Menu is findable   | `/menu/*` pages indexed and ranking for category queries | 0 indexed menu content                                                                     |
| Dine-in visibility | Direction requests in Google Business Profile Insights   | **capture the trailing-28-day figure before P1 cutover** — without it this is unmeasurable |
| B2B pipeline       | Corporate enquiries per month via form or WhatsApp       | 0 — no channel exists today                                                                |
| Page speed         | Mobile Lighthouse ≥ 90                                   | failing (43 MB of images)                                                                  |
| Content upkeep     | An offer change ships without touching markup            | markup edit + redeploy required                                                            |
| COI exposure       | Zero founder-name occurrences in production output       | currently present on `/about`                                                              |

The dine-in baseline is the only one that must be recorded **before** launch — every other row can
be measured retrospectively. Capturing it takes five minutes in Google Business Profile and it is
the difference between proving the AC dine-in section worked and guessing.
