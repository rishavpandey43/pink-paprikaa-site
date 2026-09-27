import { rawBrand } from "./brand-data.js";
import { brandSchema } from "./brand-schema.js";
import { brand } from "./brand.js";

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
      const [first] = d.social as { network: string }[];
      if (!first) throw new Error("the brand fixture has no social links to corrupt");
      first.network = "facebook";
    });
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });
});
