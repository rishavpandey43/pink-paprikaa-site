### Task 14: PriceTag

**Files:**

- Create: `packages/design-tokens/tokens/component/price-tag.json`
- Modify: `packages/design-tokens/contrast-pairs.json`
- Create: `packages/ui/src/atoms/price-tag/price-tag.tsx`, `price-tag.test.tsx`, `price-tag.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/price-tag/price-tag.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                            | Ruling  | Where / clause                                      |
| ------------------------------------------------------------------- | ------- | --------------------------------------------------- |
| whole rupees: `₹`, no space, no decimals                            | ALREADY | Step 2                                              |
| lakh grouping (`₹1,25,000`)                                         | ADD     | Step 2 amounts table                                |
| paise kept on a fraction (`₹99.5`)                                  | DROP    | spec §7.4: `formatRupees` is "rounded, no decimals" |
| en-dash range                                                       | ALREADY | Step 2                                              |
| struck original, "was" for assistive tech                           | ALREADY | Step 2                                              |
| no struck price without a discount                                  | ADD     | Step 2 new test                                     |
| sizes and tones                                                     | ALREADY | Step 2 (values from `PriceTag.jsx`)                 |
| display face, bold, at every size                                   | ALREADY | Step 2                                              |
| caller `className` replaces a conflict                              | ALREADY | Step 2 (`text-canvas-h2` replaces `text-price-md`)  |
| wraps (`flex-wrap`), so a struck price drops under in a narrow cell | ADD     | Step 4 root; Step 2 new test                        |
| axe over plain, discounted, a small range                           | ADD     | Step 2 a11y test                                    |
| story: `₹1,25,000` among the amounts                                | ADD     | Step 6 `Amounts`                                    |
| story: tones ink and brand, each with `was`                         | ADD     | Step 6 `tone`                                       |
| story: inverse with a struck price on brand                         | ADD     | Step 6 `tone`                                       |
| stories discounted / range / sizes                                  | ALREADY | Step 6                                              |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `formatRupees`, `formatRupeeRange` (`@pink-paprikaa-web/utils`; the range already throws on a backwards range), `componentVariants`, `OnSurfaces` (Plan 2a).
- Produces: `PriceTag`, `PriceTagProps` as contract §3. `was` must be higher than the price it strikes (`to ?? amount`) or it throws `RangeError`. The size lives on the root (`text-price-*`) and the amount and struck price are `em`-relative, so a consumer class (`text-canvas-h2` on an artboard) scales the whole tag.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/price-tag.json`:

```json
{
  "text": {
    "$type": "typography",
    "price-sm": { "$value": { "fontSize": "14px" } },
    "price-md": { "$value": { "fontSize": "17px" }, "$description": "The default price." },
    "price-lg": { "$value": { "fontSize": "22px" } },
    "price-canvas": {
      "$value": { "fontSize": "56px" },
      "$description": "A price on a 1080px artboard (FeedArtboards DishLaunchPost), under a canvas-h1 headline."
    },
    "price-amount": {
      "$value": { "fontSize": "1em", "letterSpacing": "-0.01em" },
      "$description": "The amount, relative to the tag's size, so one class on the tag scales the whole price."
    },
    "price-was": {
      "$value": { "fontSize": "0.78em" },
      "$description": "The struck original: 78% of the amount."
    }
  }
}
```

Append to `TEXT`: `"price-sm", "price-md", "price-lg", "price-canvas", "price-amount", "price-was"`.

Contrast — `tone="inverse"` paints `text-text-on-inverse` (white) on the brand pink as well as on ink. Append to `packages/design-tokens/contrast-pairs.json` → `groups`:

```json
{
  "id": "inverse-text-on-brand-fill",
  "surface": null,
  "pairs": [["color-text-on-inverse", "color-surface-brand"]],
  "min": 3,
  "exception": "brand-fill"
}
```

(White on the brand fill is the one declared exception, held at the AA-large floor; the policy spec asserts the ground is the brand pink.)

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/price-tag/price-tag.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { PriceTag } from "./price-tag";

describe("PriceTag", () => {
  it.each([
    [280, "₹280"],
    [1240, "₹1,240"],
    [125000, "₹1,25,000"],
    [90, "₹90"],
  ])("prints %d as %s — rupee sign, no space, no decimals, Indian grouping", (amount, text) => {
    render(<PriceTag amount={amount} />);
    expect(screen.getByText(text)).toHaveClass("font-display", "font-bold", "text-price-amount");
  });

  it("strikes the original price and says 'was' to assistive tech", () => {
    render(<PriceTag amount={240} was={320} />);
    const struck = screen.getByText("₹320");
    expect(struck.tagName).toBe("S");
    expect(struck).toHaveTextContent("was ₹320");
    expect(screen.getByText("was")).toHaveClass("sr-only");
    expect(struck).toHaveClass("text-price-was", "text-text-subtle");
  });

  it("prints no struck price without a discount", () => {
    const { container } = render(<PriceTag amount={240} />);
    expect(container.querySelector("s")).not.toBeInTheDocument();
    expect(screen.queryByText("was")).not.toBeInTheDocument();
  });

  it("wraps, so a struck price drops under the price in a narrow cell instead of overflowing", () => {
    render(<PriceTag amount={240} was={320} />);
    expect(screen.getByText("₹240").parentElement).toHaveClass("flex-wrap");
  });

  it("joins a range with an en dash and no spaces", () => {
    render(<PriceTag amount={180} to={320} />);
    expect(screen.getByText("₹180–₹320")).toBeInTheDocument();
  });

  it.each([
    [320, 240],
    [240, 240],
  ])("refuses a struck price that is not higher (amount %d, was %d)", (amount, was) => {
    expect(() => renderToString(<PriceTag amount={amount} was={was} />)).toThrow(RangeError);
  });

  it("refuses a struck price below the top of a range", () => {
    expect(() => renderToString(<PriceTag amount={180} to={320} was={300} />)).toThrow(RangeError);
  });

  it("refuses a range that runs backwards", () => {
    expect(() => renderToString(<PriceTag amount={320} to={180} />)).toThrow(RangeError);
  });

  it.each([
    ["sm", "text-price-sm"],
    ["md", "text-price-md"],
    ["lg", "text-price-lg"],
    ["canvas", "text-price-canvas"],
  ] as const)("sets size %s with %s on the tag", (size, sizeClass) => {
    render(<PriceTag amount={280} size={size} />);
    expect(screen.getByText("₹280").parentElement).toHaveClass(sizeClass);
  });

  it("scales the struck price with the canvas size, since it is relative to the tag", () => {
    render(<PriceTag amount={220} was={280} size="canvas" />);
    expect(screen.getByText("₹220").parentElement).toHaveClass("text-price-canvas");
    expect(screen.getByText("₹280")).toHaveClass("text-price-was");
    expect(screen.getByText("₹220")).toHaveClass("text-price-amount");
  });

  it.each([
    ["ink", "text-text-heading"],
    ["brand", "text-text-brand"],
    ["inverse", "text-text-on-inverse"],
  ] as const)("paints tone %s with %s", (tone, colour) => {
    render(<PriceTag amount={280} tone={tone} />);
    expect(screen.getByText("₹280")).toHaveClass(colour);
  });

  it("scales as a whole with one consumer class — the struck price follows", () => {
    render(<PriceTag amount={280} was={320} className="text-canvas-h2" />);
    const tag = screen.getByText("₹280").parentElement;
    expect(tag).toHaveClass("text-canvas-h2");
    expect(tag).not.toHaveClass("text-price-md");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <PriceTag amount={280} />
        <PriceTag amount={240} was={320} />
        <PriceTag amount={180} to={320} size="sm" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './price-tag'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/price-tag/price-tag.tsx`:

```tsx
import type { ComponentProps } from "react";

import { formatRupeeRange, formatRupees } from "@pink-paprikaa-web/utils";

import { componentVariants } from "../../lib/component-variants";

/** Size on the tag, amount and struck price in em — one class scales the whole price. */
const priceTag = componentVariants({
  slots: {
    root: "inline-flex flex-wrap items-baseline gap-2",
    amount: "text-price-amount font-display font-bold",
    was: "text-price-was font-body text-text-subtle",
  },
  variants: {
    size: {
      sm: { root: "text-price-sm" },
      md: { root: "text-price-md" },
      lg: { root: "text-price-lg" },
      canvas: { root: "text-price-canvas" },
    },
    tone: {
      ink: { amount: "text-text-heading" },
      brand: { amount: "text-text-brand" },
      inverse: { amount: "text-text-on-inverse" },
    },
  },
  defaultVariants: { size: "md", tone: "ink" },
});

export interface PriceTagProps extends ComponentProps<"span"> {
  /** Whole rupees. */
  amount: number;
  /** The original price, struck through. Must be higher than the price it replaces. */
  was?: number | undefined;
  /** Upper bound: renders "₹180–₹320". Must not be below `amount`. */
  to?: number | undefined;
  /** sm 14 · md 17 · lg 22px · canvas 56px (1080px artboards); a text class also scales the tag. = "md" */
  size?: "sm" | "md" | "lg" | "canvas" | undefined;
  /** `inverse` on pink or ink panels (`ink` already follows the surface). = "ink" */
  tone?: "ink" | "brand" | "inverse" | undefined;
}

/**
 * The only correct way to print a price: `₹` with no space, no decimals, Indian grouping, an
 * en-dash range, the original struck through. A struck price that is not higher, or a range that
 * runs backwards, would mislead a guest — both throw instead of rendering.
 */
export function PriceTag({
  amount,
  was,
  to,
  size = "md",
  tone = "ink",
  className,
  ...props
}: PriceTagProps) {
  const price = to ?? amount;
  if (was !== undefined && was <= price) {
    throw new RangeError(
      `PriceTag: was (${String(was)}) must be more than the price it strikes through (${String(price)})`
    );
  }
  const styles = priceTag({ size, tone });

  return (
    <span className={styles.root({ className })} {...props}>
      <span className={styles.amount()}>
        {to === undefined ? formatRupees(amount) : formatRupeeRange(amount, to)}
      </span>
      {was === undefined ? null : (
        <s className={styles.was()}>
          <span className="sr-only">was </span>
          {formatRupees(was)}
        </s>
      )}
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/design-tokens @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -10` (use `pnpm nx run-many -t test -p …` if `nx test` rejects two projects)
Expected: PASS, including the contrast policy suite's new `inverse-text-on-brand-fill` group.

- [ ] **Step 6: Stories (card parity with `PriceTag.card.html`; docs from `PriceTag.prompt.md`)**

`packages/ui/src/atoms/price-tag/price-tag.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { PriceTag } from "./price-tag";

const meta = {
  title: "Atoms/PriceTag",
  component: PriceTag,
  args: { amount: 280 },
  parameters: {
    docs: {
      description: {
        component:
          'The only correct way to render a price: `₹` with no space, no decimals on whole rupees, Indian digit grouping, an en-dash range (`to`), the original struck through (`was`). `tone="inverse"` on pink or ink panels — though `ink` already follows the surface. `size="canvas"` (56px) prints a price on a 1080px artboard. Never hand-write a price string. A struck price must be higher than the price, and a range must run upwards: anything else throws. The size sits on the tag and the parts are relative to it, so one text class also scales the whole price.',
      },
    },
  },
} satisfies Meta<typeof PriceTag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Amounts: Story = {
  name: "amount",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag amount={280} />
      <PriceTag amount={1240} />
      <PriceTag amount={125000} />
      <PriceTag amount={90} />
    </div>
  ),
};

export const Was: Story = { name: "was", args: { amount: 240, was: 320 } };

export const Range: Story = { name: "to", args: { amount: 180, to: 320 } };

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-6">
      <PriceTag amount={280} size="sm" />
      <PriceTag amount={280} size="md" />
      <PriceTag amount={280} size="lg" />
    </div>
  ),
};

export const Inverse: Story = {
  name: "tone",
  render: () => (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-baseline gap-6">
        <PriceTag amount={280} was={320} tone="ink" />
        <PriceTag amount={280} was={320} tone="brand" />
      </div>
      <div
        data-surface="brand"
        className="flex flex-wrap items-baseline gap-6 rounded-lg bg-surface-brand p-4"
      >
        <PriceTag amount={280} tone="inverse" size="lg" />
        <PriceTag amount={240} was={320} tone="inverse" />
      </div>
    </div>
  ),
};

/** FeedArtboards.jsx DishLaunchPost: the price on a 1080px board. View at the xl viewport. */
export const Canvas: Story = {
  name: "size canvas (artwork)",
  render: () => (
    <div className="flex flex-wrap items-baseline gap-10">
      <PriceTag amount={220} size="canvas" />
      <PriceTag amount={220} was={280} size="canvas" />
      <PriceTag amount={180} to={320} size="canvas" />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <PriceTag amount={240} was={320} />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { PriceTag, type PriceTagProps } from "./atoms/price-tag/price-tag";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/price-tag packages/design-tokens/tokens/component/price-tag.json packages/design-tokens/contrast-pairs.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the PriceTag atom

Rupees the brand way through the shared formatters: amount, en-dash range,
struck original read as 'was'. A struck price that is not higher, or a
backwards range, throws rather than mislead a guest. Sizes sit on the tag
and the parts are em-relative, so the canvas size (56px, the artboard
price) and any text class scale the whole price. Adds the white-on-brand-
fill pair for the inverse tone.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

