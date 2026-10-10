import type { Brand } from "./brand-schema.js";

export interface BrandLines {
  copyright: string;
  fssai: string;
  gstin: string;
  cin: string;
  cities: string;
  contactShort: string;
  footerPolicies: string[];
  /** e.g. "4.3 · 98 Google reviews" — one value for every rating line. */
  googleRating: string;
  /** e.g. "Est. 2025". */
  est: string;
}

/** Derived legal/contact strings. The caller passes the year (build time), so output is deterministic. */
export function toBrandLines(brand: Brand, year: number): BrandLines {
  if (!Number.isInteger(year)) {
    throw new RangeError(`toBrandLines: year must be a whole number, got ${String(year)}`);
  }
  const fssai = `FSSAI Lic. ${brand.legal.fssai}`;
  const { rating, count, label } = brand.reviews.google;
  return {
    copyright: `© ${String(year)} ${brand.legal.entity}`,
    fssai,
    gstin: `GSTIN ${brand.legal.gstin}`,
    cin: `CIN ${brand.legal.cin}`,
    cities: [...new Set(brand.outlets.map((outlet) => outlet.city))].join(" · "),
    contactShort: `${brand.contact.website} · ${brand.contact.phoneDisplay}`,
    footerPolicies: [...brand.policies, fssai],
    googleRating: `${String(rating)} · ${String(count)} ${label}`,
    est: `Est. ${String(brand.established)}`,
  };
}
