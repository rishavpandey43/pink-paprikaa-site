import { formatCount, formatRupeeRange, formatRupees } from "./format-rupees.js";

describe("formatRupees", () => {
  it.each([
    [0, "₹0"],
    [240, "₹240"],
    [99.4, "₹99"],
    [1999.5, "₹2,000"],
    [99_792, "₹99,792"],
    [1_19_952, "₹1,19,952"],
    [1_00_00_000, "₹1,00,00,000"],
  ])(
    "formats %d as %s — rupee sign, no space, no decimals, Indian grouping",
    (amount, expected) => {
      expect(formatRupees(amount)).toBe(expected);
    }
  );

  it("writes a discount with a true minus sign before the rupee sign", () => {
    expect(formatRupees(-500)).toBe("−₹500");
  });

  it("does not print a negative zero for an amount that rounds to zero", () => {
    expect(formatRupees(-0.4)).toBe("₹0");
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
    "rejects the non-finite amount %d instead of printing it",
    (amount) => {
      expect(() => formatRupees(amount)).toThrow(RangeError);
    }
  );
});

describe("formatRupeeRange", () => {
  it("joins two amounts with an en dash and no spaces", () => {
    expect(formatRupeeRange(180, 320)).toBe("₹180–₹320");
  });

  it("rejects a range that runs backwards", () => {
    expect(() => formatRupeeRange(320, 180)).toThrow(RangeError);
  });
});

describe("formatCount", () => {
  it("groups counts the Indian way", () => {
    expect(formatCount(1_234_567)).toBe("12,34,567");
    expect(formatCount(2500)).toBe("2,500");
  });
});
