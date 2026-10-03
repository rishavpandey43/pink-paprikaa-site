const ds = (name) => ({ url: `http://127.0.0.1:5050/components/molecules/${name}.card.html`, label: `${name}.card` });
const ho = (page, extra = {}) => ({ url: `http://127.0.0.1:5051/${page}.dc.html`, label: `${page}${extra.from ? ` [${extra.from}]` : ""}`, ...extra });
const ids = (title, ...names) => names.map((n) => `molecules-${title}--${n}`);

export const JOBS = {
  "menu-item-row": { sources: [ds("MenuItemRow")], stories: ids("menuitemrow", "full", "discount", "devanagari", "minimal") },
  "menu-item-card": { sources: [ds("MenuItemCard")], stories: ids("menuitemcard", "variants") },
  "outlet-card": { sources: [ds("OutletCard")], stories: ids("outletcard", "with-image", "without-image") },
  "review-card": {
    sources: [ds("ReviewCard"), ho("GoogleReviews")],
    stories: ids("reviewcard", "default", "brand", "symbol-mark", "google-review"),
  },
  "loyalty-card": { sources: [ds("LoyaltyCard")], stories: ids("loyaltycard", "in-progress", "one-left", "complete", "brand") },
  "filter-bar": { sources: [ds("FilterBar")], stories: ids("filterbar", "wrap", "scroll", "icons") },
  "logo-lockup": { sources: [ds("LogoLockup")], stories: ids("logolockup", "pink", "white", "centred", "wordmark") },
  "offer-seal": {
    sources: [ds("OfferSeal"), ho("Home", { from: "Pure veg homely meals" })],
    stories: ids("offerseal", "tones", "values", "handoff-hero", "bleed-off-corner"),
  },
  "coupon-ticket": { sources: [ds("CouponTicket")], stories: ids("couponticket", "brand", "light", "on-pink-artwork") },
  "choice-card-group": {
    sources: [
      ho("PlanCalculator", { from: "1. Your plate", to: "2. Which meals" }),
      ho("PlanCalculator", { from: "3. How many meals", to: "4. People at one address" }),
      ho("DawatCalculator", { from: "2. Dawat", to: "3." }),
      ho("DawatCalculator", { from: "7. How you want it served", extra: 0 }),
      ho("DawatCalculator", { from: "No platter", to: "Paneer Momos Platter", extra: 110 }),
      ho("Home", { from: "Taste it first.", to: "Build your plan" }),
      ho("HomelyMeals", { from: "30 seconds to decide.", to: "Plate by plate, side by side." }),
    ],
    stories: ids("choicecardgroup", "plates", "plan-lengths", "dawats", "platters", "service", "service-at-360", "trial-on-brand", "decide-list"),
  },
  "check-card": {
    sources: [
      ho("PlanCalculator", { from: "3. How many meals", to: "4. People at one address" }),
      ho("PlanCalculator", { from: "5. Make it yours", to: "6. Standing add-ons" }),
    ], stories: ids("checkcard", "upfront", "no-onion-garlic", "disabled", "disabled-checked") },
  "chip-group": {
    sources: [
      ho("PlanCalculator", { from: "2. Which meals", to: "3. How many meals" }),
      ho("PlanCalculator", { from: "5. Make it yours", to: "6. Standing add-ons" }),
      ho("PlanCalculator", { from: "6. Standing add-ons", extra: 0 }),
      ho("DawatCalculator", { from: "No starters", to: "No platter" }),
      ho("HomelyMeals", { from: "The full price list.", to: "Live together? Eat for less." }),
      ho("OfficeLunch", { from: "See your monthly bill now.", to: "One drop at your lunch hour" }),
    ],
    stories: ids("chipgroup", "which-meals", "make-it-yours", "standing-add-ons", "starter-picks", "segmented", "on-ink"),
  },
  "key-value-list": {
    sources: [
      ho("PlanCalculator"),
      ho("Catering", { from: "Everything one guest eats, in one price.", to: "If you order, the tasting is free." }),
      ho("Catering", { from: "Three steps and it", to: "Guests always ask who cooked it." }),
      ho("HomelyMeals", { from: "Free changes, 3", to: "Earn more with every friend." }),
      ho("DawatCalculator"),
    ],
    stories: ids("keyvaluelist", "your-box", "booking-rules", "customisations", "upgrade-prices", "quote-lines"),
  },
  steps: {
    sources: [
      ho("Home", { from: "How it works", to: "Gurgaon eats with us every day." }),
      ho("Catering", { from: "Three steps and it", to: "Guests always ask who cooked it." }),
      ho("HomelyMeals", { from: "Starting takes one message.", to: "People who stopped cooking." }),
    ],
    stories: ids("steps", "how-it-works", "how-to-book", "starting-takes-one-message"),
  },
  "feature-item": {
    sources: [
      ho("Catering", { from: "Why people call us back.", to: "Everything one guest eats, in one price." }),
      ho("OfficeLunch", { from: "Simple choice. Same price every day.", to: "See your monthly bill now." }),
      ho("HomelyMeals", { from: "A restaurant kitchen, on a tiffin budget.", to: "30 seconds to decide." }),
    ],
    stories: ids("featureitem", "why-us", "office-perks", "what-you-get"),
  },
  "pricing-card": {
    sources: [
      ho("Home", { from: "Three plates. Pick yours.", to: "Taste it first." }),
      ho("HomelyMeals", { from: "You pay per meal.", to: "The full price list." }),
      ho("Catering", { from: "Everything one guest eats, in one price.", to: "If you order, the tasting is free." }),
      ho("OfficeLunch", { from: "Simple choice. Same price every day.", to: "See your monthly bill now." }),
    ],
    stories: ids("pricingcard", "home-plates", "homely-plates", "catering-dawats", "office-plates", "long-name"),
  },
  "link-card": {
    sources: [
      ho("Home", { from: "Start a trial, ₹650", to: "Three plates. Pick yours." }),
      ho("About", { from: "The kitchen and the team.", to: "This week’s menu" }),
    ],
    stories: ids("linkcard", "home-doors", "about-ctas"),
  },
  "sticky-action-bar": {
    sources: [ho("PlanCalculator", { widths: [360] }), ho("DawatCalculator", { widths: [360] })],
    stories: ids("stickyactionbar", "plan-calculator", "dawat-calculator"),
  },
  "announcement-bar": { sources: [ho("PPHeader")], stories: ids("announcementbar", "launch-price", "expired") },
  table: {
    sources: [
      ho("HomelyMeals", { from: "The full price list.", to: "Live together? Eat for less." }),
      ho("HomelyMeals", { from: "Plate by plate, side by side.", to: "Build it. See your box. Send it." }),
      ho("HomelyMeals", { from: "Live together? Eat for less.", to: "A restaurant kitchen, on a tiffin budget." }),
      ho("HomelyMeals", { from: "Decide once, for the whole month.", to: "Free changes, 3" }),
      ho("Catering", { from: "Feeding thirty people?", to: "Why people call us back." }),
    ],
    stories: ids("table", "price-list", "scrolls-at-360", "box-compare", "offers", "plan-vs-app", "catering-glance"),
  },
};
