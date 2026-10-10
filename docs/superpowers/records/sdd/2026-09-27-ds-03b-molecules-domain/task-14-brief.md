### Task 14: Steps

**Files:**

- Create: `packages/design-tokens/tokens/component/steps.json`
- Create: `packages/ui/src/molecules/steps/steps.tsx`, `steps.test.tsx`, `steps.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `headingTag`; Plan 2c's `autogrid-min-md` utility (260px tracks; the handoff's 240 snaps up) for the `rule` variant; semantic tokens (`bg-surface-brand` + `text-text-on-brand` disc; `border-border-brand` rule; `text-text-brand` numbers).
- Produces: `Steps`, `type StepsProps`, `type StepsItem` (contract §6). Defaults: `variant = "circle"`, `headingLevel = 3`. Numbers are content (visible and read), not decoration: "1" in a disc, "01" over a rule.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/steps.json`:

```json
{
  "text": {
    "$type": "typography",
    "steps-title": {
      "$value": { "fontSize": "17px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Step title (handoff 17–18px Poppins 700)."
    }
  }
}
```

Append `"steps-title",` to `TEXT`. Run `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/steps/steps.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Steps } from "./steps";

const HOW_IT_WORKS = [
  { title: "Pick on the site", description: "Choose a plan or a Dawat. The price is right there." },
  {
    title: "Confirm on WhatsApp",
    description: "Your choices arrive pre-written. We reply and lock it in.",
  },
  { title: "We cook and deliver" },
];

describe("Steps", () => {
  it("is an ordered list with one item per step", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    expect(within(screen.getByRole("list")).getAllByRole("listitem")).toHaveLength(3);
  });

  it("titles each step as a level-3 heading by default", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Pick on the site",
      "Confirm on WhatsApp",
      "We cook and deliver",
    ]);
  });

  it("uses the heading level the page needs", () => {
    render(<Steps items={HOW_IT_WORKS} headingLevel={4} />);
    expect(screen.getAllByRole("heading", { level: 4 })).toHaveLength(3);
  });

  it("numbers circle steps 1, 2, 3 in pink discs", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    const marker = screen.getByText("1");
    expect(marker).toHaveClass("rounded-pill", "bg-surface-brand");
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("numbers rule steps 01, 02, 03 under a brand rule", () => {
    render(<Steps items={HOW_IT_WORKS} variant="rule" />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")[0]).toHaveClass("border-t-3", "border-border-brand");
  });

  it("shows a description only where one is given", () => {
    render(<Steps items={HOW_IT_WORKS} />);
    const [, , last] = screen.getAllByRole("listitem");
    expect(
      screen.getByText("Choose a plan or a Dawat. The price is right there.")
    ).toBeInTheDocument();
    expect(last?.querySelector("p")).toBeNull();
  });

  it.each(["circle", "rule"] as const)("has no accessibility violations (%s)", async (variant) => {
    const { container } = render(<Steps items={HOW_IT_WORKS} variant={variant} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- steps 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./steps`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/steps/steps.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

export interface StepsItem {
  title: ReactNode;
  description?: ReactNode | undefined;
}

export interface StepsProps extends ComponentProps<"ol"> {
  items: StepsItem[];
  /** `circle`: a pink disc per step, stacked. `rule`: a brand top rule and "01", in a grid. */
  variant?: "circle" | "rule" | undefined;
  headingLevel?: HeadingLevel | undefined;
}

type StepsVariant = NonNullable<StepsProps["variant"]>;

/** How each variant writes a step's number. */
const STEP_NUMBER: Readonly<Record<StepsVariant, (step: number) => string>> = {
  circle: (step) => String(step),
  rule: (step) => String(step).padStart(2, "0"),
};

const steps = componentVariants({
  slots: {
    root: "m-0",
    item: "",
    marker: "font-display font-black",
    body: "flex min-w-0 flex-col gap-1",
    title: "text-steps-title font-display text-text-heading",
    description: "m-0 max-w-none text-body text-text-body",
  },
  variants: {
    variant: {
      circle: {
        root: "flex flex-col gap-5",
        item: "flex items-start gap-3.5",
        marker:
          "grid size-11 shrink-0 place-items-center rounded-pill bg-surface-brand text-body text-text-on-brand",
      },
      rule: {
        root: "autogrid-min-md grid gap-4",
        item: "flex flex-col gap-2 border-t-3 border-border-brand pt-4",
        marker: "text-h2 leading-none text-text-brand",
      },
    },
  },
});

/** Numbered steps: Home "How it works", Catering "How to book", Homely Meals "Starting takes one message". */
export function Steps({
  items,
  variant = "circle",
  headingLevel = 3,
  className,
  ...props
}: StepsProps) {
  const styles = steps({ variant });
  const Heading = headingTag(headingLevel);

  return (
    <ol className={styles.root({ className })} {...props}>
      {items.map((item, index) => (
        <li key={index} className={styles.item()}>
          <span className={styles.marker()}>{STEP_NUMBER[variant](index + 1)}</span>
          <div className={styles.body()}>
            <Heading className={styles.title()}>{item.title}</Heading>
            {item.description ? <p className={styles.description()}>{item.description}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- steps 2>&1 | tail -8`
Expected: PASS (8 tests).

- [ ] **Step 6: Stories — the three handoff sections with their copy, OnSurfaces**

`packages/ui/src/molecules/steps/steps.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Steps } from "./steps";

/** Home "How it works". */
const HOW_IT_WORKS = [
  { title: "Pick on the site", description: "Choose a plan or a Dawat. The price is right there." },
  {
    title: "Confirm on WhatsApp",
    description: "Your choices arrive pre-written. We reply and lock it in.",
  },
  {
    title: "We cook and deliver",
    description: "Cooked that morning in our Sector 57 kitchen, delivered to your door.",
  },
];

const meta = {
  title: "Molecules/Steps",
  component: Steps,
  args: { items: HOW_IT_WORKS },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Numbered steps as an `<ol>`. `variant="circle"` stacks steps beside a 44px pink disc (Home, Catering); `variant="rule"` lays them out in a grid under a 3px brand rule with a large "01" (Homely Meals). Semantic tokens: titles and descriptions follow the surface.',
      },
    },
  },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Home "How it works" — circle, on the ink section. */
export const HowItWorks: Story = {
  render: (args) => (
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-8">
      <Steps {...args} />
    </div>
  ),
};

/** Catering "Three steps and it's done." — circle, on ink. */
export const HowToBook: Story = {
  args: {
    items: [
      {
        title: "Send us a message",
        description:
          "Date, rough headcount and the Dawat you like. A WhatsApp line is enough — or send it from the builder.",
      },
      {
        title: "We confirm within the hour",
        description:
          "Final price, delivery slot, and anything we’d change. Ask for a trial Dawat here.",
      },
      {
        title: "Pay 50% to hold the date",
        description: "Balance on delivery. Menu changes stay free up to 24 hours before.",
      },
    ],
  },
  render: HowItWorks.render,
};

/** Homely Meals "Starting takes one message." — rule variant. */
export const StartingTakesOneMessage: Story = {
  args: {
    variant: "rule",
    items: [
      {
        title: "WhatsApp us",
        description:
          "Your area and the plan you’re leaning toward. Or send it straight from the builder.",
      },
      {
        title: "Start with a trial",
        description: `5 meals on any days within a week. Classic ${formatRupees(650)}, Everyday ${formatRupees(600)}.`,
      },
      {
        title: "Pick your plan",
        description:
          "Weekday (24) or Full month (30). Runs from your start date. Weekdays only? Skip Saturdays free. Cancel with 7 days’ notice.",
      },
    ],
  },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="grid min-w-0 flex-1 gap-8">
        <Steps {...args} variant="circle" />
        <Steps {...args} variant="rule" />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Steps, type StepsItem, type StepsProps } from "./molecules/steps/steps";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/steps.json packages/ui/src/molecules/steps packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/steps.json packages/ui/src/molecules/steps packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): Steps molecule

Numbered steps as an ordered list: pink discs stacked (Home, Catering)
or a brand rule with 01/02/03 in a grid (Homely Meals). Titles are
headings at the page's level; semantic tokens follow every surface.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

