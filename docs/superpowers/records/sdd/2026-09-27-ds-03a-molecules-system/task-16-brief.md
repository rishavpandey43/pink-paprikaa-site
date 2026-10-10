### Task 16: Accordion (native `<details name>`, server-safe)

Design-system sources: `components/molecules/Accordion.*`; handoff `FaqBlock.dc.html` (single-open, first item open, chevron rotates, height animates). Card rows: single (first open) · multiple (two open).

The platform does everything: `<details>` in one `name` group is an exclusive accordion (Chromium 120, Safari 17.2, Firefox 130 — older browsers degrade to multi-open, spec §15.3), `<summary>` is the keyboard-operable disclosure, closed answers stay in the DOM (find-in-page opens them; search engines read them), and zero JavaScript ships. The height animates through `::details-content` + `interpolate-size` where supported (Chromium 131+) and opens instantly elsewhere.

**Files:**

- Create: `packages/design-tokens/tokens/component/accordion.json`
- Create: `packages/ui/src/molecules/accordion/accordion.tsx`, `accordion.test.tsx`, `accordion.stories.tsx`
- Modify: `packages/ui/src/styles.css` (`@utility details-content-motion`), `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/accordion/accordion.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                   | Ruling  | Where / why                                                                                                                        |
| -------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| clicking a question reveals its answer; a second click hides it            | ADD     | test "reveals an answer when its question is clicked…" (jsdom toggles `<details>` on summary activation)                           |
| keyboard toggling                                                          | ADD     | `Playground` play presses Enter on the focused summary (real Chromium)                                                             |
| caller `className` merges                                                  | ADD     | test "merges a caller className…"                                                                                                  |
| `Narrow` story                                                             | ADD     | `Narrow` story                                                                                                                     |
| per-item `isDisabled` (inert row "not live yet") + `WithDisabledRow` story | DELTA   | contracts §5 `AccordionItem` is `{ value, question, answer }`; a native `<details>` cannot be disabled — proposed delta, see audit |
| questions rendered as h2–h4 headings (`headingLevel`) + story              | DROP    | spec D7 / §3.3: native `<summary>` — its children are presentational, so a heading inside loses its role; not in contracts §5      |
| Radix roving focus (ArrowDown between questions)                           | DROP    | spec §3.3 rejects Radix Accordion for `<details name>`; summaries are in the Tab order                                             |
| all collapsed by default; `value` defaults to the question                 | DROP    | contracts §5: `defaultOpen = [items[0].value]`, `value` required                                                                   |
| egg-containing bakes in the FAQ fixture                                    | DROP    | spec C10: pure veg, no egg                                                                                                         |
| one open at a time; `isMultiple`; `defaultOpen`                            | ALREADY | shared `name` tests + `Playground` play (real exclusivity), `isMultiple` and `defaultOpen` tests                                   |
| open question brand pink; chevron rotates                                  | ALREADY | `group-open:text-text-brand`, chevron test                                                                                         |
| `Default`, `FirstOpen`, `Multiple` stories                                 | ALREADY | `Playground` (first open), `Multiple`, `Surfaces`                                                                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `OnSurfaces` (Plan 2a, stories).
- Produces: `Accordion`, `AccordionProps`, `AccordionItem` — contract §5. Single-open by default (every `<details>` shares `name`, default a `useId()`), `isMultiple` omits `name`, `defaultOpen` defaults to the first item.

- [ ] **Step 1: Component tokens and the motion utility**

`packages/design-tokens/tokens/component/accordion.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "accordion-answer-measure": {
      "$value": "62ch",
      "$description": "Answer line length."
    }
  },
  "text": {
    "$type": "typography",
    "accordion-question": {
      "$value": {
        "fontSize": "16.5px",
        "lineHeight": 1.4,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Accordion question (Poppins 700)."
    },
    "accordion-answer": {
      "$value": { "fontSize": "15px", "lineHeight": 1.6 },
      "$description": "Accordion answer (DM Sans)."
    }
  }
}
```

Append `"accordion-answer-measure"` to `SPACING` and `"accordion-question"`, `"accordion-answer"` to `TEXT`. Append to `packages/ui/src/styles.css`, after the `search-reset` utility:

```css
/*
 * Accordion answers: the <details> content animates its height where the browser supports
 * ::details-content and interpolate-size (Chromium 131+) and opens instantly elsewhere. The answer
 * stays in the DOM either way, so find-in-page and search engines see every one.
 */
@utility details-content-motion {
  interpolate-size: allow-keywords;

  &::details-content {
    block-size: 0;
    overflow-y: clip;
    transition:
      block-size var(--duration-base) var(--ease-out),
      content-visibility var(--duration-base) var(--ease-out) allow-discrete;
  }

  &[open]::details-content {
    block-size: auto;
  }
}
```

Rebuild tokens and run the variant spec.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/accordion/accordion.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Accordion, type AccordionItem } from "./accordion";

const FAQ: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: "Yes. The whole kitchen is pure vegetarian — no meat, no egg.",
  },
  {
    value: "delivery",
    question: "Do you deliver?",
    answer: "Pickup only for now. Delivery starts in 2027.",
  },
  {
    value: "booking",
    question: "Can I book a table?",
    answer: "Yes, up to 6 guests online. Larger groups, give us a call.",
  },
];

function detailsOf(container: HTMLElement): HTMLDetailsElement[] {
  return [...container.querySelectorAll("details")];
}

describe("Accordion", () => {
  it("renders each item as a native disclosure with its question as the summary", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const details = detailsOf(container);
    expect(details).toHaveLength(3);
    expect(details[0]?.querySelector("summary")).toHaveTextContent("Is everything vegetarian?");
  });

  it("keeps every answer in the page, open or closed — find-in-page and search engines see them all", () => {
    render(<Accordion items={FAQ} />);
    for (const item of FAQ) {
      const answer = screen.getByText(item.answer as string);
      expect(answer).toBeInTheDocument();
      expect(answer).not.toHaveAttribute("hidden");
      expect(answer.closest("[hidden]")).toBeNull();
    }
  });

  it("opens the first item by default and nothing else", () => {
    const { container } = render(<Accordion items={FAQ} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([true, false, false]);
  });

  it("reveals an answer when its question is clicked, and hides it on a second click", async () => {
    const user = userEvent.setup();
    const { container } = render(<Accordion items={FAQ} defaultOpen={[]} />);
    const delivery = detailsOf(container)[1];
    await user.click(screen.getByText("Do you deliver?"));
    expect(delivery?.open).toBe(true);
    await user.click(screen.getByText("Do you deliver?"));
    expect(delivery?.open).toBe(false);
  });

  it("merges a caller className over its own top rule", () => {
    const { container } = render(<Accordion items={FAQ} className="border-t-0" />);
    expect(container.firstElementChild).toHaveClass("border-t-0");
    expect(container.firstElementChild).not.toHaveClass("border-t");
  });

  it("opens the items it is told to, or none", () => {
    const { container, rerender } = render(<Accordion items={FAQ} defaultOpen={["booking"]} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([false, false, true]);
    rerender(<Accordion items={FAQ} defaultOpen={[]} />);
    expect(detailsOf(container).map((d) => d.open)).toEqual([false, false, false]);
  });

  it("groups single-open items under one shared name", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const names = new Set(detailsOf(container).map((d) => d.getAttribute("name")));
    expect(names.size).toBe(1);
    expect([...names][0]).toBeTruthy();
  });

  it("uses the name it is given, so two accordions never share a group", () => {
    const { container } = render(<Accordion items={FAQ} name="faq-home" />);
    for (const details of detailsOf(container)) expect(details).toHaveAttribute("name", "faq-home");
  });

  it("leaves items independent when isMultiple", () => {
    const { container } = render(
      <Accordion items={FAQ} isMultiple defaultOpen={["veg", "delivery"]} />
    );
    for (const details of detailsOf(container)) expect(details).not.toHaveAttribute("name");
    expect(detailsOf(container).map((d) => d.open)).toEqual([true, true, false]);
  });

  it("draws a decorative chevron that turns when its item opens", () => {
    const { container } = render(<Accordion items={FAQ} />);
    const chevron = container.querySelector("summary svg.lucide-chevron-down")?.parentElement;
    expect(chevron).toHaveAttribute("aria-hidden", "true");
    expect(chevron).toHaveClass("group-open:rotate-180");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<Accordion items={FAQ} />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/accordion 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./accordion`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/accordion/accordion.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { ChevronDown } from "lucide-react";
import { useId } from "react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const accordion = componentVariants({
  slots: {
    root: "border-t border-border-subtle",
    item: "group details-content-motion border-b border-border-subtle",
    summary:
      "text-accordion-question flex cursor-pointer list-none items-center justify-between gap-4 py-4.5 font-display text-text-heading transition-colors duration-fast ease-out group-open:text-text-brand marker:hidden hover:text-text-brand",
    question: "min-w-0",
    chevron: "transition-transform duration-base ease-out group-open:rotate-180",
    answer:
      "max-w-accordion-answer-measure text-accordion-answer pb-4.5 text-pretty text-text-muted",
  },
});

export interface AccordionItem {
  /** Stable key, and what `defaultOpen` names. */
  value: string;
  question: ReactNode;
  answer: ReactNode;
}

export interface AccordionProps extends ComponentProps<"div"> {
  items: AccordionItem[];
  /** Let several answers stay open at once. */
  isMultiple?: boolean | undefined;
  /** Items open on load (default: the first). */
  defaultOpen?: string[] | undefined;
  /** The single-open group's name (default: generated). Two accordions never share one. */
  name?: string | undefined;
}

/**
 * FAQ, allergen and franchise-detail disclosure. Hairline-separated rows, no card; the chevron turns
 * 180° and the active question turns brand. One answer open at a time unless `isMultiple`.
 */
export function Accordion({
  items,
  isMultiple = false,
  defaultOpen,
  name,
  className,
  ...props
}: AccordionProps) {
  const generatedName = useId();
  const groupName = isMultiple ? undefined : (name ?? generatedName);
  const openValues = new Set(defaultOpen ?? items.slice(0, 1).map((item) => item.value));
  const styles = accordion();

  return (
    <div className={styles.root({ className })} {...props}>
      {items.map((item) => (
        <details
          key={item.value}
          name={groupName}
          open={openValues.has(item.value)}
          className={styles.item()}
        >
          <summary className={styles.summary()}>
            <span className={styles.question()}>{item.question}</span>
            <Icon icon={ChevronDown} size="md" className={styles.chevron()} />
          </summary>
          <div className={styles.answer()}>{item.answer}</div>
        </details>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/accordion 2>&1 | tail -8`
Expected: PASS (11 tests).

- [ ] **Step 6: Stories — the `play` proves real exclusivity in Chromium, which jsdom cannot**

`packages/ui/src/molecules/accordion/accordion.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Accordion, type AccordionItem } from "./accordion";

const FAQ: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: "Yes. The whole kitchen is pure vegetarian — no meat, no egg.",
  },
  {
    value: "delivery",
    question: "Do you deliver?",
    answer: "Pickup only for now. Delivery starts in 2027.",
  },
  {
    value: "booking",
    question: "Can I book a table?",
    answer: "Yes, up to 6 guests online. Larger groups, give us a call.",
  },
];

const meta = {
  title: "Molecules/Accordion",
  component: Accordion,
  args: { items: FAQ },
  parameters: {
    docs: {
      description: {
        component:
          "FAQ, allergen and franchise-detail disclosure, on native `<details name>`: one answer open at a time (`isMultiple` lifts that), the first open by default, zero JavaScript. Hairline-separated rows, no card; the chevron rotates 180° and the active question turns brand; the height animates where the browser supports `::details-content`. Every answer stays in the page, so find-in-page and search engines see them all.",
      },
    },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "single" — opening one closes the other (the `name` group, in a real browser). */
export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const first = canvas.getByText("Is everything vegetarian?").closest("details");
    const second = canvas.getByText("Do you deliver?").closest("details");
    await expect(first).toHaveAttribute("open");
    await userEvent.click(canvas.getByText("Do you deliver?"));
    await expect(second).toHaveAttribute("open");
    await expect(first).not.toHaveAttribute("open");
    // Keyboard (dev parity): the focused summary toggles on Enter, natively.
    await userEvent.keyboard("{Enter}");
    await expect(second).not.toHaveAttribute("open");
  },
};

/** Card row "multiple" — `isMultiple`, both open. */
export const Multiple: Story = {
  args: { items: FAQ.slice(0, 2), isMultiple: true, defaultOpen: ["veg", "delivery"] },
};

export const Surfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <Accordion {...args} className="w-full" />
    </OnSurfaces>
  ),
};

/** Dev parity: the smallest supported width — long questions wrap, the chevron never moves. */
export const Narrow: Story = {
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

(The `Surfaces` story renders five accordions; each gets its own generated `name`, so opening one never closes another's item — worth a manual click in the parity review.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  Accordion,
  type AccordionItem,
  type AccordionProps,
} from "./molecules/accordion/accordion";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/accordion packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/accordion packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/ui/src/styles.css packages/design-tokens/tokens/component/accordion.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green. If Tailwind rejects the nested `&::details-content` inside `@utility`, the build error names the line: keep the utility with only `interpolate-size`, and move the two pseudo-element rules into `@layer components { .details-content-motion::details-content { … } .details-content-motion[open]::details-content { … } }` directly below it (the utility keeps the class known to the linter).

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Accordion molecule on native details

One name group per accordion gives single-open with zero JavaScript; every
answer stays in the DOM for find-in-page and search engines. The height
animates through ::details-content where supported and snaps elsewhere.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

