### Task 5: FaqSection

**Dev reference:** `git show dev:packages/ui/src/organisms/faq-section/faq-section.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                          | Ruling                         | Where / clause                                                                                                                    |
| ------------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Heading, lede and every question                  | ALREADY                        | test "heads the section with overline, a level-2 title and the lede"                                                              |
| The first answer open on arrival                  | ALREADY                        | test "opens the first answer by default…"                                                                                         |
| `defaultOpen` (named questions, or `[]` for none) | ADD — pending contract delta 2 | Accordion already takes `defaultOpen` (Plan 3a); not built until ruled (report)                                                   |
| Clicking another question swaps the open answer   | ALREADY                        | native `<details name>` (shared `name` asserted); Plan 3a Accordion's `play` proves exclusivity in Chromium                       |
| `isMultiple` keeps several open                   | ALREADY                        | test "lets several answers stay open with isMultiple"                                                                             |
| Questions sit one heading level below the section | DROP here                      | Plan 3a's Accordion renders questions in `<summary>` with no heading level (spec §9.2 lists none) — cross-plan note in the report |
| Two columns stack at 360px                        | ALREADY                        | `lg:grid-cols-2`, one column below                                                                                                |
| Merges a caller `className`                       | ADD                            | test "merges a caller className"                                                                                                  |
| axe                                               | ALREADY                        | test "has no accessibility violations"                                                                                            |
| "A few bakes contain egg" answer                  | DROP                           | C10                                                                                                                               |
| Stories Default · Multiple · Narrow               | ALREADY                        | Default · Multiple · Mobile                                                                                                       |
| Story WithoutLede                                 | ADD                            | `WithoutLede`                                                                                                                     |
| Story HeadingLevels                               | ADD                            | `HeadingLevel3`                                                                                                                   |
| Stories SecondOpen · AllClosed                    | ADD — pending contract delta 2 | —                                                                                                                                 |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/faq-section.json`
- Create: `packages/ui/src/organisms/faq-section/faq-section.tsx`, `faq-section.test.tsx`, `faq-section.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Accordion`/`AccordionItem`, `SectionHeader`, `componentVariants`, `HeadingLevel`; stories: `Button`, `Card`, `Logo`, `StatusDot`, `Text`.
- Produces: `FaqSection`, `FaqSectionProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/faq-section.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "faq-section-gap": {
      "$value": "clamp(28px, 4vw, 56px)",
      "$description": "Gap between the heading column and the answers (design system FaqSection)."
    },
    "faq-section-sticky": {
      "$value": "120px",
      "$description": "Sticky offset of the heading column at lg and up — clears the compact header and its announcement bar (handoff FaqBlock)."
    }
  }
}
```

Append to `SPACING`:

```ts
  "faq-section-gap",
  "faq-section-sticky",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/faq-section/faq-section.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import type { AccordionItem } from "../../molecules/accordion/accordion";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FaqSection } from "./faq-section";

const ITEMS: AccordionItem[] = [
  {
    value: "veg",
    question: "Is it really pure vegetarian?",
    answer: "One kitchen, pure vegetarian, no exceptions. No egg, no meat, ever.",
  },
  {
    value: "pause",
    question: "Can I pause or skip a day?",
    answer: "Yes. Tell us by 9pm the day before.",
  },
  { value: "gst", question: "Do I get a GST bill?", answer: "Yes, for every order." },
];

describe("FaqSection", () => {
  it("heads the section with overline, a level-2 title and the lede", () => {
    render(
      <FaqSection
        overline="Questions"
        title="Before you order"
        lede="The things people ask us most."
        items={ITEMS}
      />
    );
    expect(screen.getByRole("heading", { level: 2, name: "Before you order" })).toBeInTheDocument();
    expect(screen.getByText("Questions")).toBeInTheDocument();
    expect(screen.getByText("The things people ask us most.")).toBeInTheDocument();
  });

  it("opens the first answer by default and keeps one open at a time", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} />);
    const answers = [...container.querySelectorAll("details")];
    expect(answers).toHaveLength(3);
    expect(answers[0]).toHaveAttribute("open");
    expect(container.querySelectorAll("details[open]")).toHaveLength(1);
    const names = new Set(answers.map((answer) => answer.getAttribute("name")));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("lets several answers stay open with isMultiple", () => {
    const { container } = render(<FaqSection title="FAQ" items={ITEMS} isMultiple />);
    for (const answer of container.querySelectorAll("details")) {
      expect(answer).not.toHaveAttribute("name");
    }
  });

  it("puts the aside beside the heading in the column that sticks at lg", () => {
    render(<FaqSection title="FAQ" items={ITEMS} aside={<p>Still have a question?</p>} />);
    const lead = screen.getByText("Still have a question?").closest('[class~="lg:sticky"]');
    expect(lead).toContainElement(screen.getByRole("heading", { name: "FAQ" }));
    expect(lead).toHaveClass("lg:top-faq-section-sticky");
  });

  it("merges a caller className", () => {
    const { container } = render(
      <FaqSection title="FAQ" items={ITEMS} className="bg-surface-page-alt" />
    );
    expect(container.firstElementChild).toHaveClass("section-y", "bg-surface-page-alt");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <FaqSection overline="Questions" title="Before you order" items={ITEMS} aside={<p>Help</p>} />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- faq-section 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./faq-section`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/faq-section/faq-section.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { HeadingLevel } from "../../lib/heading";

import { componentVariants } from "../../lib/component-variants";
import { Accordion, type AccordionItem } from "../../molecules/accordion/accordion";
import { SectionHeader } from "../../molecules/section-header/section-header";

const faqSection = componentVariants({
  slots: {
    root: "section-y",
    inner: "gap-faq-section-gap container-page grid items-start lg:grid-cols-2",
    lead: "lg:top-faq-section-sticky flex min-w-0 flex-col gap-6 lg:sticky",
  },
});

export interface FaqSectionProps extends Omit<ComponentProps<"section">, "title"> {
  overline?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  /** One or two short sentences per answer. The first opens by default. */
  items: AccordionItem[];
  /** Allow several answers open at once. */
  isMultiple?: boolean | undefined;
  /** Beside the heading, sticky at lg and up — e.g. the handoff's "Still have a question?" card. */
  aside?: ReactNode;
  headingLevel?: HeadingLevel | undefined;
}

/** Two-column FAQ — heading (and aside) left, native accordion right, stacking below lg. */
export function FaqSection({
  overline,
  title,
  lede,
  items,
  isMultiple = false,
  aside,
  headingLevel = 2,
  className,
  ...props
}: FaqSectionProps) {
  const slots = faqSection();
  return (
    <section className={slots.root({ className })} {...props}>
      <div className={slots.inner()}>
        <div className={slots.lead()}>
          <SectionHeader
            overline={overline}
            title={title}
            lede={lede}
            headingLevel={headingLevel}
          />
          {aside}
        </div>
        <Accordion items={items} isMultiple={isMultiple} />
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- faq-section 2>&1 | tail -8`
Expected: PASS (6 tests).

- [ ] **Step 6: Stories (card parity with `FaqSection.card.html` + handoff `FaqBlock`)**

The card's first answer mentions egg-containing bakes, which the owner has ruled out (C10); the rows use the handoff Home FAQ.

`packages/ui/src/organisms/faq-section/faq-section.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MessageCircle, Phone } from "lucide-react";

import type { AccordionItem } from "../../molecules/accordion/accordion";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Logo } from "../../atoms/logo/logo";
import { StatusDot } from "../../atoms/status-dot/status-dot";
import { Text } from "../../atoms/text/text";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { FaqSection } from "./faq-section";

/** Handoff Home FAQ (rates.js values filled in). */
const FAQ: AccordionItem[] = [
  {
    value: "delivery",
    question: "Where do you deliver?",
    answer:
      "Free delivery within 3 km of Sector 57. Further away, we agree the charge with you on WhatsApp. Catering delivery is free up to 8 km.",
  },
  {
    value: "pause",
    question: "Can I pause or skip a day?",
    answer: "Yes. Tell us by 9pm the day before. Skipped meals move to the end of your plan.",
  },
  {
    value: "customise",
    question: "Can I customise my meals?",
    answer: "Yes — spice level, Jain, no onion-garlic, fewer rotis. Set it once and we remember.",
  },
  {
    value: "gst",
    question: "Do I get a GST bill?",
    answer: "Yes, for every meal plan, every catering order and every office order.",
  },
  {
    value: "trial",
    question: "Can I try it before I commit?",
    answer:
      "Yes. Start with a trial: 5 meals on any days within a week — Classic ₹650, Everyday ₹600. No lock-in after that.",
  },
  {
    value: "veg",
    question: "Is it really pure vegetarian?",
    answer:
      "One kitchen, pure vegetarian, no exceptions. No egg, no meat, ever. We are a pure-veg restaurant, not a mixed kitchen.",
  },
];

const QUICK_QUESTIONS = [
  "Do you deliver to my area?",
  "Can I pause for a week?",
  "Do you cater parties?",
];

/** The handoff FaqBlock's help card — page-specific content, composed here only for the story. */
function HelpCard() {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Logo variant="symbol" tone="badge" isDecorative className="w-11" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <Text as="span" weight="bold" className="font-display">
              Still have a question?
            </Text>
            <StatusDot tone="open" label="A real person replies, 8am – 11:30pm" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Text as="span" variant="overline" tone="muted">
            Tap to ask on WhatsApp
          </Text>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((question) => (
              <Button key={question} asChild variant="secondary" size="sm" icon={MessageCircle}>
                <a href={`${BRAND.whatsappHref}?text=${encodeURIComponent(question)}`}>
                  {question}
                </a>
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button asChild isFullWidth icon={MessageCircle}>
            <a href={BRAND.whatsappHref}>WhatsApp</a>
          </Button>
          <Button asChild isFullWidth variant="secondary" icon={Phone}>
            <a href={BRAND.phoneHref}>Call</a>
          </Button>
        </div>
      </div>
    </Card>
  );
}

const meta = {
  title: "Organisms/FaqSection",
  component: FaqSection,
  args: {
    overline: "Questions",
    title: "The things people ask",
    lede: "Everything guests ask us at the counter.",
    items: FAQ,
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Two-column FAQ — heading left, accordion right, stacking below lg. The first answer opens by default; answers are one or two short sentences. `aside` sits under the heading and the whole column sticks at lg (the handoff's help card). Native `<details name>`: zero JS, find-in-page works, answers are in the HTML.",
      },
    },
  },
} satisfies Meta<typeof FaqSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: the two-column FAQ. */
export const Default: Story = {};

/** Handoff FaqBlock — sticky heading column with the help card. */
export const HandoffWithAside: Story = {
  args: {
    title: "Before you order",
    lede: "The things people ask us most. Anything else, just message us.",
    aside: <HelpCard />,
    className: "bg-surface-page-alt",
  },
};

export const Multiple: Story = { args: { isMultiple: true } };

/** No lede: the heading sits alone in its column and the answers carry the section. */
export const WithoutLede: Story = { args: { lede: undefined } };

/** Under a page section that already owns the h2, the FAQ steps down a level. */
export const HeadingLevel3: Story = {
  args: { headingLevel: 3, overline: "Homely Meals", title: "Plans and delivery" },
};

export const Mobile: Story = { ...HandoffWithAside, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffWithAside, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffWithAside, globals: VIEWPORT_1280 };
```

- [ ] **Step 7: Export**

```ts
export { FaqSection, type FaqSectionProps } from "./organisms/faq-section/faq-section";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/faq-section packages/design-tokens/tokens/component/faq-section.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/faq-section.json packages/ui/src/organisms/faq-section packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): FaqSection organism

Heading column and native accordion side by side from lg, stacked below;
the first answer opens by default, one at a time unless isMultiple. The
aside slot sits under the heading and the column sticks clear of the
header, as the handoff's FAQ block does.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

