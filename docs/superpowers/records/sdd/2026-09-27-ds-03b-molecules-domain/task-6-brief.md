### Task 6: FilterBar

**Files:**

- Create: `packages/ui/src/molecules/filter-bar/filter-bar.tsx`, `filter-bar.test.tsx`, `filter-bar.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/filter-bar/filter-bar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                 | Ruling  | Where, or the spec clause                                                                                        |
| ---------------------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------------- |
| One pill per category inside a named group                                               | ALREADY | named `radiogroup` of `radio` items (test "is a named radio group…")                                             |
| Default group name "Filter by category"                                                  | ALREADY | `label` is required (contract §6) — no copy default (D9)                                                         |
| Exactly one pill selected; the pressed value is reported                                 | ALREADY | tests "chooses a filter…", "keeps exactly one filter chosen…"                                                    |
| An option's value is separate from its label                                             | ALREADY | options are `{ value, label }` (test reports `"sweets"` for "Sweets")                                            |
| Bare-string options                                                                      | DROP    | spec §8.2 — object lists only (`{ value, label }`)                                                               |
| Scrolls on one line by default, wraps with `isWrapping`                                  | ALREADY | test "scrolls on one line by default…"                                                                           |
| The statement badge is not a filter                                                      | ADD     | assertion in "pins the statement badge…": still one radio per option                                             |
| Trailing control pinned at the end, never squeezed                                       | ADD     | `trailing` wrapper slot `shrink-0` (the badge already has it)                                                    |
| Without a handler, a press changes nothing                                               | ALREADY | superseded: uncontrolled by default (`defaultValue`), controlled via `value` (test "follows a controlled value") |
| Caller `className` replaces its own gap                                                  | ADD     | test "lets a caller className replace its own gap"                                                               |
| axe with note, trailing and icons                                                        | ALREADY | last test                                                                                                        |
| Stories `Default`, `Wrapping`, `WithStatement`, `Scrolling`, `WithIcons`, `Narrow` (360) | ALREADY | `Playground`, `Wrap` (with the note), `Scroll` (`w-90` = 360px), `Icons`                                         |
| Story `WithTrailingControl`                                                              | ADD     | story `WithTrailing`                                                                                             |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `ToggleGroup` from `radix-ui` (verified in `packages/ui/node_modules/radix-ui` → `@radix-ui/react-toggle-group`: `type="single"` renders `role="radiogroup"` with items `role="radio"` + `aria-checked`, roving focus on by default, and calls `onValueChange("")` when the pressed item is pressed again), `tagVariants`, `Icon`, `Badge` (`tone="success"`, `icon={Leaf}`).
- Produces: `FilterBar`, `type FilterBarProps`, `type FilterOption` (contract §6 + deviation 6). **Client component.** Uncontrolled default: the first option. RHF: `value` / `onValueChange` for `<Controller>`.

- [ ] **Step 1: Tokens** — none new (the chips are Tag skins; `gap-2.5` = the design system's 10px).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/filter-bar/filter-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Clock, Flame } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { FilterBar } from "./filter-bar";

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "small-plates", label: "Small Plates" },
  { value: "all-day", label: "All Day" },
  { value: "sweets", label: "Sweets" },
];

describe("FilterBar", () => {
  it("is a named radio group with the first option chosen by default", () => {
    render(<FilterBar label="Menu category" options={CATEGORIES} />);
    expect(screen.getByRole("radiogroup", { name: "Menu category" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "All" })).toHaveAttribute("aria-checked", "true");
  });

  it("chooses a filter on click and reports it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<FilterBar label="Menu category" options={CATEGORIES} onValueChange={onValueChange} />);
    await user.click(screen.getByRole("radio", { name: "Sweets" }));
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("sweets");
  });

  it("keeps exactly one filter chosen when the chosen one is pressed again", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <FilterBar
        label="Menu category"
        options={CATEGORIES}
        defaultValue="sweets"
        onValueChange={onValueChange}
      />
    );
    await user.click(screen.getByRole("radio", { name: "Sweets" }));
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("moves with the arrow keys and chooses with Space", async () => {
    const user = userEvent.setup();
    render(<FilterBar label="Menu category" options={CATEGORIES} />);
    await user.tab();
    expect(screen.getByRole("radio", { name: "All" })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Small Plates" })).toHaveFocus();
    await user.keyboard(" ");
    expect(screen.getByRole("radio", { name: "Small Plates" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <FilterBar label="Menu category" options={CATEGORIES} value="all-day" />
    );
    expect(screen.getByRole("radio", { name: "All Day" })).toHaveAttribute("aria-checked", "true");
    rerender(<FilterBar label="Menu category" options={CATEGORIES} value="sweets" />);
    expect(screen.getByRole("radio", { name: "Sweets" })).toHaveAttribute("aria-checked", "true");
  });

  it("scrolls on one line by default and wraps on request", () => {
    const { container, rerender } = render(
      <FilterBar label="Menu category" options={CATEGORIES} />
    );
    expect(container.firstElementChild).toHaveClass("overflow-x-auto", "flex-nowrap");
    rerender(<FilterBar label="Menu category" options={CATEGORIES} isWrapping />);
    expect(container.firstElementChild).toHaveClass("flex-wrap");
  });

  it("pins the statement badge and the trailing slot after the filters", () => {
    render(
      <FilterBar
        label="Menu category"
        options={CATEGORIES}
        note="100% Vegetarian"
        trailing={<button type="button">Search</button>}
      />
    );
    expect(screen.getByText("100% Vegetarian")).toBeInTheDocument();
    // A standing statement, never a filter: still exactly one radio per option.
    expect(screen.getAllByRole("radio")).toHaveLength(CATEGORIES.length);
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("lets a caller className replace its own gap", () => {
    const { container } = render(
      <FilterBar label="Menu category" options={CATEGORIES} className="gap-1" />
    );
    expect(container.firstElementChild).toHaveClass("gap-1");
    expect(container.firstElementChild).not.toHaveClass("gap-2.5");
  });

  it("has no accessibility violations with icons, note and trailing", async () => {
    const { container } = render(
      <FilterBar
        label="Dietary and speed filters"
        options={[
          { value: "spicy", label: "Hot", icon: Flame },
          { value: "quick", label: "Under 15 min", icon: Clock },
        ]}
        note="100% Vegetarian"
        isWrapping
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- filter-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./filter-bar`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/filter-bar/filter-bar.tsx`:

```tsx
"use client";

import { Leaf } from "lucide-react";
import { ToggleGroup } from "radix-ui";
import { type ReactNode, useState } from "react";

import { Badge } from "../../atoms/badge/badge";
import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { tagVariants } from "../../atoms/tag/tag";
import { componentVariants } from "../../lib/component-variants";

export interface FilterOption {
  value: string;
  label: string;
  icon?: IconComponent | undefined;
}

export interface FilterBarProps {
  /** Accessible name of the radio group, e.g. "Menu category". */
  label: string;
  options: FilterOption[];
  value?: string | undefined;
  /** Uncontrolled starting filter. Default: the first option. */
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Wrap onto more rows (the website) instead of scrolling on one line (the app). */
  isWrapping?: boolean | undefined;
  /** A static statement pinned after the filters, e.g. "100% Vegetarian". */
  note?: ReactNode | undefined;
  trailing?: ReactNode | undefined;
  className?: string | undefined;
}

const filterBar = componentVariants({
  slots: {
    root: "flex items-center gap-2.5",
    group: "flex gap-2.5",
    // Neither the statement badge nor the trailing control is squeezed by a long rail.
    note: "shrink-0",
    trailing: "shrink-0",
  },
  variants: {
    isWrapping: {
      true: { root: "flex-wrap", group: "flex-wrap" },
      false: { root: "flex-nowrap overflow-x-auto pb-1", group: "flex-nowrap" },
    },
  },
});

/** Menu category rail. Exactly one filter is chosen at a time; the rail scrolls unless it wraps. */
export function FilterBar({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  isWrapping = false,
  note,
  trailing,
  className,
}: FilterBarProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(
    defaultValue ?? options[0]?.value ?? ""
  );
  const selected = value ?? uncontrolledValue;
  const styles = filterBar({ isWrapping });

  const handleValueChange = (next: string) => {
    // Radix clears a single group when the chosen item is pressed again; a filter always has one.
    if (next === "") return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div className={styles.root({ className })}>
      <ToggleGroup.Root
        type="single"
        aria-label={label}
        value={selected}
        onValueChange={handleValueChange}
        className={styles.group()}
      >
        {options.map((option) => {
          const tag = tagVariants({ isSelected: option.value === selected, isInteractive: true });
          return (
            <ToggleGroup.Item key={option.value} value={option.value} className={tag.root()}>
              {option.icon === undefined ? null : <Icon icon={option.icon} size="sm" />}
              <span className={tag.label()}>{option.label}</span>
            </ToggleGroup.Item>
          );
        })}
      </ToggleGroup.Root>
      {note ? (
        <Badge tone="success" icon={Leaf} className={styles.note()}>
          {note}
        </Badge>
      ) : null}
      {trailing ? <div className={styles.trailing()}>{trailing}</div> : null}
    </div>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- filter-bar 2>&1 | tail -8`
Expected: PASS (9 tests).

- [ ] **Step 6: Stories — `FilterBar.card.html` rows "wrap" (website), "scroll" (app), "icons", plus Playground, OnSurfaces and a keyboard `play`**

`packages/ui/src/molecules/filter-bar/filter-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf, Search } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { FilterBar } from "./filter-bar";

const WEBSITE = [
  { value: "all", label: "All" },
  { value: "small-plates", label: "Small Plates" },
  { value: "all-day", label: "All Day" },
  { value: "chai-coffee", label: "Chai & Coffee" },
  { value: "sweets", label: "Sweets" },
];

const meta = {
  title: "Molecules/FilterBar",
  component: FilterBar,
  args: { label: "Menu category", options: WEBSITE, note: "100% Vegetarian", isWrapping: true },
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
          "Menu category rail on both the website and the app. Scrolls horizontally by default (the app pattern); pass `isWrapping` for the website. Exactly one option is selected at a time — pressing the chosen filter keeps it. Radix ToggleGroup items styled with the Tag skin; arrow keys move, Space/Enter choose.",
      },
    },
  },
} satisfies Meta<typeof FilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "wrap" — the website, with the statement badge. */
export const Wrap: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Sweets" }));
    await expect(canvas.getByRole("radio", { name: "Sweets" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.keyboard("{ArrowLeft} ");
    await expect(canvas.getByRole("radio", { name: "Chai & Coffee" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** Card row "scroll" — the app rail, one line. */
export const Scroll: Story = {
  args: {
    isWrapping: false,
    note: undefined,
    options: [...WEBSITE, { value: "bar", label: "Bar" }],
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
};

/** Card row "icons". */
export const Icons: Story = {
  args: {
    label: "Dietary and speed filters",
    note: undefined,
    defaultValue: "jain",
    options: [
      { value: "jain", label: "Jain", icon: Leaf },
      { value: "spicy", label: "Hot", icon: Flame },
      { value: "quick", label: "Under 15 min", icon: Clock },
    ],
  },
};

/** `trailing`: a control pinned to the end of the rail, never squeezed by it. */
export const WithTrailing: Story = {
  args: {
    trailing: (
      <Button size="sm" variant="ghost" icon={Search}>
        Search
      </Button>
    ),
  },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <FilterBar {...args} />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  FilterBar,
  type FilterBarProps,
  type FilterOption,
} from "./molecules/filter-bar/filter-bar";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/filter-bar packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/filter-bar packages/ui/src/index.ts
git commit -m "feat(ui): FilterBar molecule

Category rail on Radix ToggleGroup (radiogroup semantics, roving focus)
styled with the Tag skin, never a nested Tag button. Exactly one filter
stays chosen; scrolls on one line or wraps; statement badge and
trailing slot.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

