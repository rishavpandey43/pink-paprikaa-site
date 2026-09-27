/**
 * Money and count formatting for the brand's copy rules: `₹` with no space, no decimals on whole
 * rupees, Indian digit grouping (`₹1,19,952`), en-dash ranges (`₹180–₹320`), a true minus sign
 * for discounts (`−₹500`).
 */
const INDIAN_INTEGER = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const MINUS_SIGN = "−";
const EN_DASH = "–";

function assertFinite(value: number, caller: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${caller}: expected a finite number, got ${String(value)}`);
  }
}

export function formatRupees(amount: number): string {
  assertFinite(amount, "formatRupees");
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? MINUS_SIGN : "";
  return `${sign}₹${INDIAN_INTEGER.format(Math.abs(rounded))}`;
}

export function formatRupeeRange(from: number, to: number): string {
  if (to < from) {
    throw new RangeError(
      `formatRupeeRange: range runs backwards (${String(from)} to ${String(to)})`
    );
  }
  return `${formatRupees(from)}${EN_DASH}${formatRupees(to)}`;
}

export function formatCount(value: number): string {
  assertFinite(value, "formatCount");
  return INDIAN_INTEGER.format(Math.round(value));
}
