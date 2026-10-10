### Task 8: OfferSeal

**Files:**

- Create: `packages/design-tokens/tokens/component/offer-seal.json`
- Create: `packages/ui/src/molecules/offer-seal/offer-seal.tsx`, `offer-seal.test.tsx`, `offer-seal.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SPACING`, `RADIUS`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/offer-seal/offer-seal.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where, or the spec clause                                                                     |
| ---------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| Value, label and note printed                                          | ALREADY | test "reads as the value, the label and the note"                                             |
| The value alone when there is nothing else to say                      | ADD     | test "renders the value alone…"                                                               |
| A rupee value printed as written (`₹99`)                               | ALREADY | story `Values` (`formatRupees(99)`); axe test uses `₹130`                                     |
| Rotated diamond, text counter-rotated upright                          | ALREADY | test "is a rotated diamond…"                                                                  |
| Three flat fills, never a gradient                                     | ADD     | `not.toMatch(/gradient/)` in the tone test                                                    |
| Old classes `bg-brand-primary`, `shadow-elevation3`, `rounded-5`       | DROP    | D4 (design-system token names)                                                                |
| Fixed side per size (128 / 192 / 280)                                  | ALREADY | `size` sm 110 · md 156 · lg 260 · xl 360 (deviation 7); test "scales the whole seal…"         |
| Sits in flow until a corner is asked for                               | ALREADY | test "sits in flow when it does not bleed"                                                    |
| Hangs off each corner by a clamped offset (18% self translate)         | ALREADY | `corner` × `bleed` enum ≤ 0.18 (Review Focus 5); the arbitrary `-translate-x-[18%]` is banned |
| Caller `className` replaces its own shadow                             | ADD     | test "lets a caller className replace its own shadow"                                         |
| axe on three tones and sizes                                           | ADD     | last test renders all three                                                                   |
| Stories `Default`, `Tones`, `Sizes`, `Values`, `WithNote`, `OnACorner` | ALREADY | `Playground`, `Tones`, `Sizes`, `Values` (third seal has the note), `BleedOffCorner`          |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `componentVariants`; Tailwind v4 fraction translates (`translate-x-1/12`, `-translate-y-1/6` — verified: `supportsFractions` in `tailwindcss@4.3.3/dist/lib.js` accepts any positive-integer fraction).
- Produces: `OfferSeal`, `type OfferSealProps` (contract §6 + deviation 7). Defaults: `size = "lg"`, `tone = "light"`, `bleed = "none"`, `corner = "top-right"`. With `bleed="none"` the seal sits in flow (the parent places it); with `sm`/`md` it is absolutely placed on `corner`.

- [ ] **Step 1: Component tokens — the whole seal scales from one font size**

Every seal dimension is in `em` of the seal's own font size, so a `size` step sets one font size and the side, radius and type all follow (the design system scales everything from `size`).

Create `packages/design-tokens/tokens/component/offer-seal.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "offer-seal": {
      "$value": "10em",
      "$description": "Seal side, in em of the seal's own font size (sm 11px → 110px … xl 36px → 360px)."
    }
  },
  "radius": {
    "$type": "dimension",
    "offer-seal": {
      "$value": "1.4em",
      "$description": "0.14 × the side (design-system OfferSeal)."
    }
  },
  "text": {
    "$type": "typography",
    "offer-seal-sm": {
      "$value": { "fontSize": "11px" },
      "$description": "Side 110px — the design-system card and the display-ad kits."
    },
    "offer-seal-md": {
      "$value": { "fontSize": "15.6px" },
      "$description": "Side 156px — the handoff hero seal."
    },
    "offer-seal-lg": {
      "$value": { "fontSize": "26px" },
      "$description": "Side 260px — the design-system default for 1080px canvases."
    },
    "offer-seal-xl": {
      "$value": { "fontSize": "36px" },
      "$description": "Side 360px — the feed-post kit."
    },
    "offer-seal-value": {
      "$value": {
        "fontSize": "3em",
        "lineHeight": 1,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The number, 0.3 × side."
    },
    "offer-seal-label": {
      "$value": {
        "fontSize": "1em",
        "lineHeight": 1.2,
        "letterSpacing": "0.14em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "The uppercase word under the number, 0.1 × side."
    },
    "offer-seal-note": {
      "$value": { "fontSize": "0.65em", "lineHeight": 1.3, "fontWeight": "{font-weight.regular}" },
      "$description": "The small note, 0.065 × side."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts` append: to `TEXT` `"offer-seal-sm", "offer-seal-md", "offer-seal-lg", "offer-seal-xl", "offer-seal-value", "offer-seal-label", "offer-seal-note",`; to `SPACING` `"offer-seal",`; to `RADIUS` `"offer-seal",`.

Append to `groups` in `packages/design-tokens/contrast-pairs.json`:

```json
{
  "id": "offer-seal",
  "surface": null,
  "pairs": [
    ["color-pink-600", "color-ink-000"],
    ["color-ink-900", "color-turmeric"]
  ],
  "min": 4.5
},
{
  "id": "offer-seal-brand",
  "surface": null,
  "pairs": [["color-ink-000", "color-pink-500"]],
  "min": 3,
  "exception": "brand-fill"
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS; `theme.css` has `--spacing-offer-seal: 10em;`, `--radius-offer-seal: 1.4em;`, `--text-offer-seal-value: 3em;` with its sub-properties.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/offer-seal/offer-seal.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OfferSeal } from "./offer-seal";

const CORNERS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

/** The seal's outward offset per axis, read from its `translate-{x,y}-a/b` classes. */
function bleedFractions(seal: Element | null): number[] {
  const classes = seal?.getAttribute("class") ?? "";
  return [...classes.matchAll(/translate-[xy]-(\d+)\/(\d+)/g)].map(
    (match) => Number(match[1]) / Number(match[2])
  );
}

describe("OfferSeal", () => {
  it("reads as the value, the label and the note", () => {
    render(<OfferSeal value="50%" label="Off" note="till 11:30pm" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.getByText("till 11:30pm")).toBeInTheDocument();
  });

  it("renders the value alone when there is nothing else to say", () => {
    const { container } = render(<OfferSeal value="1+1" />);
    expect(container.firstElementChild).toHaveTextContent(/^1\+1$/);
  });

  it("is a rotated diamond, never a circle, with the text counter-rotated upright", () => {
    const { container } = render(<OfferSeal value="1+1" label="Free" />);
    expect(container.firstElementChild).toHaveClass("rotate-45", "rounded-offer-seal");
    expect(screen.getByText("1+1").parentElement).toHaveClass("-rotate-45");
  });

  it.each([
    ["sm", "text-offer-seal-sm"],
    ["md", "text-offer-seal-md"],
    ["lg", "text-offer-seal-lg"],
    ["xl", "text-offer-seal-xl"],
  ] as const)("scales the whole seal from one size step (%s)", (size, sizeClass) => {
    const { container } = render(<OfferSeal value="50%" size={size} />);
    expect(container.firstElementChild).toHaveClass(sizeClass, "size-offer-seal");
  });

  it.each([
    ["light", "bg-ink-000", "text-pink-600"],
    ["brand", "bg-pink-500", "text-ink-000"],
    ["turmeric", "bg-turmeric", "text-ink-900"],
  ] as const)("paints the %s tone", (tone, background, text) => {
    const { container } = render(<OfferSeal value="50%" tone={tone} />);
    expect(container.firstElementChild).toHaveClass(background, text);
    // One flat fill — never a gradient, never a starburst.
    expect(container.firstElementChild?.getAttribute("class")).not.toMatch(/gradient/);
  });

  it("sits in flow when it does not bleed", () => {
    const { container } = render(<OfferSeal value="50%" />);
    expect(container.firstElementChild).not.toHaveClass("absolute");
    expect(bleedFractions(container.firstElementChild)).toEqual([]);
  });

  it.each(CORNERS)(
    "never bleeds a corner further than 0.18 × its side (%s) — the value reaches 0.32 × side from the centre",
    (corner) => {
      for (const bleed of ["sm", "md"] as const) {
        const { container, unmount } = render(
          <OfferSeal value="50%" label="Off" corner={corner} bleed={bleed} />
        );
        const fractions = bleedFractions(container.firstElementChild);
        expect(container.firstElementChild).toHaveClass("absolute");
        expect(fractions).toHaveLength(2);
        for (const fraction of fractions) expect(fraction).toBeLessThanOrEqual(0.18);
        unmount();
      }
    }
  );

  it("lets a caller className replace its own shadow", () => {
    const { container } = render(<OfferSeal value="50%" className="shadow-2" />);
    expect(container.firstElementChild).toHaveClass("shadow-2");
    expect(container.firstElementChild).not.toHaveClass("shadow-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <OfferSeal value="₹130" label="Launch" tone="brand" size="md" />
        <OfferSeal value="50%" label="Off" note="till 11:30pm" tone="light" size="lg" />
        <OfferSeal value="1+1" label="Free" tone="turmeric" size="sm" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- offer-seal 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./offer-seal`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/offer-seal/offer-seal.tsx`:

```tsx
import type { ComponentProps } from "react";

import { componentVariants } from "../../lib/component-variants";

const offerSeal = componentVariants({
  slots: {
    root: "size-offer-seal rounded-offer-seal grid shrink-0 rotate-45 place-items-center shadow-3",
    content: "grid -rotate-45 gap-0.5 text-center",
    value: "text-offer-seal-value font-display",
    label: "text-offer-seal-label font-display uppercase",
    note: "text-offer-seal-note font-body",
  },
  variants: {
    size: {
      sm: { root: "text-offer-seal-sm" },
      md: { root: "text-offer-seal-md" },
      lg: { root: "text-offer-seal-lg" },
      xl: { root: "text-offer-seal-xl" },
    },
    tone: {
      light: { root: "bg-ink-000 text-pink-600" },
      brand: { root: "bg-pink-500 text-ink-000" },
      turmeric: { root: "bg-turmeric text-ink-900" },
    },
    bleed: { none: {}, sm: { root: "absolute" }, md: { root: "absolute" } },
    corner: { "top-right": {}, "top-left": {}, "bottom-right": {}, "bottom-left": {} },
  },
  // Bleed is a fraction of the seal's own side. The counter-rotated value reaches 0.32 × side from
  // the centre, so an offset past 0.18 × side clips it (design-system readme §4b): the only steps
  // are 1/12 and 1/6, which is the design system's clamp made a compile-time guarantee.
  compoundVariants: [
    {
      bleed: "sm",
      corner: "top-right",
      class: { root: "top-0 right-0 translate-x-1/12 -translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "top-left",
      class: { root: "top-0 left-0 -translate-x-1/12 -translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "bottom-right",
      class: { root: "right-0 bottom-0 translate-x-1/12 translate-y-1/12" },
    },
    {
      bleed: "sm",
      corner: "bottom-left",
      class: { root: "bottom-0 left-0 -translate-x-1/12 translate-y-1/12" },
    },
    {
      bleed: "md",
      corner: "top-right",
      class: { root: "top-0 right-0 translate-x-1/6 -translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "top-left",
      class: { root: "top-0 left-0 -translate-x-1/6 -translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "bottom-right",
      class: { root: "right-0 bottom-0 translate-x-1/6 translate-y-1/6" },
    },
    {
      bleed: "md",
      corner: "bottom-left",
      class: { root: "bottom-0 left-0 -translate-x-1/6 translate-y-1/6" },
    },
  ],
});

export interface OfferSealProps extends ComponentProps<"div"> {
  /** The number — "50%", "₹99" (format with formatRupees), "1+1". */
  value: string;
  /** Short word under it, e.g. "Off" (rendered uppercase). */
  label?: string | undefined;
  note?: string | undefined;
  /** Side: sm 110 · md 156 (handoff hero) · lg 260 (1080 canvases) · xl 360px. */
  size?: "sm" | "md" | "lg" | "xl" | undefined;
  tone?: "light" | "brand" | "turmeric" | undefined;
  /** Where the seal hangs off its container when it bleeds. */
  corner?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | undefined;
  /** How far past the corner: 1/12 or 1/6 of the side. The container needs `relative`. */
  bleed?: "none" | "sm" | "md" | undefined;
}

/** Offer badge for posts, stories and banners — a rotated brand diamond, never a starburst. */
export function OfferSeal({
  value,
  label,
  note,
  size = "lg",
  tone = "light",
  corner = "top-right",
  bleed = "none",
  className,
  ...props
}: OfferSealProps) {
  const styles = offerSeal({ size, tone, corner, bleed });
  return (
    <div className={styles.root({ className })} {...props}>
      <div className={styles.content()}>
        <span className={styles.value()}>{value}</span>
        {label ? <span className={styles.label()}>{label}</span> : null}
        {note ? <span className={styles.note()}>{note}</span> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- offer-seal 2>&1 | tail -8`
Expected: PASS (17 tests).

- [ ] **Step 6: Stories — `OfferSeal.card.html` rows "tone" and "value", the handoff hero seal, sizes, and the bleed geometry check**

`packages/ui/src/molecules/offer-seal/offer-seal.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OfferSeal } from "./offer-seal";

const CORNERS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

const meta = {
  title: "Molecules/OfferSeal",
  component: OfferSeal,
  args: { value: "50%", label: "Off", size: "sm" },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Offer badge for posts, stories and banners — a rotated brand diamond, never a circular starburst. One per artboard. Use `bleed` (with `corner`) to hang it off the canvas edge: the only offsets are 1/12 and 1/6 of the side, because the number reaches ~0.32 × side from the centre and must never be clipped. Text counter-rotates so it stays upright. The container needs `relative` (and `overflow-hidden` for a canvas).",
      },
    },
  },
} satisfies Meta<typeof OfferSeal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone". */
export const Tones: Story = {
  render: (args) => (
    <div className="flex items-center gap-7.5 py-4.5">
      <OfferSeal {...args} tone="light" />
      <OfferSeal {...args} tone="brand" />
      <OfferSeal {...args} tone="turmeric" />
    </div>
  ),
};

/** Card row "value". */
export const Values: Story = {
  render: (args) => (
    <div className="flex items-center gap-7.5 py-4.5">
      <OfferSeal {...args} value={formatRupees(99)} label="Only" />
      <OfferSeal {...args} value="1+1" label="Free" />
      <OfferSeal {...args} value="50%" label="Off" note="till 11:30pm" />
    </div>
  ),
};

/** The handoff hero seal (Home): 156px, brand, launch price. */
export const HandoffHero: Story = {
  args: { size: "md", tone: "brand", value: formatRupees(130), label: "Launch" },
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-16 p-10">
      {(["sm", "md", "lg", "xl"] as const).map((size) => (
        <OfferSeal key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

/** Every corner bled the maximum on a 400px board: the value must stay fully on the board. */
export const BleedOffCorner: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-6">
      {CORNERS.map((corner) => (
        <div
          key={corner}
          data-testid={`board-${corner}`}
          data-surface="brand"
          className="relative h-100 w-100 overflow-hidden rounded-lg bg-surface-brand"
        >
          <OfferSeal {...args} size="lg" corner={corner} bleed="md" />
        </div>
      ))}
    </div>
  ),
  play: async ({ canvas }) => {
    for (const corner of CORNERS) {
      const board = canvas.getByTestId(`board-${corner}`).getBoundingClientRect();
      const [valueNode] = canvas
        .getAllByText("50%")
        .filter((node) => canvas.getByTestId(`board-${corner}`).contains(node));
      const value = valueNode?.getBoundingClientRect();
      await expect(value).toBeDefined();
      if (value === undefined) return;
      await expect(value.top).toBeGreaterThanOrEqual(board.top);
      await expect(value.left).toBeGreaterThanOrEqual(board.left);
      await expect(value.right).toBeLessThanOrEqual(board.right);
      await expect(value.bottom).toBeLessThanOrEqual(board.bottom);
    }
  },
};
```

- [ ] **Step 7: Export**

```ts
export { OfferSeal, type OfferSealProps } from "./molecules/offer-seal/offer-seal";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/offer-seal.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/offer-seal packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`; then run the geometry check in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- offer-seal 2>&1 | tail -10
```

Expected: the OfferSeal stories pass, including `BleedOffCorner`'s play.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/offer-seal.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/offer-seal packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): OfferSeal molecule

The brand's rotated-diamond offer badge. Every dimension is in em of one
size token, so sm/md/lg/xl (110/156/260/360px) scale the whole seal.
Bleed is an enum of 1/12 or 1/6 of the side, so the 0.18 x side clamp
that keeps the value on the board is guaranteed by the type; a story
play checks the geometry in Chromium. Label and note keep full colour
for AA.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

