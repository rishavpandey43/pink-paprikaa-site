/**
 * Company facts — one source of truth for every footer, legal line, contact block and structured
 * datum. Parsed once at the boundary (`brand.ts`). Facts the owner has not supplied are `null`.
 *
 * Source: the design system's brand.js, with: established 2025 (owner, 2026-09-27); the public
 * address reconciled with the handoff ("HSVP Market (MKM Market)"); TODO placeholders → null.
 * Social is Instagram only (R140). The registered address is the statutory text and is kept verbatim.
 */
export const rawBrand = {
  name: "Pink Paprikaa",
  nameDevanagari: "पैप्रिका",
  tagline: "India's First Desi Urban Café",
  statement: "Desi at heart. Urban by nature.",
  vegStatement: "100% vegetarian kitchen.",
  established: 2025,
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
  social: [
    {
      network: "instagram" as const,
      handle: "@thepinkpaprikaa",
      url: "https://www.instagram.com/thepinkpaprikaa/",
    },
  ],
  ordering: {
    website: { label: "Order Online", url: "https://order.pinkpaprikaa.com/" },
    swiggy: {
      label: "Swiggy",
      url: "https://www.swiggy.com/menu/1234520?source=sharing",
    },
    zomato: { label: "Zomato", url: "https://zomato.onelink.me/xqzv/scvd80ce" },
  },
  reviews: {
    google: {
      rating: 4.3,
      count: 98,
      label: "Google reviews",
      url: "https://maps.app.goo.gl/y8xr1QtSW1kfQKwD7?g_st=ic",
    },
  },
  hours: {
    weekday: "8am – 11:30pm",
    weekend: "8am – 11:30pm",
    display: "8am – 11:30pm, every day",
  },
  outlets: [
    {
      id: "sector-57",
      city: "Gurgaon",
      name: "Sector 57",
      address: "Booth No. 67P, HSVP Market (MKM Market), Sector 57, Gurgaon 122003",
      hours: null,
      phone: "+919090704001",
      mapsUrl: "https://maps.app.goo.gl/y8xr1QtSW1kfQKwD7?g_st=ic",
    },
  ],
  billing: {
    gstRate: 0.05,
    gstSplit: { cgst: 0.025, sgst: 0.025 },
    currency: "INR",
    currencySymbol: "₹",
    taxNote: "Inclusive of all taxes.",
    invoicePrefix: "PPK",
    bankName: null,
    accountName: "Paprikaa Culinary Ventures Private Limited",
    accountNumber: null,
    ifsc: null,
    upi: null,
  },
  policies: ["Privacy", "Terms", "Refunds"],
} as const;
