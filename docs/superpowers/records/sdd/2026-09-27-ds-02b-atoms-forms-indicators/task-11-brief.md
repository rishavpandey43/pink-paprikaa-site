### Task 11: Rating — and the shared brand diamond

**Files:**

- Create: `packages/design-tokens/tokens/component/brand-diamond.json`, `packages/design-tokens/tokens/component/rating.json`
- Create: `packages/ui/src/lib/brand-diamond.tsx`
- Create: `packages/ui/src/atoms/rating/rating.tsx`, `rating.test.tsx`, `rating.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/rating/rating.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                          | Ruling                | Where / clause                                                  |
| --------------------------------------------------------------------------------- | --------------------- | --------------------------------------------------------------- |
| named "Rated 4.6 out of 5"                                                        | ALREADY               | spec §9.1 wording "4.5 out of 5"; Step 2                        |
| count in the name and in brackets, Indian grouping                                | ALREADY               | Step 2 (`formatCount`)                                          |
| score to one decimal; hide it (`hasValueLabel`)                                   | ALREADY               | contract `hasValue`; Step 2                                     |
| one mark per point; a shorter scale                                               | ALREADY               | Step 2                                                          |
| whole marks full, the fraction by real percentage, no fill layer on an empty mark | ALREADY               | Step 2 (clip in screen space)                                   |
| an overshooting score clamps                                                      | ALREADY (differently) | throws `RangeError` (plan Global Constraints; Review Focus 5)   |
| size xs                                                                           | DROP                  | `Rating.card.html` 12 / 16 / 24 → contract sm / md / lg         |
| rotated diamond by default; `symbol` variant                                      | ALREADY               | Step 2                                                          |
| small sizes step the mark's opacity up                                            | ALREADY               | Step 2                                                          |
| caller `className` on the root, replacing a conflict                              | ADD                   | Step 2 new test                                                 |
| tabular numerals on the score and the count                                       | ADD                   | Step 4 `value` / `count` slots; Step 2 assertions; Task 0 probe |
| axe over a count, symbols at lg, sm without the score                             | ADD                   | Step 2 a11y test                                                |
| story: a 0 score among the values                                                 | ADD                   | Step 6 `Values`                                                 |
| story: a count without the score at sm                                            | ADD                   | Step 6 `Count`                                                  |
| story: on an outlet card (the real shape)                                         | ADD                   | Step 6 `OnAnOutletCard`                                         |
| stories sizes / variants / partial fill                                           | ALREADY               | Step 6                                                          |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `SymbolMark` (Plan 2a), `formatCount` (`@pink-paprikaa-web/utils`), `componentVariants`.
- Produces: `Rating`, `RatingProps` as contract §3 (`role="img"` on the root, named "4.6 out of 5" — with a count, "4.6 out of 5, 2,184 reviews"); `BrandDiamond`, `BrandDiamondProps`, `BrandDiamondSize = "12px" | "14px" | "16px" | "20px" | "24px"`, `brandDiamondVariants` (`lib/brand-diamond.tsx`: `size`, `fill: "empty" | "brand" | "heat-1" … "heat-4"`) — SpiceLevel uses it in Task 12.

The geometry, from `Rating.jsx`: a square rotated 45° has a bounding box of `size × √2`. Each unit here _is_ that box, with the diamond centred inside, so units 4px apart (`gap-1`) put the diamond tips 4px apart — the jsx's `gap: size × 0.4142 + 4` — and a partial fill clipped across the unrotated box fills exactly that fraction of the diamond's width, in screen space.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/brand-diamond.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "brand-diamond-12": { "$value": "12px", "$description": "Rating sm, SpiceLevel sm." },
    "brand-diamond-14": { "$value": "14px", "$description": "SpiceLevel md." },
    "brand-diamond-16": { "$value": "16px", "$description": "Rating md." },
    "brand-diamond-20": { "$value": "20px", "$description": "SpiceLevel lg." },
    "brand-diamond-24": { "$value": "24px", "$description": "Rating lg." },
    "brand-diamond-box-12": {
      "$value": "calc(12px * 1.4142)",
      "$description": "Bounding box of a 12px diamond rotated 45°."
    },
    "brand-diamond-box-14": { "$value": "calc(14px * 1.4142)" },
    "brand-diamond-box-16": { "$value": "calc(16px * 1.4142)" },
    "brand-diamond-box-20": { "$value": "calc(20px * 1.4142)" },
    "brand-diamond-box-24": { "$value": "calc(24px * 1.4142)" }
  },
  "radius": {
    "$type": "dimension",
    "brand-diamond": { "$value": "2px", "$description": "The diamond's softened corners." }
  }
}
```

`packages/design-tokens/tokens/component/rating.json`:

```json
{
  "text": {
    "$type": "typography",
    "rating-value": {
      "$value": { "fontSize": "13.5px" },
      "$description": "The score, Poppins 700."
    },
    "rating-count": { "$value": { "fontSize": "13px" }, "$description": "The review count." }
  }
}
```

Append to `SPACING`: `"brand-diamond-12", "brand-diamond-14", "brand-diamond-16", "brand-diamond-20", "brand-diamond-24", "brand-diamond-box-12", "brand-diamond-box-14", "brand-diamond-box-16", "brand-diamond-box-20", "brand-diamond-box-24"`; to `TEXT`: `"rating-value", "rating-count"`; to `RADIUS`: `"brand-diamond"`.

The mark's scale inside a diamond (Rating.jsx: 86% under 14px, 80% to 19px, 74% from 20px) is a fraction size — `size-6/7` (85.7%), `size-4/5` (as Plan 2a's StatusDot), `size-3/4` (75%) — within 0.3px at every size. The 3px gap between bare marks (variant `symbol`) is the quarter step `gap-0.75`.

Contrast: no new pair — the score is `text-text-heading`, the count `text-text-subtle`, both asserted on every ground.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/rating/rating.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Rating } from "./rating";

/** Diamonds by fill: every unit has an empty base; filled (or partly filled) ones add a pink layer. */
const filled = (container: HTMLElement) => container.querySelectorAll(".rotate-45.bg-pink-500");
const empty = (container: HTMLElement) => container.querySelectorAll(".rotate-45.bg-ink-200");
const clips = (container: HTMLElement) =>
  [...container.querySelectorAll("[style]")].map((element) => element.getAttribute("style"));

describe("Rating", () => {
  it("is one image named with the score", () => {
    render(<Rating value={4.6} />);
    expect(screen.getByRole("img", { name: "4.6 out of 5" })).toBeInTheDocument();
  });

  it("adds the review count to the name and prints it with Indian grouping", () => {
    render(<Rating value={4.6} count={2184} />);
    expect(screen.getByRole("img", { name: "4.6 out of 5, 2,184 reviews" })).toBeInTheDocument();
    expect(screen.getByText("(2,184)")).toHaveClass(
      "text-rating-count",
      "text-text-subtle",
      "tabular-nums"
    );
  });

  it("shows the score to one decimal, or hides it", () => {
    const { rerender } = render(<Rating value={5} />);
    expect(screen.getByText("5.0")).toHaveClass("font-display", "font-bold", "tabular-nums");
    rerender(<Rating value={5} hasValue={false} />);
    expect(screen.queryByText("5.0")).not.toBeInTheDocument();
  });

  it("fills whole diamonds solid and clips a half one at exactly 50%, in screen space", () => {
    const { container } = render(<Rating value={4.5} />);
    expect(empty(container)).toHaveLength(5);
    expect(filled(container)).toHaveLength(5);
    expect(clips(container)).toEqual(["clip-path: inset(0 50% 0 0);"]);
  });

  it("fills 30% of the fifth diamond for 4.3", () => {
    const { container } = render(<Rating value={4.3} />);
    expect(clips(container)).toEqual(["clip-path: inset(0 70% 0 0);"]);
  });

  it("draws no fill at all for 0, and still names the score", () => {
    const { container } = render(<Rating value={0} />);
    expect(screen.getByRole("img", { name: "0 out of 5" })).toBeInTheDocument();
    expect(screen.getByText("0.0")).toBeInTheDocument();
    expect(filled(container)).toHaveLength(0);
    expect(empty(container)).toHaveLength(5);
  });

  it.each([-0.5, 5.5, Number.NaN])("rejects the impossible score %d", (value) => {
    expect(() => renderToString(<Rating value={value} />)).toThrow(RangeError);
  });

  it("rejects a max that is not a whole number of at least 1", () => {
    expect(() => renderToString(<Rating value={1} max={2.5} />)).toThrow(RangeError);
    expect(() => renderToString(<Rating value={0} max={0} />)).toThrow(RangeError);
  });

  it("honours another max", () => {
    const { container } = render(<Rating value={2} max={3} />);
    expect(screen.getByRole("img", { name: "2 out of 3" })).toBeInTheDocument();
    expect(empty(container)).toHaveLength(3);
  });

  it.each([
    ["sm", "size-brand-diamond-12", "size-brand-diamond-box-12"],
    ["md", "size-brand-diamond-16", "size-brand-diamond-box-16"],
    ["lg", "size-brand-diamond-24", "size-brand-diamond-box-24"],
  ] as const)("draws size %s diamonds at %s in a %s box", (size, diamond, box) => {
    const { container } = render(<Rating value={3} size={size} />);
    expect(container.querySelectorAll(`.${diamond}`)).toHaveLength(5 + 3);
    expect(container.querySelectorAll(`.${box}`)).toHaveLength(5 + 3);
  });

  it("puts a white mark on a filled diamond and a pink one on an empty diamond", () => {
    const { container } = render(<Rating value={1} max={2} />);
    expect(container.querySelector(".bg-pink-500 > svg")).toHaveClass("text-ink-000", "size-4/5");
    expect(container.querySelector(".bg-ink-200 > svg")).toHaveClass("text-pink-500");
  });

  it("raises the mark's opacity on small diamonds so it still resolves", () => {
    const { container, rerender } = render(<Rating value={1} max={2} size="sm" />);
    expect(container.querySelector(".bg-pink-500 > svg")).toHaveClass("opacity-85", "size-6/7");
    expect(container.querySelector(".bg-ink-200 > svg")).toHaveClass("opacity-80");
    rerender(<Rating value={1} max={2} size="lg" />);
    expect(container.querySelector(".bg-pink-500 > svg")).toHaveClass("opacity-50", "size-3/4");
  });

  it("swaps the diamonds for the bare brand mark with variant symbol", () => {
    const { container } = render(<Rating value={4.5} variant="symbol" />);
    expect(container.querySelectorAll(".rotate-45")).toHaveLength(0);
    expect(container.querySelectorAll("svg.opacity-22")).toHaveLength(5);
    expect(clips(container)).toEqual(["clip-path: inset(0 50% 0 0);"]);
  });

  it("merges a caller className onto the root, replacing a conflicting class", () => {
    render(<Rating value={4.6} className="gap-6" />);
    const rating = screen.getByRole("img", { name: "4.6 out of 5" });
    expect(rating).toHaveClass("gap-6");
    expect(rating).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations with a count, as symbols, and without the score", async () => {
    const { container } = render(
      <>
        <Rating value={4.6} count={2184} />
        <Rating value={5} variant="symbol" size="lg" />
        <Rating value={4.3} size="sm" hasValue={false} />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './rating'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/brand-diamond.tsx`:

```tsx
import { componentVariants } from "./component-variants";
import { SymbolMark } from "./symbol-mark";

/**
 * The brand's small diamond (readme §3.4): a square turned 45° carrying the mark — white on a
 * coloured fill, pink on the empty ink-200 fill so it never blends away. Drawn inside its bounding
 * box, so units spaced 4px apart put the tips 4px apart, and a clip across the (unrotated) box
 * fills an exact fraction of the diamond's width. Small diamonds get a bigger, stronger mark
 * (Rating.jsx / SpiceLevel.jsx `markScale`, `markAlpha`).
 */
export const brandDiamondVariants = componentVariants({
  slots: {
    unit: "relative grid shrink-0 place-items-center",
    diamond: "rounded-brand-diamond grid rotate-45 place-items-center overflow-hidden",
    mark: "-rotate-45",
  },
  variants: {
    size: {
      "12px": {
        unit: "size-brand-diamond-box-12",
        diamond: "size-brand-diamond-12",
        mark: "size-6/7",
      },
      "14px": {
        unit: "size-brand-diamond-box-14",
        diamond: "size-brand-diamond-14",
        mark: "size-4/5",
      },
      "16px": {
        unit: "size-brand-diamond-box-16",
        diamond: "size-brand-diamond-16",
        mark: "size-4/5",
      },
      "20px": {
        unit: "size-brand-diamond-box-20",
        diamond: "size-brand-diamond-20",
        mark: "size-3/4",
      },
      "24px": {
        unit: "size-brand-diamond-box-24",
        diamond: "size-brand-diamond-24",
        mark: "size-3/4",
      },
    },
    fill: {
      empty: { diamond: "bg-ink-200", mark: "text-pink-500" },
      brand: { diamond: "bg-pink-500", mark: "text-ink-000" },
      "heat-1": { diamond: "bg-heat-1", mark: "text-ink-000" },
      "heat-2": { diamond: "bg-heat-2", mark: "text-ink-000" },
      "heat-3": { diamond: "bg-heat-3", mark: "text-ink-000" },
      "heat-4": { diamond: "bg-heat-4", mark: "text-ink-000" },
    },
  },
  compoundVariants: [
    { size: "12px", fill: "empty", class: { mark: "opacity-80" } },
    {
      size: "12px",
      fill: ["brand", "heat-1", "heat-2", "heat-3", "heat-4"],
      class: { mark: "opacity-85" },
    },
    { size: ["14px", "16px"], fill: "empty", class: { mark: "opacity-62" } },
    {
      size: ["14px", "16px"],
      fill: ["brand", "heat-1", "heat-2", "heat-3", "heat-4"],
      class: { mark: "opacity-66" },
    },
    { size: ["20px", "24px"], class: { mark: "opacity-50" } },
  ],
  defaultVariants: { size: "16px", fill: "empty" },
});

export type BrandDiamondSize = "12px" | "14px" | "16px" | "20px" | "24px";

export interface BrandDiamondProps {
  size?: BrandDiamondSize | undefined;
  fill?: "empty" | "brand" | "heat-1" | "heat-2" | "heat-3" | "heat-4" | undefined;
  className?: string | undefined;
}

/** Decorative: the component that owns a row of diamonds names the whole row. */
export function BrandDiamond({ size, fill, className }: BrandDiamondProps) {
  const styles = brandDiamondVariants({ size, fill });
  return (
    <span aria-hidden="true" className={styles.unit({ className })}>
      <span className={styles.diamond()}>
        <SymbolMark className={styles.mark()} />
      </span>
    </span>
  );
}
```

`packages/ui/src/atoms/rating/rating.tsx`:

```tsx
import type { ComponentProps } from "react";

import { formatCount } from "@pink-paprikaa-web/utils";

import { BrandDiamond, type BrandDiamondSize } from "../../lib/brand-diamond";
import { componentVariants } from "../../lib/component-variants";
import { SymbolMark } from "../../lib/symbol-mark";

type RatingSize = "sm" | "md" | "lg";

/** Rating.card.html's sizes, as diamond edge lengths. */
const DIAMOND_SIZE: Readonly<Record<RatingSize, BrandDiamondSize>> = {
  sm: "12px",
  md: "16px",
  lg: "24px",
};

const rating = componentVariants({
  slots: {
    root: "inline-flex items-center gap-2",
    units: "inline-flex items-center",
    value: "text-rating-value font-display font-bold text-text-heading tabular-nums",
    count: "text-rating-count font-body text-text-subtle tabular-nums",
  },
  variants: {
    variant: {
      diamond: { units: "gap-1" },
      symbol: { units: "gap-0.75" },
    },
  },
  defaultVariants: { variant: "diamond" },
});

const symbolUnit = componentVariants({
  slots: {
    unit: "relative shrink-0",
    track: "absolute inset-0 size-full text-pink-500 opacity-22",
    fill: "absolute inset-0 size-full text-pink-500",
  },
  variants: {
    size: {
      sm: { unit: "size-brand-diamond-12" },
      md: { unit: "size-brand-diamond-16" },
      lg: { unit: "size-brand-diamond-24" },
    },
  },
  defaultVariants: { size: "md" },
});

/** Clips a fill layer to `fraction` of its unrotated box, left to right — screen space. */
function clipTo(fraction: number) {
  if (fraction >= 1) return undefined;
  const hidden = Math.round((1 - fraction) * 1000) / 10;
  return { clipPath: `inset(0 ${String(hidden)}% 0 0)` };
}

interface UnitProps {
  /** 0…1: how much of this unit is filled. */
  fill: number;
  size: RatingSize;
}

function DiamondUnit({ fill, size }: UnitProps) {
  return (
    <span className="relative grid shrink-0">
      <BrandDiamond size={DIAMOND_SIZE[size]} fill="empty" />
      {fill > 0 ? (
        <span className="absolute inset-0" style={clipTo(fill)}>
          <BrandDiamond size={DIAMOND_SIZE[size]} fill="brand" />
        </span>
      ) : null}
    </span>
  );
}

function SymbolUnit({ fill, size }: UnitProps) {
  const styles = symbolUnit({ size });
  return (
    <span className={styles.unit()}>
      <SymbolMark className={styles.track()} />
      {fill > 0 ? <SymbolMark className={styles.fill()} style={clipTo(fill)} /> : null}
    </span>
  );
}

export interface RatingProps extends ComponentProps<"span"> {
  /** 0…max; any fraction (4.3 fills 30% of the fifth diamond). */
  value: number;
  /** = 5 */
  max?: number | undefined;
  /** Review count, shown in brackets with Indian digit grouping and read in the name. */
  count?: number | undefined;
  /** sm 12 · md 16 · lg 24px diamonds. = "md" */
  size?: RatingSize | undefined;
  /** `symbol` swaps the diamond for the bare brand mark (ReviewCard, marketing artwork). */
  variant?: "diamond" | "symbol" | undefined;
  /** = true: show the score to one decimal. */
  hasValue?: boolean | undefined;
}

/** Review score: brand diamonds, not stars. One image, named with the score (and the count). */
export function Rating({
  value,
  max = 5,
  count,
  size = "md",
  variant = "diamond",
  hasValue = true,
  className,
  ...props
}: RatingProps) {
  if (!Number.isInteger(max) || max < 1 || !Number.isFinite(value) || value < 0 || value > max) {
    throw new RangeError(
      `Rating: value must be between 0 and a whole max of at least 1, got ${String(value)} of ${String(max)}`
    );
  }
  const styles = rating({ variant });
  const score = `${String(value)} out of ${String(max)}`;
  const name = count === undefined ? score : `${score}, ${formatCount(count)} reviews`;

  return (
    <span role="img" aria-label={name} className={styles.root({ className })} {...props}>
      <span className={styles.units()}>
        {Array.from({ length: max }, (_, index) => {
          const fill = Math.min(Math.max(value - index, 0), 1);
          return variant === "symbol" ? (
            <SymbolUnit key={index} fill={fill} size={size} />
          ) : (
            <DiamondUnit key={index} fill={fill} size={size} />
          );
        })}
      </span>
      {hasValue ? <span className={styles.value()}>{value.toFixed(1)}</span> : null}
      {count === undefined ? null : <span className={styles.count()}>({formatCount(count)})</span>}
    </span>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Rating.card.html`; docs from `Rating.prompt.md`)**

`packages/ui/src/atoms/rating/rating.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Rating } from "./rating";

const meta = {
  title: "Atoms/Rating",
  component: Rating,
  args: { value: 4.6 },
  parameters: {
    docs: {
      description: {
        component:
          'Review score for outlet cards and social proof. Diamonds, not stars — the brand shape; `variant="symbol"` swaps in the bare brand mark, the treatment used in ReviewCard and on marketing artwork. Partial scores fill by real percentage: the fill clips in screen space across the diamond\'s bounding box, so 4.3 fills exactly 30% of the fifth diamond. `md` (16px) is the default; below it the embedded mark stops reading, so its opacity steps up. It is one image named "4.6 out of 5" (with `count`, "…, 2,184 reviews").',
      },
    },
  },
} satisfies Meta<typeof Rating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Values: Story = {
  name: "value",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={5} />
      <Rating value={4.6} />
      <Rating value={4.3} />
      <Rating value={2.5} />
      <Rating value={0} />
    </div>
  ),
};

export const Symbol: Story = {
  name: "symbol",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={5} variant="symbol" />
      <Rating value={4.6} variant="symbol" />
    </div>
  ),
};

export const Count: Story = {
  name: "count",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={4.6} count={2184} />
      <Rating value={4.8} variant="symbol" count={912} />
      <Rating value={4.4} count={106} size="sm" hasValue={false} />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="flex flex-wrap items-center gap-6">
      <Rating value={4.3} size="sm" />
      <Rating value={4.3} size="md" />
      <Rating value={4.3} size="lg" />
    </div>
  ),
};

export const PartialFill: Story = {
  name: "partial fill",
  render: () => (
    <div className="flex flex-wrap items-center gap-10">
      <Rating value={4.1} size="lg" />
      <Rating value={4.5} size="lg" />
      <Rating value={4.9} size="lg" />
    </div>
  ),
};

/** Where it usually lands: under an outlet name (plain elements — an atom story composes no atom). */
export const OnAnOutletCard: Story = {
  name: "on an outlet card",
  render: () => (
    <div
      data-surface="light"
      className="max-w-text-measure-prose grid gap-2 rounded-lg bg-surface-card p-4 shadow-1"
    >
      <p className="m-0 font-display text-h4 font-bold text-text-heading">
        Pink Paprikaa · Sector 57
      </p>
      <Rating value={4.6} count={2184} size="sm" />
      <p className="m-0 font-body text-caption text-text-muted">100% vegetarian kitchen</p>
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Rating, type RatingProps } from "./atoms/rating/rating";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/rating packages/ui/src/lib/brand-diamond.tsx packages/design-tokens/tokens/component
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Rating atom on a shared brand diamond

BrandDiamond is the rotated square carrying the shared SymbolMark, drawn in
its bounding box so a 4px gap puts the tips 4px apart and a clip across the
box fills an exact fraction in screen space (4.3 fills 30% of the fifth
diamond). Rating is one image named with the score and count; an impossible
score throws.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

