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

  it("ships Instagram only, with ordering, reviews and maps (R140)", () => {
    expect(brand.social).toEqual([
      {
        network: "instagram",
        handle: "@thepinkpaprikaa",
        url: "https://www.instagram.com/thepinkpaprikaa/",
      },
    ]);
    expect(brand.about).toBe("Opened in 2025.");
    expect(brand.ordering.website.url).toBe("https://order.pinkpaprikaa.com/");
    expect(brand.reviews.google).toEqual({
      rating: 4.3,
      count: 98,
      label: "Google reviews",
      url: "https://maps.app.goo.gl/y8xr1QtSW1kfQKwD7?g_st=ic",
    });
    expect(brand.outlets[0]?.mapsUrl).toBe("https://maps.app.goo.gl/y8xr1QtSW1kfQKwD7?g_st=ic");
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

  it("rejects a CIN that is not 21 characters of the right shape", () => {
    const bad = withChange(
      (d) => ((d.legal as Record<string, unknown>).cin = "U56101HR2025PTC13346")
    );
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a PAN that is not 10 characters of the right shape", () => {
    const bad = withChange((d) => ((d.legal as Record<string, unknown>).pan = "AAPCP9130"));
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects the legal entity with one 'a'", () => {
    const bad = withChange(
      (d) =>
        ((d.legal as Record<string, unknown>).entity = "Paprika Culinary Ventures Private Limited")
    );
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

  it("rejects a social link that is not http or https", () => {
    const bad = withChange((d) => {
      const [first] = d.social as { url: string }[];
      if (!first) throw new Error("the brand fixture has no social links to corrupt");
      first.url = "javascript:alert(1)";
    });
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a website URL that is not http or https", () => {
    const bad = withChange(
      (d) => ((d.contact as Record<string, unknown>).websiteUrl = "javascript:alert(1)")
    );
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects a maps URL that is not http or https", () => {
    const bad = withChange((d) => {
      const [first] = d.outlets as { mapsUrl: string | null }[];
      if (!first) throw new Error("the brand fixture has no outlets to corrupt");
      first.mapsUrl = "javascript:alert(1)";
    });
    expect(brandSchema.safeParse(bad).success).toBe(false);
  });
});
