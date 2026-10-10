### Task 10: ProgressBar

**Files:**

- Create: `packages/design-tokens/tokens/component/progress-bar.json`
- Modify: `packages/design-tokens/tokens/primitive/color.json`
- Create: `packages/ui/src/atoms/progress-bar/progress-bar.tsx`, `progress-bar.test.tsx`, `progress-bar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/progress-bar/progress-bar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                | Ruling  | Where / clause                                                                                   |
| ------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------ |
| Radix Progress                                          | DROP    | D7 (Radix only for Dialog/Sheet, Tabs, Tooltip, Toast, ToggleGroup): native `role="progressbar"` |
| `aria-valuenow` / `aria-valuemax`                       | ALREADY | Step 2                                                                                           |
| named by the visible label                              | ALREADY | Step 2                                                                                           |
| no caption → `aria-label`                               | ALREADY | `label` is required (contract §3); `isLabelHidden` (deviation 3)                                 |
| fills by the real share of any `max`                    | ADD     | Step 2 new test (`max={200}`)                                                                    |
| an overshooting value clamps                            | ALREADY | Step 2                                                                                           |
| one stamp per segment, earned ones filled               | ALREADY | Step 2                                                                                           |
| the segment count is the scale, ignoring `max`          | ADD     | Step 2 new test                                                                                  |
| a fractional segment count (dev rounds it)              | ADD     | Step 4 throws `RangeError` (plan rule: impossible input throws); Step 2 test                     |
| a segmented track gaps, a continuous one clips          | ALREADY | one segment shape                                                                                |
| tones brand / mint / inverse                            | ALREADY | Step 2                                                                                           |
| size lg (12px)                                          | DROP    | contract §3 `size?: "sm" \| "md"` (plan "Decisions")                                             |
| inverse label on the on-brand colour                    | ALREADY | the label is `text-text-muted`, which follows the surface (D5)                                   |
| `value` optional (= 0)                                  | DROP    | contract §3 `value: number` is required                                                          |
| caller `className` on the root, replacing a conflict    | ADD     | Step 2 new test                                                                                  |
| axe over stamps, continuous, mint                       | ADD     | Step 2 a11y test                                                                                 |
| stories default / segments / continuous / tones / sizes | ALREADY | Step 6                                                                                           |
| story: an inverse continuous bar beside the stamps      | ADD     | Step 6 `Inverse`                                                                                 |
| story: six stamps fit the 360px floor                   | ADD     | Step 6 `Narrow`                                                                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `componentVariants`, `useId`.
- Produces: `ProgressBar`, `ProgressBarProps` as contract §3, plus `isLabelHidden?: boolean` (deviation 3). `role="progressbar"` named by the label (`aria-labelledby`); with `segments`, `value` counts stamps, the max is `segments` and `aria-valuetext` reads "3 of 6"; values clamp into `0…max`; a non-finite value, a max ≤ 0 or a fractional `segments` throws `RangeError`.

- [ ] **Step 1: Component tokens**

In `packages/design-tokens/tokens/primitive/color.json`, inside `color.white-alpha`, insert between `"25"` and `"30"`:

```json
      "28": {
        "$value": "rgba(255, 255, 255, 0.28)",
        "$description": "The inverse progress track (design system ProgressBar)."
      },
```

`packages/design-tokens/tokens/component/progress-bar.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "progress-sm": { "$value": "6px", "$description": "Bar height inside a LoyaltyCard." },
    "progress-md": { "$value": "8px", "$description": "The default bar height." }
  },
  "text": {
    "$type": "typography",
    "progress-label": { "$value": { "fontSize": "13.5px" } }
  }
}
```

Append to `SPACING`: `"progress-sm", "progress-md"`; to `TEXT`: `"progress-label"`. The 5px gap between stamps is the quarter step `gap-1.25`.

Contrast: no new pair. The label paints `text-text-muted`, asserted on light, soft, ink and brand grounds (on brand it is `white-alpha-92`, which replaces the design system's `rgba(255,255,255,.8)` inverse label — spec §3.2.2).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/progress-bar/progress-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("shows loyalty stamps: one segment per stamp, the earned ones filled", () => {
    render(<ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />);
    const bar = screen.getByRole("progressbar", { name: "3 more visits and chai's on us" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "6");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuetext", "3 of 6");
    expect(bar.children).toHaveLength(6);
    expect([...bar.children].filter((segment) => segment.childElementCount > 0)).toHaveLength(3);
  });

  it("fills a continuous bar to the value's share of max", () => {
    render(<ProgressBar label="Checkout" value={70} />);
    const bar = screen.getByRole("progressbar", { name: "Checkout" });
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "70");
    expect(bar).not.toHaveAttribute("aria-valuetext");
    expect(bar.querySelector("[style]")).toHaveAttribute("style", "width: 70%;");
  });

  it.each([
    [140, "100", "width: 100%;"],
    [-20, "0", "width: 0%;"],
  ])("clamps %d into the track", (value, now, width) => {
    render(<ProgressBar label="Checkout" value={value} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", now);
    expect(bar.querySelector("[style]")).toHaveAttribute("style", width);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects the value %d it cannot draw",
    (value) => {
      expect(() => renderToString(<ProgressBar label="Checkout" value={value} />)).toThrow(
        RangeError
      );
    }
  );

  it("rejects a max it cannot divide by", () => {
    expect(() => renderToString(<ProgressBar label="Checkout" value={0} max={0} />)).toThrow(
      RangeError
    );
  });

  it("rejects a segment count that is not a whole number", () => {
    expect(() => renderToString(<ProgressBar label="Visits" value={1} segments={2.5} />)).toThrow(
      RangeError
    );
  });

  it("fills by the real share of any max", () => {
    render(<ProgressBar label="Upload" value={50} max={200} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "200");
    expect(bar.querySelector("[style]")).toHaveAttribute("style", "width: 25%;");
  });

  it("makes the segment count the scale, ignoring max", () => {
    render(<ProgressBar label="Visits" max={100} segments={6} value={4} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "6");
    expect(bar).toHaveAttribute("aria-valuenow", "4");
  });

  it("merges a caller className onto the root, replacing a conflicting class", () => {
    const { container } = render(<ProgressBar label="Upload" value={50} className="gap-6" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("can hide its label visually and keep the name", () => {
    render(<ProgressBar label="Upload" value={45} isLabelHidden />);
    expect(screen.getByText("Upload")).toHaveClass("sr-only");
    expect(screen.getByRole("progressbar", { name: "Upload" })).toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-pink-200", "bg-pink-500"],
    ["mint", "bg-pink-200", "bg-mint"],
    ["inverse", "bg-white-alpha-28", "bg-ink-000"],
  ] as const)("paints tone %s: %s track, %s fill", (tone, track, fill) => {
    render(<ProgressBar label="Visits" segments={2} value={1} tone={tone} />);
    const [earned] = screen.getByRole("progressbar").children;
    expect(earned).toHaveClass(track);
    expect(earned?.firstElementChild).toHaveClass(fill);
  });

  it.each([
    ["sm", "h-progress-sm"],
    ["md", "h-progress-md"],
  ] as const)("renders size %s at %s", (size, height) => {
    render(<ProgressBar label="Visits" value={1} size={size} />);
    expect(screen.getByRole("progressbar")).toHaveClass(height);
  });

  it("has no accessibility violations as stamps, continuous and a hidden-label mint bar", async () => {
    const { container } = render(
      <>
        <ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />
        <ProgressBar label="Uploading your photo" value={70} />
        <ProgressBar label="Kitchen prep" value={45} tone="mint" isLabelHidden />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './progress-bar'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/progress-bar/progress-bar.tsx`:

```tsx
import { type ComponentProps, useId } from "react";

import { componentVariants } from "../../lib/component-variants";

/**
 * A continuous bar is one track segment holding a fill; a stamp bar is N segments, the earned
 * ones holding a full fill. One shape, one set of tone colours, both modes.
 */
const progressBar = componentVariants({
  slots: {
    root: "grid gap-2",
    label: "text-progress-label font-body text-text-muted",
    track: "flex w-full gap-1.25",
    segment: "flex-1 overflow-hidden rounded-pill",
    bar: "block h-full rounded-pill transition-all duration-slow ease-out",
    stamp:
      "block size-full rounded-pill transition-opacity duration-base ease-out starting:opacity-0",
  },
  variants: {
    tone: {
      brand: { segment: "bg-pink-200", bar: "bg-pink-500", stamp: "bg-pink-500" },
      mint: { segment: "bg-pink-200", bar: "bg-mint", stamp: "bg-mint" },
      inverse: { segment: "bg-white-alpha-28", bar: "bg-ink-000", stamp: "bg-ink-000" },
    },
    size: {
      sm: { track: "h-progress-sm" },
      md: { track: "h-progress-md" },
    },
    isLabelHidden: { true: { label: "sr-only" } },
  },
  defaultVariants: { tone: "brand", size: "md", isLabelHidden: false },
});

export interface ProgressBarProps extends ComponentProps<"div"> {
  /** Progress so far — or, with `segments`, the number of stamps earned. */
  value: number;
  /** = 100. Ignored with `segments`. */
  max?: number | undefined;
  /** Draw N discrete stamps (the loyalty pattern) instead of a continuous bar. */
  segments?: number | undefined;
  /** The progressbar's accessible name; visible unless `isLabelHidden`. */
  label: string;
  /** `inverse` on pink or ink panels. = "brand" */
  tone?: "brand" | "mint" | "inverse" | undefined;
  /** sm 6px (inside a LoyaltyCard) · md 8px. = "md" */
  size?: "sm" | "md" | undefined;
  /** Hides the label visually; it stays the accessible name. */
  isLabelHidden?: boolean | undefined;
}

/** Loyalty stamps and checkout/upload progress: pink-200 track, pink-500 fill. */
export function ProgressBar({
  value,
  max = 100,
  segments,
  label,
  tone,
  size,
  isLabelHidden,
  className,
  ...props
}: ProgressBarProps) {
  const labelId = useId();
  const total = segments ?? max;
  if (
    !Number.isFinite(value) ||
    !(total > 0) ||
    (segments !== undefined && !Number.isInteger(segments))
  ) {
    throw new RangeError(
      `ProgressBar: needs a finite value, a max above 0 and whole segments, got ${String(value)} of ${String(total)}`
    );
  }
  const current = Math.min(Math.max(value, 0), total);
  const styles = progressBar({ tone, size, isLabelHidden });

  return (
    <div className={styles.root({ className })} {...props}>
      <span id={labelId} className={styles.label()}>
        {label}
      </span>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={
          segments === undefined ? undefined : `${String(current)} of ${String(segments)}`
        }
        className={styles.track()}
      >
        {segments === undefined ? (
          <span className={styles.segment()}>
            <span
              className={styles.bar()}
              style={{ width: `${String((current / total) * 100)}%` }}
            />
          </span>
        ) : (
          Array.from({ length: segments }, (_, index) => (
            <span key={index} className={styles.segment()}>
              {index < current ? <span className={styles.stamp()} /> : null}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `ProgressBar.card.html`; docs from `ProgressBar.prompt.md`)**

`packages/ui/src/atoms/progress-bar/progress-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Atoms/ProgressBar",
  component: ProgressBar,
  args: { label: "3 more visits and chai's on us", value: 3 },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <ProgressBar {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Loyalty stamps and order progress. Segmented is the loyalty pattern (`segments` + `value` = stamps earned); continuous is for checkout steps and uploads. `pink-200` track, `pink-500` fill; `tone="inverse"` on pink or ink panels, `tone="mint"` for a finished-feeling task. `label` always names the bar; `isLabelHidden` keeps it off screen.',
      },
    },
  },
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { args: { segments: 6 } };

export const Segments: Story = { name: "segments", args: { segments: 6 } };

export const Continuous: Story = {
  name: "continuous",
  args: { label: "Checkout", value: 70, isLabelHidden: true },
};

export const ToneMint: Story = {
  name: "tone",
  args: { label: "Upload", value: 45, tone: "mint", isLabelHidden: true },
};

export const Inverse: Story = {
  name: "inverse",
  render: () => (
    <div
      data-surface="brand"
      className="max-w-text-measure-prose grid w-full gap-4 rounded-lg bg-surface-brand p-4"
    >
      <ProgressBar label="4 of 6 visits" segments={6} value={4} tone="inverse" isLabelHidden />
      <ProgressBar label="Uploading your photo" value={70} tone="inverse" />
    </div>
  ),
};

/** The smallest supported width: six stamps still fit a 320px column without wrapping. */
export const Narrow: Story = {
  name: "six stamps at 360px",
  render: () => (
    <div className="w-80">
      <ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />
    </div>
  ),
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-4">
      <ProgressBar label="Loyalty card, sm" segments={6} value={3} size="sm" />
      <ProgressBar label="Loyalty card, md" segments={6} value={3} size="md" />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { ProgressBar, type ProgressBarProps } from "./atoms/progress-bar/progress-bar";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/progress-bar packages/design-tokens/tokens
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the ProgressBar atom — loyalty stamps and continuous progress

One segment shape serves both modes: a continuous bar is one segment with a
width-driven fill, a stamp bar is N segments with the earned ones filled.
Named by its label, clamped into range, and a value it cannot draw throws.
Adds white-alpha-28, the design system's inverse track.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

