### Task 3: Rupee and count formatting in `packages/utils`

**Files:**

- Delete: `packages/utils/src/lib/utils.ts`, `packages/utils/src/lib/utils.spec.ts`
- Create: `packages/utils/src/format-rupees.ts`, `packages/utils/src/format-rupees.spec.ts`
- Replace: `packages/utils/src/index.ts`

**Interfaces:**

- Produces: `formatRupees(amount: number): string`, `formatRupeeRange(from: number, to: number): string`, `formatCount(value: number): string` from `@pink-paprikaa-web/utils`.

- [ ] **Step 1: Write the failing tests**

`packages/utils/src/format-rupees.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/utils --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — cannot find `./format-rupees.js`.

- [ ] **Step 3: Implement**

`packages/utils/src/format-rupees.ts`:

```ts
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
```

`packages/utils/src/index.ts`:

```ts
export { formatCount, formatRupeeRange, formatRupees } from "./format-rupees.js";
```

- [ ] **Step 4: Run to verify it passes, then gate**

Run:

```bash
git rm -q packages/utils/src/lib/utils.ts packages/utils/src/lib/utils.spec.ts
pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/utils --skip-nx-cache --outputStyle=static 2>&1 | tail -8
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A packages/utils
git commit -m "feat(utils): format rupees, ranges and counts the brand way

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

