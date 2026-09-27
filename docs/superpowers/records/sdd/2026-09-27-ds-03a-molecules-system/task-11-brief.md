### Task 11: Tabs (client, Radix Tabs)

Design-system sources: `components/molecules/Tabs.*` (underline); handoff `ThisWeek.dc.html`, `HomelyMeals.dc.html`, `Catering.dc.html` (segmented pill rail: white, 1px `--border-subtle`, 4px padding, 44px pink-500 active pill, pink-700 idle). Card rows: default (four items) · two items.

**Files:**

- Create: `packages/design-tokens/tokens/component/tabs.json`
- Create: `packages/ui/src/molecules/tabs/tabs.tsx`, `tabs.test.tsx`, `tabs.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/tabs/tabs.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                               | Ruling  | Where / why                                                                                                      |
| ---------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| underline trigger has a 44px hit height                                | ADD     | `min-h-hit` on the underline trigger (spec §5.5) + assertion                                                     |
| active tab underlined in brand pink                                    | ADD     | assertion `aria-selected:after:bg-border-brand`                                                                  |
| leading glyph beside a tab label                                       | ADD     | trigger `inline-flex items-center gap-2`; the glyph rides in the ReactNode `label` + test + `WithIcons` story    |
| caller `className` merges                                              | ADD     | test "merges a caller className…"                                                                                |
| `Narrow` story (360px)                                                 | ADD     | `Narrow` story                                                                                                   |
| per-tab `isDisabled` (inert "off today" section)                       | DELTA   | contracts §5 `TabItem` is `{ value, label, content }` — proposed contract delta, see the 3a audit                |
| `isFullWidth` (equal shares across a card)                             | DELTA   | not in contracts §5 `TabsProps` — proposed contract delta, see the 3a audit                                      |
| underline row scrolls sideways instead of wrapping                     | ALREADY | the row wraps (`flex-wrap gap-y-3`): never clips or overflows at 360px — covered differently (see audit concern) |
| `icon?: LucideIcon` on `TabItem`                                       | ALREADY | `label: ReactNode` carries the glyph (contracts §5)                                                              |
| optional `label`                                                       | ALREADY | `label: string` required (contracts §5) — an unnamed tab list is an a11y gap                                     |
| named list; first tab default; defaultValue; click; arrows; controlled | ALREADY | tests "is a named tab list…", "starts at defaultValue", "selects a tab…", "moves and selects…", "reports but…"   |
| `Default`, `TwoSections` stories                                       | ALREADY | `Playground`, `TwoItems`                                                                                         |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `radix-ui` → `Tabs` (`Root`, `List`, `Trigger`, `Content` — verified in `@radix-ui/react-tabs` 1.1.21: triggers carry `aria-selected` and `data-state`, activate on mouse-down and on focus (automatic), arrows/Home/End rove; `Content` spreads its props after `hidden`, so `forceMount` + our own `hidden` keeps every panel mounted).
- Produces: `Tabs`, `TabsProps`, `TabItem` — contract §5. Every panel is in the server HTML (inactive ones `hidden`), so an inactive menu section is still indexed and every trigger's `aria-controls` resolves.

- [ ] **Step 1: Component tokens and contrast pair**

`packages/design-tokens/tokens/component/tabs.json`:

```json
{
  "color": {
    "$type": "color",
    "tabs-segmented-fg": {
      "$value": "{color.pink.700}",
      "$description": "Idle label on the handoff's segmented tab rail (white fill)."
    }
  },
  "text": {
    "$type": "typography",
    "tabs-label": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1.4,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Underline tab label (Poppins 700)."
    }
  }
}
```

Append `"tabs-label"` to `TEXT`. Append to `contrast-pairs.json` → `groups` (the rail is a light island; the active pill is Plan 1's `on-brand-fill` pair):

```json
{
  "id": "tabs",
  "surface": null,
  "pairs": [["color-tabs-segmented-fg", "color-surface-card"]],
  "min": 4.5
}
```

Rebuild and run the token tests. Expected: PASS (pink-700 on white ≈ 7.0).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/tabs/tabs.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Soup } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Icon } from "../../atoms/icon/icon";
import { type TabItem, Tabs } from "./tabs";

const MENU: TabItem[] = [
  { value: "all-day", label: "All Day", content: <p>The all-day menu.</p> },
  { value: "breakfast", label: "Breakfast", content: <p>The breakfast menu.</p> },
  { value: "bar", label: "Bar", content: <p>The bar menu.</p> },
];

describe("Tabs", () => {
  it("is a named tab list whose first tab is selected by default", () => {
    render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByRole("tablist", { name: "Menu sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "All Day" })).toHaveTextContent(
      "The all-day menu."
    );
  });

  it("keeps every panel in the page and hides the inactive ones", () => {
    render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByText("The breakfast menu.")).not.toBeVisible();
    expect(screen.getByText("The all-day menu.")).toBeVisible();
  });

  it("starts at defaultValue", () => {
    render(<Tabs label="Menu sections" items={MENU} defaultValue="bar" />);
    expect(screen.getByRole("tab", { name: "Bar" })).toHaveAttribute("aria-selected", "true");
  });

  it("selects a tab on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Tabs label="Menu sections" items={MENU} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("tab", { name: "Breakfast" }));
    expect(screen.getByRole("tab", { name: "Breakfast" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("The breakfast menu.")).toBeVisible();
    expect(onValueChange).toHaveBeenCalledWith("breakfast");
  });

  it("moves and selects with the arrow keys, Home and End", async () => {
    const user = userEvent.setup();
    render(<Tabs label="Menu sections" items={MENU} />);
    await user.click(screen.getByRole("tab", { name: "All Day" }));
    await user.keyboard("{ArrowRight}");
    const breakfast = screen.getByRole("tab", { name: "Breakfast" });
    expect(breakfast).toHaveFocus();
    expect(breakfast).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{End}");
    expect(screen.getByRole("tab", { name: "Bar" })).toHaveFocus();
    await user.keyboard("{Home}");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveFocus();
  });

  it("reports but keeps the caller's tab when controlled", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <Tabs label="Menu sections" items={MENU} value="all-day" onValueChange={onValueChange} />
    );
    await user.click(screen.getByRole("tab", { name: "Breakfast" }));
    expect(onValueChange).toHaveBeenCalledWith("breakfast");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveAttribute("aria-selected", "true");
  });

  it("draws the underline rail by default and the segmented rail as a light island of pills", () => {
    const { rerender } = render(<Tabs label="Menu sections" items={MENU} />);
    expect(screen.getByRole("tablist")).toHaveClass("border-b");
    // A 44px target (spec §5.5, dev parity) with the 3px pink underline under the active tab.
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass(
      "min-h-hit",
      "aria-selected:after:bg-border-brand"
    );
    rerender(<Tabs label="Menu sections" items={MENU} variant="segmented" />);
    const rail = screen.getByRole("tablist");
    expect(rail).toHaveAttribute("data-surface", "light");
    expect(rail).toHaveClass("rounded-pill");
    expect(screen.getByRole("tab", { name: "All Day" })).toHaveClass("min-h-hit");
  });

  it("lays a glyph passed in the label beside its text", () => {
    render(
      <Tabs
        label="Menu sections"
        items={[
          {
            value: "all-day",
            label: (
              <>
                <Icon icon={Soup} size="sm" />
                All Day
              </>
            ),
            content: <p>The all-day menu.</p>,
          },
          ...MENU.slice(1),
        ]}
      />
    );
    const tab = screen.getByRole("tab", { name: "All Day" });
    expect(tab).toHaveClass("inline-flex", "gap-2");
    expect(tab.querySelector("svg.lucide-soup")).toBeInTheDocument();
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(<Tabs label="Menu sections" items={MENU} className="gap-2" />);
    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("has no accessibility violations in either variant", async () => {
    const { container } = render(
      <>
        <Tabs label="Menu sections" items={MENU} />
        <Tabs
          label="This week"
          variant="segmented"
          items={[
            { value: "classic", label: "Classic & Signature", content: <p>Classic.</p> },
            { value: "everyday", label: "Everyday", content: <p>Everyday.</p> },
          ]}
        />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/tabs 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./tabs`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/tabs/tabs.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

import { Tabs as RadixTabs } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";
import { useControllableState } from "../../lib/use-controllable-state";

const tabs = componentVariants({
  slots: {
    root: "grid min-w-0 gap-6",
    list: "flex min-w-0",
    // `inline-flex gap-2`: a glyph passed in a ReactNode `label` sits beside its text (dev parity).
    trigger:
      "inline-flex shrink-0 items-center justify-center gap-2 font-display font-bold whitespace-nowrap transition-colors duration-fast ease-out",
    panel: "min-w-0",
  },
  variants: {
    variant: {
      underline: {
        list: "flex-wrap gap-x-7 gap-y-3 border-b border-border-subtle",
        trigger:
          "text-tabs-label relative min-h-hit pb-3 text-text-subtle after:absolute after:inset-x-0 after:-bottom-px after:h-0.75 after:rounded-t-xs after:transition-colors after:duration-base after:ease-out hover:text-text-heading aria-selected:text-text-heading aria-selected:after:bg-border-brand",
      },
      segmented: {
        list: "flex-wrap gap-1 justify-self-start rounded-pill border border-border-subtle bg-surface-card p-1",
        trigger:
          "text-tabs-segmented-fg min-h-hit rounded-pill px-4 py-2.5 text-body-sm hover:bg-surface-page-alt aria-selected:bg-surface-brand aria-selected:text-text-on-brand aria-selected:hover:bg-brand-hover",
      },
    },
  },
  defaultVariants: { variant: "underline" },
});

export interface TabItem {
  value: string;
  label: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  /** Accessible name of the tab list, e.g. "Menu sections". */
  label: string;
  items: TabItem[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** `underline` (design system) or the handoff's `segmented` pill rail. */
  variant?: "underline" | "segmented" | undefined;
  className?: string | undefined;
}

/**
 * Switch sections inside one page. `underline` (design system): Poppins 700 with a 3px pink bar
 * under the active tab. `segmented` (handoff): a white pill rail with a pink active pill. For
 * filtering a list use FilterBar; for app navigation use TabBar.
 */
export function Tabs({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  variant,
  className,
}: TabsProps) {
  const [selected, setSelected] = useControllableState({
    value,
    defaultValue: defaultValue ?? items[0]?.value ?? "",
    onChange: onValueChange,
  });
  const styles = tabs({ variant });

  return (
    <RadixTabs.Root
      value={selected}
      onValueChange={setSelected}
      className={styles.root({ className })}
    >
      <RadixTabs.List
        aria-label={label}
        data-surface={variant === "segmented" ? "light" : undefined}
        className={styles.list()}
      >
        {items.map((item) => (
          <RadixTabs.Trigger key={item.value} value={item.value} className={styles.trigger()}>
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content
          key={item.value}
          value={item.value}
          forceMount
          hidden={item.value !== selected}
          className={styles.panel()}
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/tabs 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/tabs/tabs.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Croissant, IceCreamCone, Soup } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Icon } from "../../atoms/icon/icon";
import { type TabItem, Tabs } from "./tabs";

function panel(text: string) {
  return <p className="m-0 text-body-sm text-text-muted">{text}</p>;
}

const MENU: TabItem[] = [
  { value: "all-day", label: "All Day", content: panel("All-day plates, 8am – 11:30pm.") },
  { value: "breakfast", label: "Breakfast", content: panel("Breakfast plates.") },
  { value: "bar", label: "Bar", content: panel("Chai, coffee and coolers.") },
  { value: "sweets", label: "Sweets", content: panel("Kulfi, halwa and bakes.") },
];

const meta = {
  title: "Molecules/Tabs",
  component: Tabs,
  args: { label: "Menu sections", items: MENU, onValueChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          "Tabs switch sections inside one page. `underline` (the design system): Poppins 700, a 3px pink bar under the active tab. `segmented` (the handoff's pill rail on This Week, Homely Meals and Catering): a white rail with a pink active pill, 44px tall. Arrow keys move between tabs and select as they go; Home/End jump. Every panel stays in the page (inactive ones hidden), so search engines index the whole menu. For filtering a list use FilterBar; for app-level navigation use TabBar.",
      },
    },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "default". */
export const Playground: Story = {
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Breakfast" }));
    await expect(args.onValueChange).toHaveBeenCalledWith("breakfast");
    await userEvent.keyboard("{ArrowRight}");
    await expect(canvas.getByRole("tab", { name: "Bar" })).toHaveFocus();
    await expect(canvas.getByText("Chai, coffee and coolers.")).toBeVisible();
  },
};

/** Card row "two items". */
export const TwoItems: Story = {
  args: {
    label: "Feed",
    items: [
      { value: "feed", label: "Feed", content: panel("Posts.") },
      { value: "stories", label: "Stories", content: panel("Stories.") },
    ],
  },
};

/** Handoff This Week rail — `variant="segmented"`. */
export const Segmented: Story = {
  args: {
    label: "This week's menu",
    variant: "segmented",
    items: [
      { value: "classic", label: "Classic & Signature", content: panel("The classic week.") },
      { value: "everyday", label: "Everyday", content: panel("The everyday week.") },
    ],
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Everyday" }));
    await expect(canvas.getByRole("tab", { name: "Everyday" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  },
};

/** Dev parity: a glyph before each label — pass it inside the ReactNode `label`. */
export const WithIcons: Story = {
  args: {
    items: [
      {
        value: "all-day",
        label: (
          <>
            <Icon icon={Soup} size="sm" />
            All Day
          </>
        ),
        content: panel("All-day plates, 8am – 11:30pm."),
      },
      {
        value: "breakfast",
        label: (
          <>
            <Icon icon={Croissant} size="sm" />
            Breakfast
          </>
        ),
        content: panel("Breakfast plates."),
      },
      {
        value: "sweets",
        label: (
          <>
            <Icon icon={IceCreamCone} size="sm" />
            Sweets
          </>
        ),
        content: panel("Kulfi, halwa and bakes."),
      },
    ],
  },
};

/** Dev parity: the smallest supported width (320px of content) — the rail wraps, it never clips. */
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

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { type TabItem, Tabs, type TabsProps } from "./molecules/tabs/tabs";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/tabs packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/tabs packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/tabs.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Tabs molecule on Radix Tabs

Underline tabs from the design system and the handoff's segmented pill
rail. Every panel stays mounted (inactive ones hidden), so the whole menu
is in the server HTML and every aria-controls resolves.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

