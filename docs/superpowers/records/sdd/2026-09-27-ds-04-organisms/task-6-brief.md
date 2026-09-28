### Task 6: QuotePanel

**Dev reference:** none (handoff component)

**Files:**

- Create: `packages/design-tokens/tokens/component/quote-panel.json`
- Create: `packages/ui/src/organisms/quote-panel/quote-panel.tsx`, `quote-panel.test.tsx`, `quote-panel.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `PatternField`, `Text`, `KeyValueList`/`KeyValueItem` (Plan 3b — without `keyWidth` its rows put key and value at either end, muted key and strong value, and `isEmphasised` picks a value out in the brand colour: exactly the quote lines), `componentVariants`, `headingTag`; stories: `Alert`, `Badge`, `Button`.
- Produces: `QuotePanel`, `QuotePanelProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/quote-panel.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "quote-panel-pad": {
      "$value": "clamp(18px, 3vw, 28px)",
      "$description": "QuotePanel padding (handoff Plan, Dawat and Office calculators)."
    }
  },
  "text": {
    "$type": "typography",
    "quote-panel-amount": {
      "$value": {
        "fontSize": "clamp(44px, 6vw, 60px)",
        "lineHeight": 1,
        "letterSpacing": "-0.03em",
        "fontWeight": "{font-weight.black}"
      },
      "$description": "The estimate's big number (handoff PlanCalculator)."
    }
  }
}
```

Append to `SPACING`:

```ts
  "quote-panel-pad",
```

Append to `TEXT`:

```ts
  "quote-panel-amount",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/quote-panel/quote-panel.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { QuotePanel } from "./quote-panel";

/** Handoff PlanCalculator: Classic, Weekday plan, lunch, one person, launch price on. */
const PLAN = {
  title: "Classic · Weekday plan",
  badge: <span>Launch price</span>,
  amount: "₹130",
  unit: "a meal",
  was: "₹140",
  lines: [
    { key: "₹130 × 24 meals", value: "₹3,120" },
    { key: "Offer: free meals (1)", value: "₹0" },
    { key: "GST 5%", value: "₹156" },
    { key: "Meals delivered", value: "25" },
  ],
  total: { label: "Total", value: "₹3,276" },
  note: "Delivery free within 3 km · no packaging or platform fee",
};

describe("QuotePanel", () => {
  it("is a region named by its title, a level-3 heading by default", () => {
    render(<QuotePanel {...PLAN} />);
    expect(screen.getByRole("region", { name: PLAN.title })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: PLAN.title })).toBeInTheDocument();
  });

  it("shows the amount and unit, and announces the struck price as the old one", () => {
    const { container } = render(<QuotePanel {...PLAN} />);
    expect(screen.getByText("₹130")).toBeInTheDocument();
    expect(screen.getByText("a meal")).toBeInTheDocument();
    expect(container.querySelector("s")).toHaveTextContent("Was ₹140");
  });

  it("lists every line as a term and its value, then the total", () => {
    render(<QuotePanel {...PLAN} />);
    const gst = screen.getByText("GST 5%");
    expect(gst.tagName).toBe("DT");
    expect(gst.nextElementSibling).toHaveTextContent("₹156");
    const total = screen.getByText("Total");
    expect(total.tagName).toBe("DT");
    expect(total.nextElementSibling).toHaveTextContent("₹3,276");
  });

  it("picks an emphasised line out in the brand colour, as KeyValueList does", () => {
    render(
      <QuotePanel
        tone="ink"
        title="Your Dawat estimate"
        amount="₹6,269"
        lines={[{ key: "50% to hold the date", value: "₹3,135", isEmphasised: true }]}
      />
    );
    expect(screen.getByText("₹3,135")).toHaveClass("text-text-brand");
  });

  it.each(["brand", "ink", "light"] as const)("sets the %s surface", (tone) => {
    render(<QuotePanel {...PLAN} tone={tone} />);
    expect(screen.getByRole("region")).toHaveAttribute("data-surface", tone);
  });

  it("floods only the brand tone with the diamond", () => {
    const { container, rerender } = render(<QuotePanel {...PLAN} tone="brand" />);
    const layer = () => container.querySelector('section > [aria-hidden="true"]');
    expect(layer()).toBeInTheDocument();
    rerender(<QuotePanel {...PLAN} tone="ink" />);
    expect(layer()).not.toBeInTheDocument();
  });

  it("renders the note, alerts, action and footnote in that order", () => {
    const { container } = render(
      <QuotePanel
        {...PLAN}
        alerts={<p>You save ₹2,880</p>}
        action={<a href="#send">Send this plan on WhatsApp</a>}
        footnote="We confirm within the hour."
      />
    );
    const text = container.textContent ?? "";
    const positions = [
      "Delivery free",
      "You save ₹2,880",
      "Send this plan",
      "We confirm within the hour.",
    ].map((fragment) => text.indexOf(fragment));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("renders no summary list without lines or a total", () => {
    const { container } = render(<QuotePanel title="Estimate" amount="₹99,792" />);
    expect(container.querySelector("dl")).not.toBeInTheDocument();
  });

  it("takes its heading level from headingLevel", () => {
    render(<QuotePanel {...PLAN} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: PLAN.title })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <QuotePanel {...PLAN} action={<a href="#send">Send this plan on WhatsApp</a>} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- quote-panel 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./quote-panel`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/quote-panel/quote-panel.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";
import { type KeyValueItem, KeyValueList } from "../../molecules/key-value-list/key-value-list";

const quotePanel = componentVariants({
  slots: {
    root: "p-quote-panel-pad relative overflow-hidden rounded-xl",
    pattern: "absolute inset-0",
    body: "relative flex flex-col gap-4",
    header: "flex flex-wrap items-start justify-between gap-3",
    price: "flex flex-wrap items-baseline gap-x-2.5 gap-y-1",
    amount: "text-quote-panel-amount font-display text-text-heading",
    unit: "text-body-sm text-text-muted",
    was: "text-body-sm text-text-muted line-through",
    lines: "border-t border-border-subtle pt-1.5",
    total:
      "flex justify-between gap-3 border-t border-border-subtle pt-2.5 font-display text-h4 font-black text-text-heading",
    note: "text-caption text-text-muted",
    alerts: "flex flex-col gap-2",
    action: "flex flex-col gap-2",
    footnote: "text-center text-caption text-text-muted",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      // The Dawat and Office quotes set their lines in mono (handoff).
      ink: { root: "bg-surface-inverse", lines: "font-mono" },
      light: { root: "bg-surface-card", lines: "font-mono" },
    },
  },
  defaultVariants: { tone: "brand" },
});

type QuoteTone = NonNullable<VariantProps<typeof quotePanel>["tone"]>;

/** Title colour: white on brand and pink-300 on ink (both `brand` there), ink-600 on the white card. */
const TITLE_TONE: Readonly<Record<QuoteTone, "brand" | "muted">> = {
  brand: "brand",
  ink: "brand",
  light: "muted",
};

export interface QuotePanelProps
  extends Omit<ComponentProps<"section">, "title">, Pick<VariantProps<typeof quotePanel>, "tone"> {
  /** The overline title, e.g. "Classic · Weekday plan". */
  title: ReactNode;
  badge?: ReactNode;
  /** The big number, already formatted ("₹130"). */
  amount: ReactNode;
  unit?: ReactNode;
  /** The struck regular price, already formatted. */
  was?: ReactNode;
  /** Read before the struck price by screen readers, which do not announce strike-through. */
  wasLabel?: string | undefined;
  lines?: KeyValueItem[] | undefined;
  total?: { label: ReactNode; value: ReactNode } | undefined;
  note?: ReactNode;
  /** Warnings and offers — usually Alerts. */
  alerts?: ReactNode;
  /** Usually one full-width `size="lg"` Button. */
  action?: ReactNode;
  footnote?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The estimate panel of the Plan, Dawat and Office calculators: brand pink with the diamond,
 * ink, or a white card (a light island inside an ink section). Shows numbers it is given — the
 * pricing logic lives in the app.
 */
export function QuotePanel({
  tone = "brand",
  title,
  badge,
  amount,
  unit,
  was,
  wasLabel = "Was",
  lines = [],
  total,
  note,
  alerts,
  action,
  footnote,
  headingLevel = 3,
  className,
  ...props
}: QuotePanelProps) {
  const titleId = useId();
  const slots = quotePanel({ tone });
  return (
    <section
      data-surface={tone}
      aria-labelledby={titleId}
      className={slots.root({ className })}
      {...props}
    >
      {tone === "brand" ? (
        <PatternField aria-hidden tone="brand" tile={64} className={slots.pattern()} />
      ) : null}
      <div className={slots.body()}>
        <div className={slots.header()}>
          <Text
            as={headingTag(headingLevel)}
            id={titleId}
            variant="overline"
            tone={TITLE_TONE[tone]}
          >
            {title}
          </Text>
          {badge}
        </div>
        <div className={slots.price()}>
          <span className={slots.amount()}>{amount}</span>
          {unit ? <span className={slots.unit()}>{unit}</span> : null}
          {was ? (
            <s className={slots.was()}>
              <span className="sr-only">{wasLabel} </span>
              {was}
            </s>
          ) : null}
        </div>
        {lines.length > 0 ? (
          <KeyValueList
            items={lines}
            density="compact"
            hasDividers={false}
            className={slots.lines()}
          />
        ) : null}
        {total ? (
          <dl className={slots.total()}>
            <dt>{total.label}</dt>
            <dd>{total.value}</dd>
          </dl>
        ) : null}
        {note ? <div className={slots.note()}>{note}</div> : null}
        {alerts ? <div className={slots.alerts()}>{alerts}</div> : null}
        {action ? <div className={slots.action()}>{action}</div> : null}
        {footnote ? <div className={slots.footnote()}>{footnote}</div> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- quote-panel 2>&1 | tail -8`
Expected: PASS (12 tests).

- [ ] **Step 6: Stories (the three handoff calculators)**

Numbers are the handoff calculators' own outputs for their default states (`rates.js`): Plan — Classic launch ₹130 × 24 = ₹3,120 + GST ₹156; Dawat — Signature ₹199 × 30 = ₹5,970 + GST ₹299 = ₹6,269; Office — Everyday ₹99 × 40 × 24 = ₹95,040 + GST ₹4,752 = ₹99,792.

`packages/ui/src/organisms/quote-panel/quote-panel.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Utensils } from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { Alert } from "../../molecules/alert/alert";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { QuotePanel } from "./quote-panel";

const meta = {
  title: "Organisms/QuotePanel",
  component: QuotePanel,
  args: {
    tone: "brand",
    title: "Classic · Weekday plan",
    badge: <Badge tone="soft">Launch price</Badge>,
    amount: "₹130",
    unit: "a meal",
    was: "₹140",
    lines: [
      { key: "₹130 × 24 meals", value: "₹3,120" },
      { key: "Offer: free meals (1)", value: "₹0" },
      { key: "GST 5%", value: "₹156" },
      { key: "Meals delivered", value: "25" },
    ],
    total: { label: "Total", value: "₹3,276" },
    note: "Delivery free within 3 km · no packaging or platform fee",
    alerts: (
      <Alert tone="neutral">
        You save ₹2,880 vs ordering the same meals on a food app at ₹250+.
      </Alert>
    ),
    action: (
      <Button asChild variant="inverse" size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Send this plan on WhatsApp</a>
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div className="max-w-100">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'The estimate panel of the handoff\'s Plan, Dawat and Office calculators. `tone="brand"` is flooded pink with the diamond; `ink` is the Dawat panel; `light` is the white card on an ink section (a light island — text goes dark again). It renders the numbers it is given; pricing logic stays in the app.',
      },
    },
  },
} satisfies Meta<typeof QuotePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Handoff PlanCalculator — brand panel. */
export const HandoffPlan: Story = {};

/** Handoff DawatCalculator — ink panel. */
export const HandoffDawat: Story = {
  args: {
    tone: "ink",
    title: "Your Dawat estimate",
    badge: undefined,
    amount: "₹6,269",
    unit: "₹209 a head · 30 guests · incl. GST",
    was: undefined,
    lines: [
      { key: "Signature Dawat ₹199 × 30", value: "₹5,970" },
      { key: "GST 5%", value: "₹299" },
      { key: "50% to hold the date", value: "₹3,135" },
    ],
    total: undefined,
    note: undefined,
    alerts: (
      <Alert tone="neutral" icon={Utensils}>
        Taste first: one Dawat at ₹199, credited in full when you confirm.
      </Alert>
    ),
    action: (
      <Button asChild size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Check my date on WhatsApp</a>
      </Button>
    ),
    footnote: "We confirm within the hour. 50% holds the date, balance on delivery.",
  },
};

/** Handoff OfficeLunch — white card on the ink quote section. */
export const HandoffOffice: Story = {
  args: {
    tone: "light",
    title: "Estimated per cycle",
    badge: undefined,
    amount: "₹99,792",
    unit: undefined,
    was: undefined,
    lines: [
      { key: "Everyday", value: "₹99 × 40" },
      { key: "Meals each", value: "24" },
      { key: "Subtotal", value: "₹95,040" },
      { key: "GST 5%", value: "₹4,752" },
    ],
    total: undefined,
    note: undefined,
    alerts: undefined,
    action: (
      <Button asChild size="lg" icon={MessageCircle} isFullWidth>
        <a href={BRAND.whatsappHref}>Send me this quote</a>
      </Button>
    ),
    footnote: (
      <Button asChild variant="ghost" isFullWidth>
        <a href={BRAND.whatsappHref}>Taste it first — free office tasting</a>
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div data-surface="ink" className="bg-surface-inverse p-6">
        <Story />
      </div>
    ),
  ],
};

export const AmountOnly: Story = {
  args: {
    badge: undefined,
    was: undefined,
    lines: [],
    total: undefined,
    note: undefined,
    alerts: undefined,
  },
};

export const Mobile: Story = { globals: VIEWPORT_360 };
export const Tablet: Story = { globals: VIEWPORT_768 };
export const Desktop: Story = { globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { QuotePanel, type QuotePanelProps } from "./organisms/quote-panel/quote-panel";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/quote-panel packages/design-tokens/tokens/component/quote-panel.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/quote-panel.json packages/ui/src/organisms/quote-panel packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): QuotePanel organism

The calculators' estimate panel in three tones — brand with the diamond,
ink, and a white light island — with the big amount, a screen-reader-named
struck price, money lines and total as a definition list, and slots for
alerts, the action and a footnote.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

