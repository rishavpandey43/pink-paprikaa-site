### Task 4: Brand facts in `packages/content`

**Files:**

- Delete: `packages/content/src/lib/content.ts`, `packages/content/src/lib/content.spec.ts`
- Create: `packages/content/src/brand/{brand-schema.ts,brand-data.ts,brand.ts,brand-lines.ts,brand.spec.ts,brand-lines.spec.ts}`
- Replace: `packages/content/src/index.ts`
- Modify: `packages/content/package.json` (zod via `pnpm add zod --filter @pink-paprikaa-web/content`)

**Interfaces:**

- Produces from `@pink-paprikaa-web/content`: `brand: Brand`, `brandSchema`, type `Brand`, type `SocialNetwork = "instagram" | "youtube" | "linkedin"`, `toBrandLines(brand: Brand, year: number): BrandLines` with `BrandLines = { copyright, fssai, gstin, cin, cities, contactShort: string; footerPolicies: string[] }`.

- [ ] **Step 1: Install Zod (verify the version pnpm resolves is 4.x)**

Run: `pnpm add zod --filter @pink-paprikaa-web/content && node -p "require('./packages/content/node_modules/zod/package.json').version"`
Expected: `4.x`.

- [ ] **Step 2: Write the failing tests**

`packages/content/src/brand/brand.spec.ts`:

```ts
import { brand } from "./brand.js";
import { rawBrand } from "./brand-data.js";
import { brandSchema } from "./brand-schema.js";

const withChange = (change: (draft: Record<string, unknown>) => void): unknown => {
  const draft = structuredClone(rawBrand) as unknown as Record<string, unknown>;
  change(draft);
  return draft;
};

describe("brand", () => {
  it("parses the committed brand facts", () => {
    expect(brand.name).toBe("Pink Paprikaa");
    expect(brand.established).toBe(2025);
    expect(brand.vegStatement).toBe("100% vegetarian kitchen.");
  });

  it("never names a founder, anywhere in the facts", () => {
    expect(JSON.stringify(brand)).not.toMatch(/rishav|pandey|anand/i);
  });

  it("models facts the owner has not supplied as null, never as a TODO string", () => {
    expect(JSON.stringify(brand)).not.toMatch(/TODO/);
    expect(brand.outlets[0]?.hours).toBeNull();
    expect(brand.billing.bankName).toBeNull();
  });
});

describe("brandSchema", () => {
  it("rejects the brand name with one 'a'", () => {
    expect(brandSchema.safeParse(withChange((d) => (d.name = "Pink Paprika"))).success).toBe(false);
  });

  it("rejects a GSTIN that is not 15 characters of the right shape", () => {
    const bad = withChange((d) => ((d.legal as Record<string, unknown>).gstin = "06AAPCP9130L1Z"));
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an FSSAI licence that is not 14 digits", () => {
    const bad = withChange((d) => ((d.legal as Record<string, unknown>).fssai = "1082500500170"));
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a phone number that is not +91 and ten digits", () => {
    const bad = withChange((d) => ((d.contact as Record<string, unknown>).phone = "9090704001"));
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a GST split that does not add up to the GST rate", () => {
    const bad = withChange((d) => {
      const billing = d.billing as { gstSplit: { cgst: number } };
      billing.gstSplit.cgst = 0.05;
    });
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an unknown social network", () => {
    const bad = withChange((d) => {
      (d.social as { network: string }[])[0]!.network = "facebook";
    });
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });
});
```

`packages/content/src/brand/brand-lines.spec.ts`:

```ts
import { brand } from "./brand.js";
import { toBrandLines } from "./brand-lines.js";

describe("toBrandLines", () => {
  const lines = toBrandLines(brand, 2026);

  it("prints the copyright with the year it is given and the legal entity", () => {
    expect(lines.copyright).toBe("© 2026 Paprikaa Culinary Ventures Private Limited");
  });

  it("prints the statutory licence lines", () => {
    expect(lines.fssai).toBe("FSSAI Lic. 10825005001702");
    expect(lines.gstin).toBe("GSTIN 06AAPCP9130L1ZW");
    expect(lines.cin).toBe("CIN U56101HR2025PTC133469");
  });

  it("joins the outlet cities and the short contact line", () => {
    expect(lines.cities).toBe("Gurgaon");
    expect(lines.contactShort).toBe("pinkpaprikaa.com · +91 90907 04001");
  });

  it("lists the policies and ends with the FSSAI line", () => {
    expect(lines.footerPolicies).toEqual([
      "Privacy",
      "Terms",
      "Refunds",
      "FSSAI Lic. 10825005001702",
    ]);
  });

  it("rejects a year that is not a whole number", () => {
    expect(() => toBrandLines(brand, 2026.5)).toThrow(RangeError);
  });
});
```

- [ ] **Step 3: Run to verify they fail**

Run: `pnpm nx test @pink-paprikaa-web/content --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — modules not found.

- [ ] **Step 4: Implement**

`packages/content/src/brand/brand-schema.ts`:

```ts
import { z } from "zod";

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[\dA-Z]$/;
const FSSAI = /^\d{14}$/;
const CIN = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
const PAN = /^[A-Z]{5}\d{4}[A-Z]$/;
const INDIAN_PHONE = /^\+91\d{10}$/;

const text = z.string().min(1);
/** A fact the owner has not supplied yet: null until they do (spec C16). */
const pending = text.nullable();

export const socialNetworkSchema = z.enum(["instagram", "youtube", "linkedin"]);
export type SocialNetwork = z.infer<typeof socialNetworkSchema>;

export const brandSchema = z.object({
  name: z.literal("Pink Paprikaa"),
  nameDevanagari: text,
  tagline: text,
  statement: text,
  vegStatement: text,
  established: z.number().int().min(2025),
  legal: z.object({
    entity: z.literal("Paprikaa Culinary Ventures Private Limited"),
    cin: z.string().regex(CIN),
    gstin: z.string().regex(GSTIN),
    fssai: z.string().regex(FSSAI),
    pan: z.string().regex(PAN),
    registeredAddress: text,
  }),
  contact: z.object({
    website: text,
    websiteUrl: z.url(),
    phone: z.string().regex(INDIAN_PHONE),
    phoneDisplay: text,
    whatsapp: z.string().regex(INDIAN_PHONE),
    email: z.email(),
    ordersEmail: z.email(),
    franchiseEmail: z.email(),
    careersEmail: z.email(),
  }),
  social: z.array(z.object({ network: socialNetworkSchema, handle: text, url: z.url() })).min(1),
  hours: z.object({ weekday: text, weekend: text, display: text }),
  outlets: z
    .array(
      z.object({
        id: text,
        city: text,
        name: text,
        address: text,
        hours: pending,
        phone: z.string().regex(INDIAN_PHONE),
        mapsUrl: z.url().nullable(),
      })
    )
    .min(1),
  billing: z
    .object({
      gstRate: z.number().min(0).max(1),
      gstSplit: z.object({ cgst: z.number().min(0), sgst: z.number().min(0) }),
      currency: z.literal("INR"),
      currencySymbol: z.literal("₹"),
      taxNote: text,
      invoicePrefix: text,
      bankName: pending,
      accountName: text,
      accountNumber: pending,
      ifsc: pending,
      upi: pending,
    })
    .refine(
      (billing) => Math.abs(billing.gstSplit.cgst + billing.gstSplit.sgst - billing.gstRate) < 1e-9,
      {
        message: "gstSplit must add up to gstRate",
      }
    ),
  policies: z.array(z.enum(["Privacy", "Terms", "Refunds"])).min(1),
});

export type Brand = z.infer<typeof brandSchema>;
```

`packages/content/src/brand/brand-data.ts` (from `zip-files/Pink Paprikaa Design System/brand.js` with spec C3/C6/C16 applied):

```ts
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
```

`packages/content/src/brand/brand.ts`:

```ts
import { rawBrand } from "./brand-data.js";
import { type Brand, brandSchema } from "./brand-schema.js";

/** The validated brand facts. A schema violation fails every consumer's build. */
export const brand: Brand = brandSchema.parse(rawBrand);
```

`packages/content/src/brand/brand-lines.ts`:

```ts
import type { Brand } from "./brand-schema.js";

export interface BrandLines {
  copyright: string;
  fssai: string;
  gstin: string;
  cin: string;
  cities: string;
  contactShort: string;
  footerPolicies: string[];
}

/** Derived legal/contact strings. The caller passes the year (build time), so output is deterministic. */
export function toBrandLines(brand: Brand, year: number): BrandLines {
  if (!Number.isInteger(year)) {
    throw new RangeError(`toBrandLines: year must be a whole number, got ${String(year)}`);
  }
  const fssai = `FSSAI Lic. ${brand.legal.fssai}`;
  return {
    copyright: `© ${String(year)} ${brand.legal.entity}`,
    fssai,
    gstin: `GSTIN ${brand.legal.gstin}`,
    cin: `CIN ${brand.legal.cin}`,
    cities: [...new Set(brand.outlets.map((outlet) => outlet.city))].join(" · "),
    contactShort: `${brand.contact.website} · ${brand.contact.phoneDisplay}`,
    footerPolicies: [...brand.policies, fssai],
  };
}
```

`packages/content/src/index.ts`:

```ts
export { brand } from "./brand/brand.js";
export { type BrandLines, toBrandLines } from "./brand/brand-lines.js";
export {
  type Brand,
  brandSchema,
  type SocialNetwork,
  socialNetworkSchema,
} from "./brand/brand-schema.js";
```

- [ ] **Step 5: Run, gate, commit**

```bash
git rm -q packages/content/src/lib/content.ts packages/content/src/lib/content.spec.ts
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/content --skip-nx-cache --outputStyle=static 2>&1 | tail -8
```

Expected: PASS. (If `z.url()`/`z.email()` do not exist in the resolved Zod, check `packages/content/node_modules/zod` docs and use the installed equivalent.)

```bash
git add -A packages/content pnpm-lock.yaml
git commit -m "feat(content): validated brand facts from the design system's brand.js

Founded 2025; facts the owner has not supplied are null, not TODO strings.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

