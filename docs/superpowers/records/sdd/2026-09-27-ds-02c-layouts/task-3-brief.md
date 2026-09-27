### Task 3: Stack

**Files:**

- Create: `packages/ui/src/layouts/stack/{stack.tsx,stack.test.tsx,stack.stories.tsx}`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/templates/stack/stack.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                             | Ruling  | Where / clause                                                                          |
| ---------------------------------------------------- | ------- | --------------------------------------------------------------------------------------- |
| `grid min-w-0` base, 16px default gap                | ALREADY | Step 3 (+ `grid-cols-1`, deviation 10)                                                  |
| `space` steps incl. half steps                       | ALREADY | `GAP_CLASS` (Task 1); `gap-0-5` names DROP (D4)                                         |
| `align` → `justify-items-*`, `justify` → `content-*` | ALREADY | Step 1 `it.each` rows                                                                   |
| `hasDivider` (`divide-y divide-border-subtle`)       | ALREADY | `isDivided` (contracts §4) — hidden rule elements that keep lists valid                 |
| `as` any element (doc comment names `dl`)            | DROP    | Contracts §4 union; an injected rule is not valid `<dl>` content. `ul`/`ol` are covered |
| Test: keeps every child in a divided list            | ALREADY | Step 1 "keeps a divided list a valid list"                                              |
| Test: never spaces with margins                      | ADD     | Step 1 "never spaces with margins"                                                      |
| Test: caller className replaces the gap              | ALREADY | Step 1 (`gap-2`)                                                                        |
| Test: axe on a divided `ul`                          | ALREADY | Step 1                                                                                  |
| Story `Default`                                      | ALREADY | `Playground`                                                                            |
| Story `Spacing` (0.5 · 2 · 6 · 12)                   | ADD     | Step 5 `Steps`                                                                          |
| Story `Align` (start/center/end/stretch)             | ADD     | Step 5 `Align`                                                                          |
| Story `WithDividers` (`as="ul"` + `li`)              | ADD     | Step 5 `DividedList`                                                                    |
| Story `Narrow` at `floor360`                         | ALREADY | `LongWordAt360`                                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `GAP_CLASS`, `SpaceStep` (Task 1); `--color-border-subtle` (Plan 1, surface-aware).
- Produces: `Stack`, `type StackProps`.

No component tokens (steps + `h-px`).

- [ ] **Step 1: Write the failing test**

`packages/ui/src/layouts/stack/stack.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Stack } from "./stack";

describe("Stack", () => {
  it("is a shrinkable one-column grid (minmax(0, 1fr)) with a 16px gap by default", () => {
    render(
      <Stack data-testid="stack">
        <p>Small Plates</p>
      </Stack>
    );
    const stack = screen.getByTestId("stack");
    expect(stack.tagName).toBe("DIV");
    expect(stack).toHaveClass("grid", "grid-cols-1", "min-w-0", "gap-4");
  });

  it.each([
    [0, "gap-0"],
    [0.5, "gap-0.5"],
    [1.5, "gap-1.5"],
    [6, "gap-6"],
    [32, "gap-32"],
  ] as const)("space=%s sets %s", (space, gap) => {
    render(<Stack space={space} data-testid="stack" />);
    expect(screen.getByTestId("stack")).toHaveClass(gap);
  });

  it.each([
    ["start", "justify-items-start"],
    ["center", "justify-items-center"],
    ["end", "justify-items-end"],
    ["stretch", "justify-items-stretch"],
  ] as const)("align=%s sets %s", (align, cls) => {
    render(<Stack align={align} data-testid="stack" />);
    expect(screen.getByTestId("stack")).toHaveClass(cls);
  });

  it.each([
    ["start", "content-start"],
    ["center", "content-center"],
    ["end", "content-end"],
    ["between", "content-between"],
  ] as const)("justify=%s sets %s", (justify, cls) => {
    render(<Stack justify={justify} data-testid="stack" />);
    expect(screen.getByTestId("stack")).toHaveClass(cls);
  });

  it("puts one hidden hairline between rows — never before the first or after the last", () => {
    render(
      <Stack isDivided data-testid="stack">
        <p>Paprikaa Chilli Paneer</p>
        <p>Masala Cold Brew</p>
        <p>Small Plates</p>
      </Stack>
    );
    const rows = [...screen.getByTestId("stack").children];
    expect(rows.map((row) => row.tagName)).toEqual(["P", "DIV", "P", "DIV", "P"]);
    for (const rule of rows.filter((row) => row.tagName === "DIV")) {
      expect(rule).toHaveAttribute("aria-hidden", "true");
      expect(rule).toHaveClass("h-px", "bg-border-subtle");
    }
  });

  it("skips empty children, so a conditional row never leaves a doubled rule", () => {
    render(
      <Stack isDivided data-testid="stack">
        <p>Chai</p>
        {null}
        {false}
        <p>Kulfi</p>
      </Stack>
    );
    expect(screen.getByTestId("stack").children).toHaveLength(3);
  });

  it("keeps a divided list a valid list: its rules are hidden list items", () => {
    render(
      <Stack as="ul" isDivided>
        <li>Chai</li>
        <li>Kulfi</li>
      </Stack>
    );
    const list = screen.getByRole("list");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(list.children).toHaveLength(3);
    expect(list.children[1]?.tagName).toBe("LI");
  });

  it("lets a consumer className replace the gap", () => {
    render(<Stack className="gap-2" data-testid="stack" />);
    const stack = screen.getByTestId("stack");
    expect(stack).toHaveClass("gap-2");
    expect(stack).not.toHaveClass("gap-4");
  });

  it("never spaces with margins", () => {
    render(<Stack isDivided data-testid="stack" />);
    expect(screen.getByTestId("stack").className).not.toMatch(/(^|\s)-?m[trblxy]?-/);
  });

  it("has no accessibility violations as a divided list", async () => {
    const { container } = render(
      <Stack as="ul" isDivided space={3}>
        <li>Chai</li>
        <li>Kulfi</li>
        <li>Bun maska</li>
      </Stack>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./stack"`.

- [ ] **Step 3: Implement**

`packages/ui/src/layouts/stack/stack.tsx`:

```tsx
import { Children, type ComponentProps, type ElementType, Fragment, isValidElement } from "react";

import { componentVariants } from "../../lib/component-variants";
import { GAP_CLASS, type SpaceStep } from "../../lib/space";

const stack = componentVariants({
  slots: {
    // One minmax(0, 1fr) column: a long word overflows its row instead of widening the stack past
    // its parent (readme §3.10 — never a track with a min-content floor).
    base: "grid min-w-0 grid-cols-1",
    rule: "h-px bg-border-subtle",
  },
  variants: {
    space: GAP_CLASS,
    align: {
      start: "justify-items-start",
      center: "justify-items-center",
      end: "justify-items-end",
      stretch: "justify-items-stretch",
    },
    justify: {
      start: "content-start",
      center: "content-center",
      end: "content-end",
      between: "content-between",
    },
  },
});

export interface StackProps extends ComponentProps<"div"> {
  /** Spacing step between rows: N × 4px (`6` is 24px). */
  space?: SpaceStep;
  /** Inline alignment of every row (grid `justify-items`). Default: stretch. */
  align?: "start" | "center" | "end" | "stretch";
  /** Block distribution when the stack is taller than its rows (grid `align-content`). */
  justify?: "start" | "center" | "end" | "between";
  /** A hairline rule between rows — menu rows, list items. The rule follows the surface. */
  isDivided?: boolean;
  as?: "div" | "ul" | "ol" | "section" | "article";
}

/** Vertical rhythm: gap-based, never margins. Each direct child is one row. */
export function Stack({
  as = "div",
  space = 4,
  align,
  justify,
  isDivided = false,
  className,
  children,
  ...props
}: StackProps) {
  const Element: ElementType = as;
  // Inside a list a rule must itself be a list item; aria-hidden keeps it out of the item count.
  const Rule: ElementType = as === "ul" || as === "ol" ? "li" : "div";
  const slots = stack({ space, align, justify });

  return (
    <Element className={slots.base({ className })} {...props}>
      {isDivided
        ? Children.toArray(children).map((child, index) => (
            <Fragment key={isValidElement(child) ? (child.key ?? index) : index}>
              {index > 0 ? <Rule aria-hidden className={slots.rule()} /> : null}
              {child}
            </Fragment>
          ))
        : children}
    </Element>
  );
}
```

(`Children.toArray` drops `null`/`false`, which is what keeps a conditional row from doubling a rule.)

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 5: Stories — card parity, surfaces, and the 360 guarantee**

The card (`Stack.card.html`) has three rows: `space={2}` (8px, 3 chips), `space={6}` (24px, 2 chips) and `divide` (space 3, 3 chips).

`packages/ui/src/layouts/stack/stack.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { expect, within } from "storybook/test";

import { Text } from "../../atoms/text/text";
import { GAP_CLASS } from "../../lib/space";
import { Stack } from "./stack";

/** The card's demo chip. */
function Chip({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-sm bg-pink-100 px-3 py-2 font-body text-caption text-pink-800">
      {children}
    </div>
  );
}

const LONG_WORD = "Paprikaa".repeat(8);

const meta = {
  title: "Layouts/Stack",
  component: Stack,
  args: {
    space: 4,
    isDivided: false,
    children: [
      <Chip key="plates">Small Plates</Chip>,
      <Chip key="day">All Day</Chip>,
      <Chip key="sweets">Sweets</Chip>,
    ],
  },
  argTypes: { space: { control: "select", options: Object.keys(GAP_CLASS).map(Number) } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Vertical spacing. Use this instead of margins so edits survive. `space` is the step number and the step IS the multiple of 4px — `space={6}` is 24px; half steps 0.5 and 1.5 exist. `isDivided` adds the hairline rules used between menu rows and list items (as `ul`/`ol` the rules are hidden list items, so the list stays valid).",
      },
    },
  },
} satisfies Meta<typeof Stack>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Space2: Story = {
  name: "space={2} · 8px",
  args: {
    space: 2,
    children: [<Chip key="a">8px</Chip>, <Chip key="b">8px</Chip>, <Chip key="c">8px</Chip>],
  },
};

export const Space6: Story = {
  name: "space={6} · 24px",
  args: { space: 6, children: [<Chip key="a">24px</Chip>, <Chip key="b">24px</Chip>] },
};

export const Divided: Story = {
  name: "isDivided",
  args: {
    space: 3,
    isDivided: true,
    children: [
      <Chip key="a">hairline between</Chip>,
      <Chip key="b">hairline between</Chip>,
      <Chip key="c">hairline between</Chip>,
    ],
  },
};

/** The step scale at work, half step included: 2px · 8px · 24px · 48px (dev parity). */
export const Steps: Story = {
  name: "space — 0.5 · 2 · 6 · 12",
  render: () => (
    <Stack space={8}>
      {([0.5, 2, 6, 12] as const).map((space) => (
        <Stack key={space} space={space}>
          <Chip>{`space={${String(space)}} · ${String(space * 4)}px`}</Chip>
          <Chip>{`space={${String(space)}} · ${String(space * 4)}px`}</Chip>
        </Stack>
      ))}
    </Stack>
  ),
};

/** `align` is each row's inline alignment; `stretch` (the default) fills the width (dev parity). */
export const Align: Story = {
  name: "align",
  render: () => (
    <Stack space={6}>
      {(["start", "center", "end", "stretch"] as const).map((align) => (
        <Stack key={align} align={align} space={2}>
          <Chip>{`align="${align}"`}</Chip>
          <Chip>{`align="${align}"`}</Chip>
        </Stack>
      ))}
    </Stack>
  ),
};

/** A divided real list: the rules are hidden list items, so the list stays valid (dev parity). */
export const DividedList: Story = {
  name: 'isDivided as="ul"',
  render: () => (
    <Stack as="ul" space={3} isDivided>
      {["Paprikaa Chilli Paneer", "Masala Cold Brew", "Small Plates"].map((item) => (
        <li key={item} className="font-body text-body-sm text-text-body">
          {item}
        </li>
      ))}
    </Stack>
  ),
};

/** The rule is `border-subtle`, which each surface remaps — white at 22% on brand and ink. */
export const DividedOnSurfaces: Story = {
  name: "isDivided on brand and ink",
  render: () => (
    <div className="grid gap-4">
      <div data-surface="brand" className="rounded-lg bg-surface-brand p-6">
        <Stack space={3} isDivided>
          <Text>Paprikaa Chilli Paneer</Text>
          <Text>Masala Cold Brew</Text>
          <Text>Small Plates</Text>
        </Stack>
      </div>
      <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
        <Stack space={3} isDivided>
          <Text>Paprikaa Chilli Paneer</Text>
          <Text>Masala Cold Brew</Text>
          <Text>Small Plates</Text>
        </Stack>
      </div>
    </div>
  ),
};

/** Readme §3.10 at the floor: a long word overflows its row; it never widens the stack. */
export const LongWordAt360: Story = {
  name: "360px — a long word never widens the stack",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Stack data-testid="stack">
      <Chip>Small Plates</Chip>
      <div data-testid="row">{LONG_WORD}</div>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const stackWidth = canvas.getByTestId("stack").getBoundingClientRect().width;
    await expect(canvas.getByTestId("row").getBoundingClientRect().width).toBeLessThanOrEqual(
      stackWidth + 0.5
    );
  },
};
```

- [ ] **Step 6: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { Stack, type StackProps } from "./layouts/stack/stack";
```

- [ ] **Step 7: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/layouts/stack packages/ui/src/index.ts`, then the gate. Expected: green; paste the summary lines.

```bash
git add packages/ui/src/layouts/stack packages/ui/src/index.ts
git commit -m "feat(ui): Stack layout

Vertical rhythm by spacing step, never margins. One minmax(0, 1fr)
column so a long word cannot widen the stack; the divided variant puts
surface-aware hairlines between rows and keeps lists valid.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

