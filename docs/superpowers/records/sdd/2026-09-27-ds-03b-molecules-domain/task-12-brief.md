### Task 12: ChipGroup

**Files:**

- Create: `packages/ui/src/molecules/chip-group/chip-group.tsx`, `chip-group.test.tsx`, `chip-group.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: `ToggleGroup` from `radix-ui` (verified: `type="single"` → `role="radiogroup"` + items `role="radio"`/`aria-checked`, clears on a second press; `type="multiple"` → `role="toolbar"` + items `aria-pressed`; items with `disabled` get the native attribute and leave the roving order; the group's own `disabled?: boolean` is declared without `| undefined`, so it is always passed a boolean), `tagVariants`, `Icon`, `useId`.
- Produces: `ChipGroup`, `type ChipGroupProps`, `type ChipOption`, `type SingleChipGroupProps`, `type MultipleChipGroupProps` (contract §6 + deviation 5). **Client component.** Defaults: `variant = "chips"`, `disabled = false`, limit message `"N of M chosen."` / `"M of M chosen. Remove one to choose another."`. RHF `<Controller>`: `value`, `onValueChange`, `onBlur`, `name`.

- [ ] **Step 1: Tokens** — none new (Tag skins; the segmented track is `rounded-pill border bg-surface-card p-1 gap-1`).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/chip-group/chip-group.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ChipGroup } from "./chip-group";

const MEALS = [
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "both", label: "Lunch + Dinner" },
];

const STARTERS = [
  { value: "chilli-potato", label: "Chilli Potato" },
  { value: "honey-chilli-potato", label: "Honey Chilli Potato" },
  { value: "veg-manchurian", label: "Veg Manchurian" },
];

describe("ChipGroup", () => {
  it("as a single group is a named radio group that always keeps its one choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup type="single" label="Which meals" options={MEALS} onValueChange={onValueChange} />
    );
    expect(screen.getByRole("radiogroup", { name: "Which meals" })).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: "Dinner" }));
    await user.click(screen.getByRole("radio", { name: "Dinner" }));
    expect(screen.getByRole("radio", { name: "Dinner" })).toHaveAttribute("aria-checked", "true");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenCalledWith("dinner");
  });

  it("as a multiple group is a toolbar of toggle buttons", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        onValueChange={onValueChange}
      />
    );
    expect(screen.getByRole("toolbar", { name: "Starters" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    await user.click(screen.getByRole("button", { name: "Veg Manchurian" }));
    expect(screen.getByRole("button", { name: "Chilli Potato" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(onValueChange).toHaveBeenLastCalledWith(["chilli-potato", "veg-manchurian"]);
  });

  it("never lets a keyboard user pick more than maxSelected, and says why the rest are unavailable", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        onValueChange={onValueChange}
      />
    );
    await user.tab();
    await user.keyboard(" ");
    await user.keyboard("{ArrowRight} ");
    await user.keyboard("{ArrowRight}");
    const blocked = screen.getByRole("button", { name: "Veg Manchurian" });
    expect(blocked).toHaveFocus();
    expect(blocked).toHaveAttribute("aria-disabled", "true");
    await user.keyboard(" ");
    await user.keyboard("{Enter}");
    expect(blocked).toHaveAttribute("aria-pressed", "false");
    expect(onValueChange).toHaveBeenLastCalledWith(["chilli-potato", "honey-chilli-potato"]);
    expect(screen.getByRole("toolbar", { name: "Starters" })).toHaveAccessibleDescription(
      "2 of 2 chosen. Remove one to choose another."
    );
    expect(screen.getByText("2 of 2 chosen. Remove one to choose another.")).toHaveAttribute(
      "aria-live",
      "polite"
    );
  });

  it("frees the other chips as soon as one is removed", async () => {
    const user = userEvent.setup();
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        defaultValue={["chilli-potato", "honey-chilli-potato"]}
      />
    );
    expect(screen.getByRole("button", { name: "Veg Manchurian" })).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    expect(screen.getByRole("button", { name: "Veg Manchurian" })).not.toHaveAttribute(
      "aria-disabled"
    );
    expect(screen.getByText("1 of 2 chosen.")).toBeInTheDocument();
  });

  it("lets the page word the limit", () => {
    render(
      <ChipGroup
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={3}
        getLimitMessage={(selected, max) => `Pick ${String(max)} · ${String(selected)} picked`}
      />
    );
    expect(screen.getByText("Pick 3 · 0 picked")).toBeInTheDocument();
  });

  it("rejects a limit that could never be met", () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    expect(() =>
      render(<ChipGroup type="multiple" label="Starters" options={STARTERS} maxSelected={0} />)
    ).toThrow(RangeError);
    vi.restoreAllMocks();
  });

  it("submits its values with a form under its name", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ChipGroup type="multiple" label="Starters" name="starters" options={STARTERS} />
    );
    await user.click(screen.getByRole("button", { name: "Chilli Potato" }));
    await user.click(screen.getByRole("button", { name: "Veg Manchurian" }));
    const values = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="hidden"][name="starters"]'),
    ].map((input) => input.value);
    expect(values).toEqual(["chilli-potato", "veg-manchurian"]);
  });

  it("reports blur only when focus leaves the whole group", async () => {
    const user = userEvent.setup();
    const onBlur = vi.fn();
    render(
      <>
        <ChipGroup type="single" label="Which meals" options={MEALS} onBlur={onBlur} />
        <button type="button">Next step</button>
      </>
    );
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(onBlur).not.toHaveBeenCalled();
    await user.tab();
    expect(screen.getByRole("button", { name: "Next step" })).toHaveFocus();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  it("draws the segmented pill track, with unchosen options unfilled", () => {
    render(
      <ChipGroup
        type="single"
        variant="segmented"
        label="Meals per day"
        defaultValue="one"
        options={[
          { value: "one", label: "Lunch or dinner" },
          { value: "both", label: "Lunch + dinner" },
        ]}
      />
    );
    expect(screen.getByRole("radiogroup")).toHaveClass("rounded-pill");
    expect(screen.getByRole("radio", { name: "Lunch + dinner" })).toHaveClass("bg-transparent");
    expect(screen.getByRole("radio", { name: "Lunch or dinner" })).not.toHaveClass(
      "bg-transparent"
    );
  });

  it("disables one chip, or the whole group", () => {
    const { rerender } = render(
      <ChipGroup
        type="single"
        label="Which meals"
        options={MEALS.map((meal) => ({ ...meal, isDisabled: meal.value === "both" }))}
      />
    );
    expect(screen.getByRole("radio", { name: "Lunch + Dinner" })).toBeDisabled();
    rerender(<ChipGroup type="single" label="Which meals" options={MEALS} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it.each([
    [
      "single",
      <ChipGroup
        key="single"
        type="single"
        label="Which meals"
        options={MEALS}
        defaultValue="lunch"
      />,
    ],
    [
      "multiple with a limit",
      <ChipGroup
        key="multiple"
        type="multiple"
        label="Starters"
        options={STARTERS}
        maxSelected={2}
        defaultValue={["chilli-potato", "veg-manchurian"]}
      />,
    ],
  ])("has no accessibility violations (%s)", async (_, element) => {
    const { container } = render(element);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- chip-group 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./chip-group`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/chip-group/chip-group.tsx`:

```tsx
"use client";

import { ToggleGroup } from "radix-ui";
import { type FocusEvent, type ReactNode, useId, useState } from "react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { tagVariants } from "../../atoms/tag/tag";
import { componentVariants } from "../../lib/component-variants";

export interface ChipOption {
  value: string;
  label: ReactNode;
  icon?: IconComponent | undefined;
  isDisabled?: boolean | undefined;
}

type ChipGroupVariant = "chips" | "segmented";

interface ChipGroupBaseProps {
  /** Accessible name of the group — the visible step heading usually says the same. */
  label: string;
  options: ChipOption[];
  /** `chips`: wrapping Tag pills. `segmented`: a pill track switching one value (no panels). */
  variant?: ChipGroupVariant | undefined;
  className?: string | undefined;
  /** Renders hidden inputs, so the choice submits with a plain form. */
  name?: string | undefined;
  disabled?: boolean | undefined;
  /** Fires when focus leaves the group — react-hook-form's `field.onBlur`. */
  onBlur?: (() => void) | undefined;
}

export interface SingleChipGroupProps extends ChipGroupBaseProps {
  type: "single";
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
}

export interface MultipleChipGroupProps extends ChipGroupBaseProps {
  type: "multiple";
  value?: string[] | undefined;
  defaultValue?: string[] | undefined;
  onValueChange?: ((value: string[]) => void) | undefined;
  /** At most this many; the rest become unavailable (focusable, and the reason is announced). */
  maxSelected?: number | undefined;
  /** The status line under a limit. Default "2 of 3 chosen." / "3 of 3 chosen. Remove one to …". */
  getLimitMessage?: ((selected: number, max: number) => string) | undefined;
}

export type ChipGroupProps = SingleChipGroupProps | MultipleChipGroupProps;

const chipGroup = componentVariants({
  slots: {
    root: "flex flex-col gap-2",
    group: "flex flex-wrap gap-2",
    status: "m-0 max-w-none text-caption text-text-muted",
  },
  variants: {
    variant: {
      chips: {},
      segmented: {
        group:
          "w-fit flex-nowrap gap-1 rounded-pill border border-border-subtle bg-surface-card p-1",
      },
    },
  },
});

/**
 * Per-chip additions on top of the Tag skin. The Tag root already carries `controlStates`, so a chip
 * blocked by `maxSelected` (`aria-disabled`, still focusable) gets the grey disabled look and no
 * pointer events for free.
 */
const chipItem = componentVariants({
  variants: {
    // Unchosen segmented options shed the chip's outline and fill (the handoff's pill rail).
    isIdleSegment: { true: "border-transparent bg-transparent text-text-brand", false: "" },
  },
});

function defaultLimitMessage(selected: number, max: number): string {
  return selected >= max
    ? `${String(max)} of ${String(max)} chosen. Remove one to choose another.`
    : `${String(selected)} of ${String(max)} chosen.`;
}

/** Calls `onBlur` only when focus leaves the whole group, not when it moves between chips. */
function blurLeavingGroup(onBlur: () => void) {
  return (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget;
    if (next instanceof Node && event.currentTarget.contains(next)) return;
    onBlur();
  };
}

function HiddenValues({ name, values }: { name: string | undefined; values: readonly string[] }) {
  if (name === undefined) return null;
  return values.map((item) => <input key={item} type="hidden" name={name} value={item} />);
}

interface ChipItemsProps {
  options: ChipOption[];
  selected: readonly string[];
  variant: ChipGroupVariant;
  isLimitReached?: boolean | undefined;
}

/** ToggleGroup items wearing the Tag skin — never a Tag button nested inside an item. */
function ChipItems({ options, selected, variant, isLimitReached = false }: ChipItemsProps) {
  return options.map((option) => {
    const isSelected = selected.includes(option.value);
    const tag = tagVariants({ isSelected, isInteractive: true });
    return (
      <ToggleGroup.Item
        key={option.value}
        value={option.value}
        disabled={option.isDisabled}
        aria-disabled={isLimitReached && !isSelected ? true : undefined}
        className={tag.root({
          className: chipItem({ isIdleSegment: variant === "segmented" && !isSelected }),
        })}
      >
        {option.icon === undefined ? null : <Icon icon={option.icon} size="sm" />}
        <span className={tag.label()}>{option.label}</span>
      </ToggleGroup.Item>
    );
  });
}

function SingleChipGroup({
  label,
  options,
  variant = "chips",
  className,
  name,
  disabled = false,
  onBlur,
  value,
  defaultValue,
  onValueChange,
}: SingleChipGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const selected = value ?? uncontrolledValue;
  const values = selected === "" ? [] : [selected];
  const styles = chipGroup({ variant });

  const handleValueChange = (next: string) => {
    // A single group is a required choice: Radix clears it when the chosen chip is pressed again.
    if (next === "") return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div
      className={styles.root({ className })}
      onBlur={onBlur === undefined ? undefined : blurLeavingGroup(onBlur)}
    >
      <ToggleGroup.Root
        type="single"
        aria-label={label}
        value={selected}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={styles.group()}
      >
        <ChipItems options={options} selected={values} variant={variant} />
      </ToggleGroup.Root>
      <HiddenValues name={name} values={values} />
    </div>
  );
}

function MultipleChipGroup({
  label,
  options,
  variant = "chips",
  className,
  name,
  disabled = false,
  onBlur,
  value,
  defaultValue,
  onValueChange,
  maxSelected,
  getLimitMessage = defaultLimitMessage,
}: MultipleChipGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? []);
  const statusId = useId();
  if (maxSelected !== undefined && (!Number.isInteger(maxSelected) || maxSelected < 1)) {
    throw new RangeError(
      `ChipGroup: maxSelected must be a whole number ≥ 1, got ${String(maxSelected)}`
    );
  }
  const selected = value ?? uncontrolledValue;
  const isLimitReached = maxSelected !== undefined && selected.length >= maxSelected;
  const styles = chipGroup({ variant });

  const handleValueChange = (next: string[]) => {
    // A chip blocked by the limit was pressed: the selection stays as it is.
    if (maxSelected !== undefined && next.length > maxSelected) return;
    setUncontrolledValue(next);
    onValueChange?.(next);
  };

  return (
    <div
      className={styles.root({ className })}
      onBlur={onBlur === undefined ? undefined : blurLeavingGroup(onBlur)}
    >
      {maxSelected === undefined ? null : (
        <p id={statusId} aria-live="polite" className={styles.status()}>
          {getLimitMessage(selected.length, maxSelected)}
        </p>
      )}
      <ToggleGroup.Root
        type="multiple"
        aria-label={label}
        aria-describedby={maxSelected === undefined ? undefined : statusId}
        value={selected}
        onValueChange={handleValueChange}
        disabled={disabled}
        className={styles.group()}
      >
        <ChipItems
          options={options}
          selected={selected}
          variant={variant}
          isLimitReached={isLimitReached}
        />
      </ToggleGroup.Root>
      <HiddenValues name={name} values={selected} />
    </div>
  );
}

/**
 * Tag-based single or multiple selection for the calculators (meals, breads, spice, add-ons,
 * starter picks) and the segmented value switch. Radix ToggleGroup: roving focus, arrows move,
 * Space/Enter choose.
 */
export function ChipGroup(props: ChipGroupProps) {
  return props.type === "single" ? (
    <SingleChipGroup {...props} />
  ) : (
    <MultipleChipGroup {...props} />
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- chip-group 2>&1 | tail -8`
Expected: PASS (12 tests).

- [ ] **Step 6: Stories — every calculator group, the starter limit, the segmented switches, OnSurfaces and keyboard `play`**

`packages/ui/src/molecules/chip-group/chip-group.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { ChipGroup } from "./chip-group";

/** PlanCalculator "6. Standing add-ons" (`rates.js` → homely.addons). */
const ADD_ONS = [
  ["paneer", "Upgrade sabji to paneer gravy", 40],
  ["makhani", "Upgrade dal to Dal Makhani", 30],
  ["sabji", "Extra sabji (150–180g)", 35],
  ["dal", "Extra dal (150–180ml)", 25],
  ["raita", "Boondi or Kheera Raita", 25],
  ["lassi", "Sweet Lassi (250ml)", 49],
  ["kheer", "Rice Kheer", 39],
  ["gj", "Gulab Jamun (1pc)", 15],
  ["chaas", "Masala Chaas (200ml)", 39],
  ["papad", "Roasted Papad", 20],
  ["roti", "2 extra Tawa Roti", 30],
] as const;

/** DawatCalculator "3. Starters" — the Veg Starter Combo, pick any 3. */
const VEG_STARTERS = [
  "Chilli Potato",
  "Honey Chilli Potato",
  "Veg Manchurian",
  "Veg Hakka Noodles",
  "Veg Chowmein",
  "Veg Spring Roll",
  "Hara Bhara Kebab",
].map((item) => ({ value: item, label: item }));

const meta = {
  title: "Molecules/ChipGroup",
  component: ChipGroup,
  args: {
    type: "single",
    label: "Which meals",
    defaultValue: "lunch",
    options: [
      { value: "lunch", label: "Lunch" },
      { value: "dinner", label: "Dinner" },
      { value: "both", label: "Lunch + Dinner" },
    ],
  },
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
          'Tag-based selection from the handoff calculators on Radix ToggleGroup (never a Tag button nested in an item). `type="single"` is a required choice (it never clears); `type="multiple"` toggles, and `maxSelected` makes the rest unavailable — still focusable, with a live status line saying why. `variant="segmented"` is the pill-track value switch (Lunch / Both) without panels; use Tabs when panels change. For react-hook-form use `<Controller>` with `value`, `onValueChange`, `onBlur` and `name`.',
      },
    },
  },
} satisfies Meta<typeof ChipGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator "2. Which meals". */
export const WhichMeals: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Dinner" }));
    await expect(canvas.getByRole("radio", { name: "Dinner" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
    await userEvent.keyboard("{ArrowRight} ");
    await expect(canvas.getByRole("radio", { name: "Lunch + Dinner" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  },
};

/** PlanCalculator "5. Make it yours" — bread and spice. */
export const MakeItYours: Story = {
  render: () => (
    <div className="grid gap-3">
      <ChipGroup
        type="single"
        label="Rice and roti"
        defaultValue="both"
        options={[
          { value: "both", label: "Rice + roti" },
          { value: "rice", label: "Rice only (300g)" },
          { value: "roti", label: "Roti only (+2 roti)" },
        ]}
      />
      <ChipGroup
        type="single"
        label="Spice"
        defaultValue="regular"
        options={[
          { value: "regular", label: "Regular spice" },
          { value: "less", label: "Less spicy" },
          { value: "none", label: "No chilli" },
        ]}
      />
    </div>
  ),
};

/** PlanCalculator "6. Standing add-ons" — multiple. */
export const StandingAddOns: Story = {
  args: {
    type: "multiple",
    label: "Standing add-ons",
    defaultValue: ["lassi"],
    options: ADD_ONS.map(([value, name, price]) => ({
      value,
      label: `${name} +${formatRupees(price)}`,
    })),
  },
};

/** DawatCalculator starter picks — any 3, the rest unavailable once 3 are chosen. */
export const StarterPicks: Story = {
  args: {
    type: "multiple",
    label: "Veg starters",
    maxSelected: 3,
    options: VEG_STARTERS,
    getLimitMessage: (selected, max) => `Pick ${String(max)} · ${String(selected)} picked`,
  },
  play: async ({ canvas, userEvent }) => {
    for (const name of ["Chilli Potato", "Veg Manchurian", "Veg Spring Roll"]) {
      await userEvent.click(canvas.getByRole("button", { name }));
    }
    const blocked = canvas.getByRole("button", { name: "Hara Bhara Kebab" });
    await expect(blocked).toHaveAttribute("aria-disabled", "true");
    // Blocked chips take no pointer events (controlStates); the keyboard is the path to prove.
    blocked.focus();
    await userEvent.keyboard(" ");
    await expect(blocked).toHaveAttribute("aria-pressed", "false");
    await expect(canvas.getByText("Pick 3 · 3 picked")).toBeInTheDocument();
  },
};

/** HomelyMeals price list switch — segmented. */
export const Segmented: Story = {
  args: {
    type: "single",
    variant: "segmented",
    label: "Meals per day",
    defaultValue: "one",
    options: [
      { value: "one", label: "Lunch or dinner" },
      { value: "both", label: "Lunch + dinner" },
    ],
  },
};

/** OfficeLunch "Plate" — chips on the ink section. */
export const OnInk: Story = {
  args: {
    type: "single",
    label: "Plate",
    defaultValue: "everyday",
    options: [
      { value: "everyday", label: `Everyday · ${formatRupees(99)}` },
      { value: "classic", label: `Classic · ${formatRupees(119)}` },
    ],
  },
  render: (args) => (
    <div data-surface="ink" className="rounded-lg bg-surface-inverse p-6">
      <ChipGroup {...args} />
    </div>
  ),
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="grid min-w-0 flex-1 gap-3">
        <ChipGroup {...args} />
        <ChipGroup {...args} variant="segmented" />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export {
  ChipGroup,
  type ChipGroupProps,
  type ChipOption,
  type MultipleChipGroupProps,
  type SingleChipGroupProps,
} from "./molecules/chip-group/chip-group";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/chip-group packages/ui/src/index.ts`; then the limit in Chromium:

```bash
pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache -- chip-group 2>&1 | tail -10
```

Expected: every ChipGroup story passes, including `StarterPicks`' play.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/chip-group packages/ui/src/index.ts
git commit -m "feat(ui): ChipGroup molecule

Tag-skinned Radix ToggleGroup for the calculators: a single group is a
required choice that never clears; a multiple group honours maxSelected
by making the rest focusable-but-unavailable, with a live status line
the group is described by, so no keyboard path can exceed the limit.
Segmented pill-track variant; value/onValueChange/onBlur/name for RHF.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

