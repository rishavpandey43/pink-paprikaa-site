import { toBrandLines } from "./brand-lines.js";
import { brand } from "./brand.js";

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

  it("prints the Google rating and Est. lines from brand facts", () => {
    expect(lines.googleRating).toBe("4.3 · 98 Google reviews");
    expect(lines.est).toBe("Est. 2025");
  });
});
