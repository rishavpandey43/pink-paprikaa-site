### Task 4: Cluster

**Files:**

- Create: `packages/ui/src/layouts/cluster/{cluster.tsx,cluster.test.tsx,cluster.stories.tsx}`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/templates/cluster/cluster.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                    | Ruling  | Where / clause                                                                                                                              |
| ----------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Wrapping `flex min-w-0`, 12px default, centred              | ALREADY | Step 1 default test                                                                                                                         |
| `space`, `align`, `justify`, `isNowrap`                     | ALREADY | Step 1 `it.each` rows                                                                                                                       |
| `isScrollable`: `overflow-x-auto flex-nowrap` rail          | ALREADY | Step 3 (+ `*:shrink-0`, 4px ring room — deviation 11)                                                                                       |
| Scrolling rail is a tab stop (`tabIndex={0}`)               | ALREADY | Step 1 keyboard test                                                                                                                        |
| Wrapping cluster is never a tab stop                        | ALREADY | Step 1 default test                                                                                                                         |
| Automatic `role="region"` when the rail has an `aria-label` | ALREADY | Consumer names the rail (`role="group"` + `aria-label`, Step 3 JSDoc). An automatic role would override a `ul`'s list role (axe `listitem`) |
| Test: an `as="ul"` rail stays a list and keeps every item   | ADD     | Step 1 "keeps a scrolling ul a named list"                                                                                                  |
| Test: never spaces with margins (wrapping row)              | ADD     | Step 1 — the rail's `-m-1` is its deliberate ring-room offset                                                                               |
| Test: caller className replaces the gap                     | ADD     | Step 1                                                                                                                                      |
| Test: axe on the default `ul` row (`justify="between"`)     | ADD     | Step 1 (axe covered only the rail)                                                                                                          |
| Story `Default`, `Wrap`, `Scroll`                           | ALREADY | `Playground`, `Wrap`/`WrapAt360`, `Scroll`                                                                                                  |
| Story `Justify` (all four)                                  | ADD     | Step 5 `Justify`                                                                                                                            |
| Story `Spacing` (1 · 2 · 3 · 6)                             | ADD     | Step 5 `Spacing`                                                                                                                            |
| Story `InContext` (baseline meta row)                       | ADD     | Step 5 `BaselineMetaRow`                                                                                                                    |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `GAP_CLASS`, `SpaceStep` (Task 1); `Button`, `Tag` (Plan 2a) in stories.
- Produces: `Cluster`, `type ClusterProps`.

No component tokens.

- [ ] **Step 1: Write the failing test**

`packages/ui/src/layouts/cluster/cluster.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Cluster } from "./cluster";

describe("Cluster", () => {
  it("is a wrapping, centred flex row with a 12px gap, and no tab stop, by default", () => {
    render(
      <Cluster data-testid="row">
        <span>Order Now</span>
      </Cluster>
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("DIV");
    expect(row).toHaveClass(
      "flex",
      "min-w-0",
      "flex-wrap",
      "items-center",
      "justify-start",
      "gap-3"
    );
    expect(row).not.toHaveAttribute("tabindex");
  });

  it.each([
    [0.5, "gap-0.5"],
    [1.5, "gap-1.5"],
    [6, "gap-6"],
  ] as const)("space=%s sets %s", (space, gap) => {
    render(<Cluster space={space} data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass(gap);
  });

  it.each([
    ["start", "items-start"],
    ["center", "items-center"],
    ["end", "items-end"],
    ["baseline", "items-baseline"],
  ] as const)("align=%s sets %s", (align, cls) => {
    render(<Cluster align={align} data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass(cls);
  });

  it.each([
    ["start", "justify-start"],
    ["center", "justify-center"],
    ["end", "justify-end"],
    ["between", "justify-between"],
  ] as const)("justify=%s sets %s", (justify, cls) => {
    render(<Cluster justify={justify} data-testid="row" />);
    expect(screen.getByTestId("row")).toHaveClass(cls);
  });

  it("stops wrapping when isNowrap is set", () => {
    render(<Cluster isNowrap data-testid="row" />);
    const row = screen.getByTestId("row");
    expect(row).toHaveClass("flex-nowrap");
    expect(row).not.toHaveClass("flex-wrap");
  });

  it("renders the element named by as", () => {
    render(
      <Cluster as="nav" aria-label="Order">
        <a href="#menu">Menu</a>
      </Cluster>
    );
    expect(screen.getByRole("navigation", { name: "Order" })).toBeInTheDocument();
  });

  it("never spaces a wrapping row with margins", () => {
    render(<Cluster data-testid="row" />);
    expect(screen.getByTestId("row").className).not.toMatch(/(^|\s)-?m[trblxy]?-/);
  });

  it("lets a consumer className replace the gap", () => {
    render(<Cluster className="gap-8" data-testid="row" />);
    const row = screen.getByTestId("row");
    expect(row).toHaveClass("gap-8");
    expect(row).not.toHaveClass("gap-3");
  });

  it("has no accessibility violations as a list", async () => {
    const { container } = render(
      <Cluster as="ul" justify="between">
        <li>All</li>
        <li>Small Plates</li>
        <li>Sweets</li>
      </Cluster>
    );
    await expectNoA11yViolations(container);
  });

  describe("isScrollable — the mobile rail", () => {
    it("scrolls sideways instead of wrapping, and its items keep their size", () => {
      render(<Cluster isScrollable data-testid="rail" />);
      const rail = screen.getByTestId("rail");
      expect(rail).toHaveClass("flex-nowrap", "overflow-x-auto", "*:shrink-0");
      expect(rail).not.toHaveClass("flex-wrap");
    });

    // Review Focus 3, pure half — the rendered half is the ScrollableRailAt360 story.
    it("is reachable by keyboard, so it can be scrolled without a pointer", async () => {
      const user = userEvent.setup();
      render(
        <Cluster isScrollable role="group" aria-label="Categories">
          <span>All</span>
          <span>Sweets</span>
        </Cluster>
      );
      await user.tab();
      expect(screen.getByRole("group", { name: "Categories" })).toHaveFocus();
    });

    it("keeps 4px of room for focus rings on every side and when an item is scrolled to", () => {
      render(<Cluster isScrollable data-testid="rail" />);
      expect(screen.getByTestId("rail")).toHaveClass("p-1", "-m-1", "scroll-px-1");
    });

    it("gives up its own tab stop when the consumer passes tabIndex={-1}", async () => {
      const user = userEvent.setup();
      render(
        <Cluster isScrollable tabIndex={-1}>
          <button type="button">All</button>
        </Cluster>
      );
      await user.tab();
      expect(screen.getByRole("button", { name: "All" })).toHaveFocus();
    });

    it("keeps a scrolling ul a named list, with every item", async () => {
      const { container } = render(
        <Cluster as="ul" isScrollable aria-label="Categories">
          <li>All</li>
          <li>Small Plates</li>
          <li>Sweets</li>
        </Cluster>
      );
      const rail = screen.getByRole("list", { name: "Categories" });
      expect(rail).toHaveAttribute("tabindex", "0");
      expect(screen.getAllByRole("listitem")).toHaveLength(3);
      expect(screen.queryByRole("region")).not.toBeInTheDocument();
      await expectNoA11yViolations(container);
    });

    it("has no accessibility violations", async () => {
      const { container } = render(
        <Cluster isScrollable role="group" aria-label="Categories">
          <span>All</span>
          <span>Small Plates</span>
        </Cluster>
      );
      await expectNoA11yViolations(container);
    });
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./cluster"`.

- [ ] **Step 3: Implement**

`packages/ui/src/layouts/cluster/cluster.tsx`:

```tsx
import type { ComponentProps, ElementType } from "react";

import { componentVariants } from "../../lib/component-variants";
import { GAP_CLASS, type SpaceStep } from "../../lib/space";

const cluster = componentVariants({
  base: "flex min-w-0",
  variants: {
    space: GAP_CLASS,
    align: {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      baseline: "items-baseline",
    },
    justify: {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
    },
    isNowrap: { true: "flex-nowrap", false: "flex-wrap" },
    // The rail: one scrolling row whose items keep their size. Overflow clips at the padding box,
    // so 4px of padding (cancelled by a -4px margin — content stays aligned) plus 4px of scroll
    // padding leave room for the 2px focus outline at 2px offset, at rest and when scrolled to.
    isScrollable: { true: "-m-1 scroll-px-1 flex-nowrap overflow-x-auto p-1 *:shrink-0" },
  },
});

export interface ClusterProps extends ComponentProps<"div"> {
  /** Spacing step between items: N × 4px (`3` is 12px). */
  space?: SpaceStep;
  align?: "start" | "center" | "end" | "baseline";
  justify?: "start" | "center" | "end" | "between";
  /** Never wrap — use with care: a long row can overflow. */
  isNowrap?: boolean;
  /**
   * Scroll sideways instead of wrapping — the mobile category rail. The rail is a tab stop so the
   * keyboard can scroll it; name it with `aria-label` (plus `role="group"` on a `div` — never on a
   * `ul`, which keeps its list role), and pass `tabIndex={-1}` when every item is itself focusable.
   */
  isScrollable?: boolean;
  as?: "div" | "ul" | "ol" | "nav";
}

/** Any horizontal run of small things — buttons, tags, badges, meta. Wraps, so a row can never clip. */
export function Cluster({
  as = "div",
  space = 3,
  align = "center",
  justify = "start",
  isNowrap = false,
  isScrollable = false,
  className,
  ...props
}: ClusterProps) {
  const Element: ElementType = as;
  // A scroll container the keyboard cannot reach cannot be scrolled without a pointer (WCAG 2.1.1).
  const tabIndex = isScrollable ? 0 : undefined;
  return (
    <Element
      tabIndex={tabIndex}
      className={cluster({ space, align, justify, isNowrap, isScrollable, className })}
      {...props}
    />
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 5: Stories — card parity, the 360 wrap, and the rail proof**

The card (`Cluster.card.html`) rows:

- `wrap` — five secondary `sm` Buttons;
- `justify="space-between"` (now `between`) — Tags "All" and a selected "Sweets";
- `scroll` (now `isScrollable`) — the seven-category Tag rail.

`packages/ui/src/layouts/cluster/cluster.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, userEvent, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Tag } from "../../atoms/tag/tag";
import { GAP_CLASS } from "../../lib/space";
import { Cluster } from "./cluster";

const ACTIONS = ["Order Now", "See Menu", "Find Us", "Book a Table", "Franchise"];
const CATEGORIES = [
  "All",
  "Small Plates",
  "All Day",
  "Chai & Coffee",
  "Sweets",
  "Bar",
  "Breakfast",
];

/** styles.css base layer: `:focus-visible { outline: 2px; outline-offset: 2px }` reaches 4px out. */
const FOCUS_RING_REACH = 4;
/** Layout lands on sub-pixels; half a pixel is rounding, not a clipped ring. */
const SUBPIXEL = 0.5;

const meta = {
  title: "Layouts/Cluster",
  component: Cluster,
  args: {
    space: 3,
    align: "center",
    justify: "start",
    isNowrap: false,
    isScrollable: false,
    children: ACTIONS.map((label) => (
      <Button key={label} size="sm" variant="secondary">
        {label}
      </Button>
    )),
  },
  argTypes: { space: { control: "select", options: Object.keys(GAP_CLASS).map(Number) } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Any horizontal run of small things: buttons, tags, badges, meta. `space` is the step number, N × 4px. Wraps by default so a row can never clip. Pass `isScrollable` for the app category rail: it scrolls instead of wrapping, is a keyboard tab stop (name it with `role="group"` + `aria-label`; pass `tabIndex={-1}` when every item is focusable) and keeps room for focus rings.',
      },
    },
  },
} satisfies Meta<typeof Cluster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Wrap: Story = { name: "wrap (default)" };

export const JustifyBetween: Story = {
  name: 'justify="between"',
  args: {
    justify: "between",
    children: [
      <Tag key="all">All</Tag>,
      <Tag key="sweets" isSelected>
        Sweets
      </Tag>,
    ],
  },
};

export const Scroll: Story = {
  name: "isScrollable (app rail)",
  render: () => (
    <Cluster isScrollable role="group" aria-label="Categories">
      {CATEGORIES.map((label) => (
        <Tag key={label}>{label}</Tag>
      ))}
    </Cluster>
  ),
};

export const WrapAt360: Story = {
  name: "360px — wraps onto new lines, never clips",
  globals: { viewport: { value: "floor360", isRotated: false } },
};

/** Every `justify` value on one short row (dev parity). */
export const Justify: Story = {
  name: "justify",
  render: () => (
    <div className="grid gap-4">
      {(["start", "center", "end", "between"] as const).map((justify) => (
        <Cluster key={justify} justify={justify}>
          <Tag>{`justify="${justify}"`}</Tag>
          <Tag>Sweets</Tag>
        </Cluster>
      ))}
    </div>
  ),
};

/** The step scale on a row: 4px · 8px · 12px (the default) · 24px (dev parity). */
export const Spacing: Story = {
  name: "space — 1 · 2 · 3 · 6",
  render: () => (
    <div className="grid gap-4">
      {([1, 2, 3, 6] as const).map((space) => (
        <Cluster key={space} space={space}>
          <Tag>{`space={${String(space)}}`}</Tag>
          <Tag>Momos</Tag>
          <Tag>Sweets</Tag>
        </Cluster>
      ))}
    </div>
  ),
};

/** A menu meta row: `align="baseline"` keeps the small note on the dish name's line (dev parity). */
export const BaselineMetaRow: Story = {
  name: 'align="baseline" · a menu meta row',
  render: () => (
    <div className="max-w-90">
      <Cluster align="baseline" justify="between">
        <span className="font-display text-h4 text-text-heading">Paprikaa Chilli Paneer</span>
        <span className="font-body text-body-sm text-text-muted">Serves 2</span>
      </Cluster>
    </div>
  ),
};

/**
 * Review Focus 3: the rail scrolls, Tab reaches it (so the keyboard can scroll it), and a focused
 * item keeps its whole ring — at rest, and after focus has scrolled the last item into view.
 */
export const ScrollableRailAt360: Story = {
  name: "360px — rail keyboard reach and focus-ring room",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <Cluster isScrollable role="group" aria-label="Categories">
      {CATEGORIES.map((label) => (
        <Button key={label} size="sm" variant="secondary">
          {label}
        </Button>
      ))}
    </Cluster>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rail = canvas.getByRole("group", { name: "Categories" });
    const buttons = canvas.getAllByRole("button");
    const first = buttons[0];
    const last = buttons.at(-1);
    if (first === undefined || last === undefined) throw new Error("the rail needs buttons");
    const room = (item: HTMLElement) => {
      const outer = rail.getBoundingClientRect();
      const inner = item.getBoundingClientRect();
      return {
        top: inner.top - outer.top,
        bottom: outer.bottom - inner.bottom,
        start: inner.left - outer.left,
        end: outer.right - inner.right,
      };
    };
    const minimum = FOCUS_RING_REACH - SUBPIXEL;

    await expect(rail.scrollWidth).toBeGreaterThan(rail.clientWidth);
    await userEvent.tab();
    await expect(rail).toHaveFocus();

    await userEvent.tab();
    await expect(first).toHaveFocus();
    const atStart = room(first);
    await expect(atStart.top).toBeGreaterThanOrEqual(minimum);
    await expect(atStart.bottom).toBeGreaterThanOrEqual(minimum);
    await expect(atStart.start).toBeGreaterThanOrEqual(minimum);

    for (let step = 1; step < buttons.length; step += 1) {
      await userEvent.tab();
    }
    await expect(last).toHaveFocus();
    await expect(room(last).end).toBeGreaterThanOrEqual(minimum);
  },
};
```

- [ ] **Step 6: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { Cluster, type ClusterProps } from "./layouts/cluster/cluster";
```

- [ ] **Step 7: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/layouts/cluster packages/ui/src/index.ts`, then the gate. Expected: green, including `ScrollableRailAt360`.

If the far-end check fails at `end ≈ 0`, Chromium did not apply `scroll-padding` to focus scrolling. Report it; do not weaken the test. The fix is a trailing `after:` spacer of `w-1` on the rail, which is a component change.

Paste the summary lines.

```bash
git add packages/ui/src/layouts/cluster packages/ui/src/index.ts
git commit -m "feat(ui): Cluster layout

A wrapping horizontal group by spacing step. The scrollable rail is a
keyboard tab stop with 4px of padding and scroll padding, so focus rings
are never clipped; a Chromium story tabs through a 360px rail and
measures the ring room at both ends.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

