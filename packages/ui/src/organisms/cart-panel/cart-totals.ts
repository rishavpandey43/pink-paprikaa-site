export interface CartLine {
  id: string;
  name: string;
  /** Unit price in whole rupees. */
  price: number;
  quantity: number;
  note?: string | undefined;
}

export interface CartTotals {
  subtotal: number;
  /** GST, rounded to a whole rupee. */
  tax: number;
  total: number;
}

/** Subtotal of unit × quantity, then GST rounded half-away-from-zero via `Math.round`. */
export function cartTotals(lines: CartLine[], gstRate = 0.05): CartTotals {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const tax = Math.round(subtotal * gstRate);
  return { subtotal, tax, total: subtotal + tax };
}
