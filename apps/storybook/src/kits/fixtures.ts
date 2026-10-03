import type {
  AccordionItem,
  CartLine,
  FooterColumn,
  MenuListItem,
  NavLink,
  ReviewCardProps,
  SelectOption,
  SlotOption,
  TrackerStep,
} from "@pink-paprikaa-web/ui";

import { brand } from "@pink-paprikaa-web/content";

/**
 * Reference-kit fixtures. Layouts and sample copy come from the design system's ui_kits; every
 * fact — year, address, hours, legal lines, contact, outlet — comes from @pink-paprikaa-web/content,
 * and the only reviews are the four verified Google reviews from the handoff (design/rates.js →
 * google.reviews). Nothing here is non-veg, not even egg.
 */

const [flagship] = brand.outlets;
if (flagship === undefined) {
  throw new Error("storybook: the brand facts list no outlet (packages/content)");
}

/** The outlet every specimen, kit and pattern names. */
export const OUTLET = flagship;

/** The year the legal lines print — read once when Storybook is built, as an app does at build. */
export const BUILD_YEAR = new Date().getFullYear();

/** Order steps from the design system's OrderTracker. */
export const ORDER_STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

/** Google Maps directions to the outlet — the handoff's links.directions. */
export const DIRECTIONS_URL = "https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon";

/**
 * The four verified Google reviews, as the guests wrote them — spelling and emoji included. Never
 * edit a review. One elision ("[…]") removes a guest's one-a spelling of the brand name, because
 * the two-a spelling is a hard rule in this repository; nothing else is changed.
 */
export const GOOGLE_REVIEWS: ReviewCardProps[] = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA" },
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" },
    quote: "Very nice and economical food or very tasty food as home",
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9" },
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8" },
    quote: "Had Honey chili potato and it was good 👍",
  },
];

/** The design system's sample dishes (ui_kits) — every one vegetarian, not even egg. */
export const MENU_ITEMS: MenuListItem[] = [
  {
    id: "paprikaa-chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
  },
  {
    id: "mushroom-keema-pav",
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
  },
  {
    id: "masala-cold-brew",
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    category: "Chai & Coffee",
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
  },
  {
    id: "kulhad-chai",
    name: "Kulhad Chai",
    price: 90,
    spice: 1,
    category: "Chai & Coffee",
    description: "Assam leaf, ginger, clay cup.",
  },
  {
    id: "bombay-toastie",
    name: "Bombay Toastie",
    price: 240,
    spice: 2,
    category: "All Day",
    description: "Green chutney, potato, amul butter, coal-grilled.",
  },
  {
    id: "tandoori-paneer-bowl",
    name: "Tandoori Paneer Bowl",
    price: 420,
    spice: 3,
    category: "All Day",
    description: "Charred paneer, burnt garlic rice, pickled slaw.",
  },
  {
    id: "gulkand-kulfi",
    name: "Gulkand Kulfi",
    price: 180,
    spice: 1,
    category: "Sweets",
    description: "Rose petal preserve, pistachio, saffron.",
  },
  {
    id: "masala-fries",
    name: "Masala Fries",
    price: 190,
    spice: 4,
    category: "Small Plates",
    description: "Masala fries, amchur, curry-leaf salt.",
  },
];

export const MENU_CATEGORIES = [...new Set(MENU_ITEMS.map((item) => item.category))];

const [featured] = MENU_ITEMS;
if (featured === undefined) throw new Error("kits: MENU_ITEMS is empty");

/** The dish the app kit opens first. */
export const FEATURED_DISH = featured;

export const SAMPLE_CART: CartLine[] = [
  {
    id: "paprikaa-chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 1,
    note: "Regular · Hot",
  },
  { id: "kulhad-chai", name: "Kulhad Chai", price: 90, quantity: 2, note: "Regular · Mild" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#story" },
  { label: "Outlets", href: "#outlets" },
  { label: "Franchise", href: "#franchise" },
  { label: "Careers", href: `mailto:${brand.contact.careersEmail}` },
];

const WHATSAPP_URL = `https://wa.me/${brand.contact.whatsapp.replace("+", "")}`;

/** The design system's footer columns, trimmed to links that exist, plus the real contact lines. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat",
    items: [
      { label: "Full Menu", href: "#menu" },
      { label: "Small Plates", href: "#menu" },
      { label: "Chai & Coffee", href: "#menu" },
      { label: "Sweets", href: "#menu" },
    ],
  },
  {
    heading: "Visit",
    items: [
      { label: "Outlets", href: "#outlets" },
      { label: "Book a Table", href: "#book" },
      { label: "Directions", href: DIRECTIONS_URL },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Our Story", href: "#story" },
      { label: "Franchise", href: `mailto:${brand.contact.franchiseEmail}` },
      { label: "Careers", href: `mailto:${brand.contact.careersEmail}` },
    ],
  },
  {
    heading: "Contact",
    items: [
      { label: brand.contact.phoneDisplay, href: `tel:${brand.contact.phone}` },
      { label: "WhatsApp", href: WHATSAPP_URL },
      { label: brand.contact.email, href: `mailto:${brand.contact.email}` },
    ],
  },
];

export const SOCIAL_LINKS = brand.social.map((profile) => ({
  network: profile.network,
  href: profile.url,
  label: profile.handle,
}));

/** Real answers only: the brand facts, and the handoff's catering FAQ on Jain food. */
export const FAQS: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: `Yes. ${brand.vegStatement} Nothing non-veg, not even egg.`,
  },
  { value: "hours", question: "When are you open?", answer: `${brand.hours.display}.` },
  { value: "where", question: "Where are you?", answer: `${OUTLET.address}.` },
  {
    value: "jain",
    question: "Can you make Jain or satvik food?",
    answer:
      "Yes. No onion, no garlic, and no root vegetables if you need. Tell us when you book, not on the day — it changes how we shop.",
  },
];

export const GUEST_OPTIONS: SelectOption[] = [
  { value: "2", label: "2 guests" },
  { value: "3", label: "3 guests" },
  { value: "4", label: "4 guests" },
  { value: "6", label: "6 guests" },
];

export const BOOKING_SLOTS: SlotOption[] = [
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9:00pm", label: "9:00pm", isDisabled: true },
];
