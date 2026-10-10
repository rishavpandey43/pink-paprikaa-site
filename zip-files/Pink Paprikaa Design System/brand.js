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
