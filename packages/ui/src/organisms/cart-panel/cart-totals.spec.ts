import { type CartLine, cartTotals } from "./cart-totals";

function rupees(amount: number): CartLine[] {
  return [{ id: "line", name: "Line", price: amount, quantity: 1 }];
}

describe("cartTotals", () => {
  it("is zero for an empty cart", () => {
    expect(cartTotals([])).toEqual({ subtotal: 0, tax: 0, total: 0 });
  });

  it("rounds 5% GST on ₹960 to ₹48 and a ₹1,008 total", () => {
    expect(cartTotals(rupees(960))).toEqual({ subtotal: 960, tax: 48, total: 1008 });
  });

  it("rounds 5% GST on ₹1,180 to ₹59 and a ₹1,239 total", () => {
    expect(cartTotals(rupees(1180))).toEqual({ subtotal: 1180, tax: 59, total: 1239 });
  });

  it("rounds a half rupee of GST away from zero (₹1,010 → ₹51)", () => {
    expect(cartTotals(rupees(1010)).tax).toBe(51);
  });

  it("charges no tax at rate 0", () => {
    expect(cartTotals(rupees(960), 0)).toEqual({ subtotal: 960, tax: 0, total: 960 });
  });
});
