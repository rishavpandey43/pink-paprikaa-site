/**
 * Company facts — one source of truth for every footer, legal line, contact block and structured
 * datum. Parsed once at the boundary (`brand.ts`). Facts the owner has not supplied are `null`.
 *
 * Source: the design system's brand.js, with: established 2025 (owner, 2026-09-27); the public
 * address reconciled with the handoff ("HSVP Market (MKM Market)"); TODO placeholders → null.
 * The registered address is the statutory text and is kept verbatim.
 */
export const rawBrand = {
  name: "Pink Paprikaa",
  nameDevanagari: "पैप्रिका",
  tagline: "India's First Desi Urban Café",
  statement: "Desi at heart. Urban by nature.",
  vegStatement: "100% vegetarian kitchen.",
  established: 2025,
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
    { network: "instagram", handle: "@pinkpaprikaa", url: "https://instagram.com/pinkpaprikaa" },
    { network: "youtube", handle: "Pink Paprikaa", url: "https://youtube.com/@pinkpaprikaa" },
    {
      network: "linkedin",
      handle: "Pink Paprikaa",
      url: "https://linkedin.com/company/pinkpaprikaa",
    },
  ],
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
      mapsUrl: null,
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
