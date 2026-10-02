import type { ReviewCardProps } from "../molecules/review-card/review-card";

/**
 * Real copy for the organism stories: brand facts from
 * `zip-files/Pink Paprikaa Design System/brand.js` (spec C3/C6 applied) and handoff copy from
 * `zip-files/pink-paprikaa-handoff/design/rates.js`.
 *
 * Stories only. No component reads this file — the system carries no content (spec D9); the web
 * app binds the same facts from `@pink-paprikaa-web/content`. Internal links are `#` anchors, so
 * clicking one in a story never navigates the preview away.
 */
export const BRAND = {
  copyright: "© 2026 Paprikaa Culinary Ventures Private Limited",
  fssai: "FSSAI Lic. 10825005001702",
  gstin: "GSTIN 06AAPCP9130L1ZW",
  phoneDisplay: "+91 90907 04001",
  phoneHref: "tel:+919090704001",
  whatsappHref: "https://wa.me/919090704001",
  email: "business@pinkpaprikaa.com",
  emailHref: "mailto:business@pinkpaprikaa.com",
  website: "pinkpaprikaa.com",
  address: "Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003",
  hours: "8am – 11:30pm, every day",
  payments: "UPI, cards, Pluxee (Sodexo)",
  orderOnlineHref: "https://order.pinkpaprikaa.com",
  directionsHref: "https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon",
  instagramHandle: "@pinkpaprikaa",
  instagramHref: "https://instagram.com/pinkpaprikaa",
  youtubeHref: "https://youtube.com/@pinkpaprikaa",
  linkedinHref: "https://linkedin.com/company/pinkpaprikaa",
} as const;

/**
 * The four verified Google reviews (rates.js → google.reviews). Quotes are verbatim, the guests'
 * own spelling included — a review is never edited. One elision ("[…]") removes a guest's one-a
 * spelling of the brand name (ruling R17, the same text as Plan 5's `fixtures.ts`).
 */
export const GOOGLE_REVIEWS: ReviewCardProps[] = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA" },
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    quote: "Very nice and economical food or very tasty food as home",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" },
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9" },
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    quote: "Had Honey chili potato and it was good 👍",
    isVerified: true,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8" },
  },
];

/** Storybook viewport globals for the review widths (keys from `apps/storybook/.storybook/preview.tsx`). */
export const VIEWPORT_360 = { viewport: { value: "floor360", isRotated: false } };
export const VIEWPORT_768 = { viewport: { value: "md", isRotated: false } };
export const VIEWPORT_1024 = { viewport: { value: "lg", isRotated: false } };
export const VIEWPORT_1280 = { viewport: { value: "xl", isRotated: false } };
