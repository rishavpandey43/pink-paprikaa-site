### Task 10: ChoiceCardGroup

**Files:**

- Create: `packages/design-tokens/tokens/component/choice-card.json`
- Modify: `packages/design-tokens/tokens/semantic/shadow.json` (`shadow.selected`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/lib/component-variants.ts` (`TEXT`, `SHADOW`)
- Create: `packages/ui/src/molecules/choice-card-group/choice-card-group.tsx`, `choice-card-group.test.tsx`, `choice-card-group.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: native `<fieldset>` / `<input type="radio">`; Plan 2c's `autogrid-min-<step>` utility (it sets only `grid-template-columns`, so the list's own `gap-2` — the handoff's 8px — stands); `transition-control` (Plan 2a); `useId`; `fakeRegister` (Plan 2b, tests).
- Produces: `ChoiceCardGroup`, `type ChoiceCardGroupProps`, `type ChoiceOption`, `type ChoiceGridMin` (contract §6 + deviation 1). Server-safe. Defaults: `min = "xs"`, `layout = "tile"`, `tone = "light"`, `isLegendHidden = false`. RHF: `{...register("plate")}` spreads `name`, `onChange`, `onBlur`, `ref` straight onto every radio. Documented accessible default: the visually hidden word "Was" before a struck price.

- [ ] **Step 1: Tokens and contrast pairs**

Append to `packages/design-tokens/tokens/semantic/shadow.json` inside `shadow`:

```json
"selected": {
  "$value": "inset 0 0 0 1px {color.pink.500}",
  "$description": "A selected card: doubles its 1px brand border to 2px without moving the layout (ChoiceCardGroup, CheckCard)."
}
```

Create `packages/design-tokens/tokens/component/choice-card.json`:

```json
{
  "text": {
    "$type": "typography",
    "choice-card-title": {
      "$value": { "fontSize": "15px", "lineHeight": 1.3, "fontWeight": "{font-weight.bold}" },
      "$description": "Choice card title and calculator step labels (handoff 15px Poppins 700)."
    }
  },
  "shadow": {
    "$type": "shadow",
    "choice-card-radio": {
      "$value": "inset 0 0 0 3px {color.ink.000}",
      "$description": "The white ring inside a checked radio on the brand-surface card."
    }
  }
}
```

In `component-variants.ts` append to `TEXT` `"choice-card-title",` and to `SHADOW` `"selected", "choice-card-radio",`.

Append to `groups` in `contrast-pairs.json`:

```json
{
  "id": "choice-card-selected",
  "surface": null,
  "pairs": [["color-pink-700", "color-pink-50"]],
  "min": 4.5
},
{
  "id": "choice-card-on-brand",
  "surface": null,
  "pairs": [["color-text-heading", "color-white-alpha-92"]],
  "backdrop": "color-surface-brand",
  "min": 4.5
}
```

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/design-tokens --skip-nx-cache 2>&1 | tail -6`
Expected: PASS (pink-700 on pink-50 ≈ 6.7:1; ink-900 on 92% white over the brand pink ≈ 16:1).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/choice-card-group/choice-card-group.test.tsx`:

```tsx
import type { ChangeEvent } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { ChoiceCardGroup, type ChoiceOption } from "./choice-card-group";

const PLATES: ChoiceOption[] = [
  {
    value: "everyday",
    title: "Everyday",
    price: formatRupees(120),
    description: "Home-style basics, kept simple.",
  },
  {
    value: "classic",
    title: "Classic",
    price: formatRupees(130),
    was: formatRupees(140),
    badge: <span>Pick</span>,
    description: "The full Pink Paprikaa menu. Our recommendation.",
  },
  {
    value: "signature",
    title: "Signature",
    price: formatRupees(200),
    description: "A different plate, every single day.",
  },
];

describe("ChoiceCardGroup", () => {
  it("is a fieldset named by its legend, with one radio per option", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />);
    expect(screen.getByRole("group", { name: "Your plate" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("names each radio by its title and price, and describes it with its blurb", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />);
    const classic = screen.getByRole("radio", { name: "Classic ₹130 Was ₹140" });
    expect(classic).toHaveAccessibleDescription("The full Pink Paprikaa menu. Our recommendation.");
  });

  it("starts on the default choice and reports a new one as a value and a native event", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const onChange = vi.fn<(event: ChangeEvent<HTMLInputElement>) => void>();
    render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        defaultValue="classic"
        onValueChange={onValueChange}
        onChange={onChange}
      />
    );
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeChecked();
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    expect(onValueChange).toHaveBeenLastCalledWith("signature");
    const [event] = onChange.mock.lastCall ?? [];
    expect(event?.target.name).toBe("plate");
    expect(event?.target.value).toBe("signature");
  });

  it("moves the choice with the arrow keys, like any radio group", async () => {
    const user = userEvent.setup();
    render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} defaultValue="everyday" />
    );
    await user.click(screen.getByRole("radio", { name: /Everyday/ }));
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveFocus();
  });

  it("submits the chosen value with its form, under its name", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Plan">
        <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
      </form>
    );
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    const form = screen.getByRole("form", { name: "Plan" });
    expect(form instanceof HTMLFormElement && new FormData(form).get("plate")).toBe("signature");
  });

  it("takes react-hook-form's register() unmodified — every radio gets the ref and the events", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("plate");
    render(<ChoiceCardGroup legend="Your plate" options={PLATES} {...field} />);
    for (const radio of screen.getAllByRole("radio")) {
      expect(field.ref).toHaveBeenCalledWith(radio);
      expect(radio).toHaveAttribute("name", "plate");
    }
    await user.click(screen.getByRole("radio", { name: /Signature/ }));
    expect(field.onChange).toHaveBeenCalledOnce();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalled();
  });

  it("follows a controlled value", () => {
    const { rerender } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        value="everyday"
        onValueChange={vi.fn()}
      />
    );
    expect(screen.getByRole("radio", { name: /Everyday/ })).toBeChecked();
    rerender(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        value="signature"
        onValueChange={vi.fn()}
      />
    );
    expect(screen.getByRole("radio", { name: /Signature/ })).toBeChecked();
  });

  it("disables one option, or the whole group through the fieldset", () => {
    const { rerender } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES.map((option) => ({ ...option, isDisabled: option.value === "signature" }))}
      />
    );
    expect(screen.getByRole("radio", { name: /Signature/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /Classic/ })).toBeEnabled();
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} disabled />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toBeDisabled();
  });

  it("hides the native radio on light cards and draws a real one on the brand surface", () => {
    const { rerender } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
    );
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveClass("sr-only");
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} tone="on-brand" />);
    expect(screen.getByRole("radio", { name: /Classic/ })).not.toHaveClass("sr-only");
    expect(screen.getByRole("radio", { name: /Classic/ })).toHaveClass("appearance-none");
  });

  it("puts the price under the title on tiles and at the end of rows", () => {
    const { rerender } = render(
      <ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} />
    );
    const card = () => screen.getByRole("radio", { name: /Classic/ }).closest("label");
    expect(card()?.lastElementChild).not.toHaveTextContent("₹130");
    rerender(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} layout="row" />);
    expect(card()?.lastElementChild).toHaveTextContent("₹130");
  });

  it("keeps the group named when the legend is hidden visually", () => {
    render(<ChoiceCardGroup name="plate" legend="Your plate" options={PLATES} isLegendHidden />);
    expect(screen.getByRole("group", { name: "Your plate" })).toBeInTheDocument();
    expect(screen.getByText("Your plate")).toHaveClass("sr-only");
  });

  it.each(["light", "on-brand"] as const)("has no accessibility violations (%s)", async (tone) => {
    const { container } = render(
      <ChoiceCardGroup
        name="plate"
        legend="Your plate"
        options={PLATES}
        tone={tone}
        defaultValue="classic"
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- choice-card-group 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./choice-card-group`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/choice-card-group/choice-card-group.tsx`:

```tsx
import {
  type ChangeEvent,
  type ComponentProps,
  type FocusEventHandler,
  type ReactNode,
  type Ref,
  useId,
} from "react";

import { componentVariants } from "../../lib/component-variants";

/**
 * A grid minimum on the AutoGrid scale (xs 140 · sm 200 · md 260 · lg 320 · xl 380 · 2xl 420px).
 * Restated here because a molecule may not import from layouts, not even a type.
 */
export type ChoiceGridMin = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

export interface ChoiceOption {
  value: string;
  title: ReactNode;
  /** Formatted with formatRupees, or words ("Included", "Quoted · 25+ guests"). */
  price?: ReactNode | undefined;
  was?: ReactNode | undefined;
  description?: ReactNode | undefined;
  /** A Badge beside the title, e.g. "Pick". */
  badge?: ReactNode | undefined;
  /** A line under the description, e.g. an offer Badge. */
  meta?: ReactNode | undefined;
  isDisabled?: boolean | undefined;
}

export interface ChoiceCardGroupProps extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onBlur" | "onChange" | "ref"
> {
  name: string;
  legend: ReactNode;
  isLegendHidden?: boolean | undefined;
  options: ChoiceOption[];
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?: ((value: string) => void) | undefined;
  /** Native change event of the chosen radio — react-hook-form's `register()` handler. */
  onChange?: ((event: ChangeEvent<HTMLInputElement>) => void) | undefined;
  onBlur?: FocusEventHandler<HTMLInputElement> | undefined;
  /** Given to every radio, so `register()` sees each one. */
  ref?: Ref<HTMLInputElement> | undefined;
  /** Tile width floor for the grid (tiles only). */
  min?: ChoiceGridMin | undefined;
  /** `tile`: stacked cards in a grid, price under the title. `row`: full-width rows, price at the end. */
  layout?: "tile" | "row" | undefined;
  /** `on-brand`: white cards with a visible radio, for a pink field (the Home trial selector). */
  tone?: "light" | "on-brand" | undefined;
}

const choiceCardGroup = componentVariants({
  slots: {
    root: "min-w-0",
    legend: "text-choice-card-title mb-2.5 font-display text-text-heading",
    list: "grid gap-2",
    card: "relative flex min-h-16 cursor-pointer rounded-md p-3 text-left transition-control has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-200 has-disabled:text-ink-400",
    input: "",
    body: "flex min-w-0 flex-1 flex-col items-start gap-1",
    head: "flex w-full flex-wrap items-center justify-between gap-1.5",
    title: "text-choice-card-title font-display",
    price:
      "flex flex-wrap items-baseline gap-1.5 font-display text-h4 font-black whitespace-nowrap",
    was: "font-body text-body-sm font-regular",
    description: "text-caption",
  },
  variants: {
    layout: {
      tile: { card: "flex-col items-start gap-1" },
      row: { card: "items-center gap-3", price: "shrink-0" },
    },
    tone: {
      light: {
        // 1px border + the inset `selected` shadow = a 2px border that never shifts the layout.
        card: "has-checked:shadow-selected border border-border-default bg-surface-card text-text-heading has-checked:border-border-brand has-checked:bg-pink-50 has-checked:text-pink-700",
        input: "sr-only",
      },
      "on-brand": {
        card: "border-2 border-transparent bg-white-alpha-92 text-text-heading has-checked:border-ink-900 has-checked:bg-ink-000",
        input:
          "checked:shadow-choice-card-radio size-4.5 shrink-0 cursor-pointer appearance-none rounded-pill border-2 border-ink-600 bg-ink-000 checked:border-pink-600 checked:bg-pink-600 focus-visible:outline-none",
      },
    },
    min: {
      xs: { list: "autogrid-min-xs" },
      sm: { list: "autogrid-min-sm" },
      md: { list: "autogrid-min-md" },
      lg: { list: "autogrid-min-lg" },
      xl: { list: "autogrid-min-xl" },
      "2xl": { list: "autogrid-min-2xl" },
    },
    isLegendHidden: { true: { legend: "sr-only" }, false: {} },
  },
});

/**
 * A card-style single choice (plates, plan lengths, dawats, platters, service, the trial, the
 * decide list). Native radios in a fieldset: keyboard, forms and `register()` work unmodified.
 */
export function ChoiceCardGroup({
  name,
  legend,
  isLegendHidden = false,
  options,
  value,
  defaultValue,
  onValueChange,
  onChange,
  onBlur,
  ref,
  min = "xs",
  layout = "tile",
  tone = "light",
  className,
  ...props
}: ChoiceCardGroupProps) {
  const baseId = useId();
  const styles = choiceCardGroup({
    layout,
    tone,
    isLegendHidden,
    ...(layout === "tile" ? { min } : {}),
  });
  // Attached only when the consumer listens, so a server render carries no handler.
  const handleChange =
    onChange === undefined && onValueChange === undefined
      ? undefined
      : (event: ChangeEvent<HTMLInputElement>) => {
          onChange?.(event);
          onValueChange?.(event.target.value);
        };

  return (
    <fieldset className={styles.root({ className })} {...props}>
      <legend className={styles.legend()}>{legend}</legend>
      <div className={styles.list()}>
        {options.map((option, index) => {
          const id = `${baseId}-${String(index)}`;
          const price =
            option.price === undefined ? null : (
              <span id={`${id}-price`} className={styles.price()}>
                {option.price}
                {option.was === undefined ? null : (
                  <s className={styles.was()}>
                    <span className="sr-only">Was </span>
                    {option.was}
                  </s>
                )}
              </span>
            );
          return (
            <label key={option.value} data-surface="light" className={styles.card()}>
              <input
                type="radio"
                name={name}
                value={option.value}
                disabled={option.isDisabled}
                ref={ref}
                onBlur={onBlur}
                onChange={handleChange}
                aria-labelledby={price === null ? `${id}-title` : `${id}-title ${id}-price`}
                aria-describedby={
                  option.description === undefined ? undefined : `${id}-description`
                }
                className={styles.input()}
                {...(value === undefined
                  ? { defaultChecked: option.value === defaultValue }
                  : { checked: option.value === value })}
              />
              <span className={styles.body()}>
                <span className={styles.head()}>
                  <span id={`${id}-title`} className={styles.title()}>
                    {option.title}
                  </span>
                  {option.badge}
                </span>
                {layout === "tile" ? price : null}
                {option.description === undefined ? null : (
                  <span id={`${id}-description`} className={styles.description()}>
                    {option.description}
                  </span>
                )}
                {option.meta}
              </span>
              {layout === "row" ? price : null}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- choice-card-group 2>&1 | tail -8`
Expected: PASS (13 tests).

- [ ] **Step 6: Stories — every handoff usage, with the handoff's copy and `rates.js` prices**

`packages/ui/src/molecules/choice-card-group/choice-card-group.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Star } from "lucide-react";
import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Badge } from "../../atoms/badge/badge";
import { ChoiceCardGroup, type ChoiceOption } from "./choice-card-group";

/** PlanCalculator "1. Your plate" — Classic at its launch price. */
const PLATES: ChoiceOption[] = [
  {
    value: "everyday",
    title: "Everyday",
    price: formatRupees(120),
    description: "Home-style basics, kept simple.",
  },
  {
    value: "classic",
    title: "Classic",
    price: formatRupees(130),
    was: formatRupees(140),
    badge: <Badge tone="brand">Pick</Badge>,
    description: "The full Pink Paprikaa menu. Our recommendation.",
  },
  {
    value: "signature",
    title: "Signature",
    price: formatRupees(200),
    description: "A different plate, every single day.",
  },
];

const meta = {
  title: "Molecules/ChoiceCardGroup",
  component: ChoiceCardGroup,
  args: { name: "plate", legend: "1. Your plate", options: PLATES, defaultValue: "classic" },
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
          'Card-style single choice from the handoff calculators: native radios in a fieldset, so arrow keys, forms and react-hook-form\'s `register()` work unmodified (`ref`, `onChange`, `onBlur` reach every radio). `layout="tile"` stacks cards in an AutoGrid (`min`); `layout="row"` gives full-width rows with the price at the end. `tone="on-brand"` is the Home trial selector: white cards with a visible radio on a pink field. Prices arrive formatted (`formatRupees`) or as words.',
      },
    },
  },
} satisfies Meta<typeof ChoiceCardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator — plate cards. */
export const Plates: Story = {
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("radio", { name: /Signature/ }));
    await expect(canvas.getByRole("radio", { name: /Signature/ })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: /Classic/ })).toBeChecked();
  },
};

/** PlanCalculator "3. How many meals" — the free-meal offer as meta. */
export const PlanLengths: Story = {
  args: {
    name: "length",
    legend: "3. How many meals",
    defaultValue: "weekday",
    options: [
      { value: "trial", title: "Trial", description: "5 meals · any days within a week" },
      {
        value: "weekday",
        title: "Weekday plan",
        description: "24 meals · Mon–Sat",
        meta: <Badge tone="success">Offer: +1 free / month</Badge>,
      },
      {
        value: "full",
        title: "Full month",
        description: "30 meals · every day",
        meta: <Badge tone="success">Offer: +1 free / month</Badge>,
      },
    ],
  },
};

/** DawatCalculator "2. Dawat". */
export const Dawats: Story = {
  args: {
    name: "dawat",
    legend: "2. Dawat",
    defaultValue: "signature",
    options: [
      { value: "classic", title: "Classic", price: formatRupees(149), description: "a head" },
      {
        value: "signature",
        title: "Signature",
        price: formatRupees(199),
        description: "a head · most ordered",
      },
      { value: "maharaja", title: "Maharaja", price: formatRupees(269), description: "a head" },
      {
        value: "royal",
        title: "Royal",
        price: formatRupees(549),
        description: "a head · 50+ guests",
      },
    ],
  },
};

/** DawatCalculator "4. Platter" — 200px tiles. */
export const Platters: Story = {
  args: {
    name: "platter",
    legend: "4. Platter",
    min: "sm",
    defaultValue: "",
    options: [
      { value: "", title: "No platter" },
      {
        value: "snClassic",
        title: "Classic Snacks Platter",
        price: formatRupees(99),
        description: "2 Samosa · 1 Dal Kachori · 1 Bread Pakoda · Jal Jeera or Chaas",
      },
      {
        value: "snChaat",
        title: "Chaat Snacks Platter",
        price: formatRupees(119),
        description: "Samosa Chole · Masala Papad · Pyaaz Kachori · Jal Jeera or Chaas",
      },
      {
        value: "snSandwich",
        title: "Sandwich Snacks Platter",
        price: formatRupees(129),
        description: "Veg Grilled Sandwich · Bread Pakoda · Jal Jeera or Chaas",
      },
      {
        value: "moVeg",
        title: "Veg Momos Platter",
        price: formatRupees(149),
        description: "6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure",
      },
      {
        value: "moPaneer",
        title: "Paneer Momos Platter",
        price: formatRupees(179),
        description: "6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure",
      },
    ],
  },
};

/** DawatCalculator "7. How you want it served" — rows. */
export const Service: Story = {
  args: {
    name: "service",
    legend: "7. How you want it served",
    layout: "row",
    defaultValue: "delivered",
    options: [
      {
        value: "delivered",
        title: "Delivered",
        price: "Included",
        description: "Sealed insulated trays. Free up to 8 km, beyond billed at actual.",
      },
      {
        value: "disposables",
        title: "Delivered with disposables",
        price: `+${formatRupees(25)} a head`,
        description: "Plus plates, spoons, napkins and serving spoons.",
      },
      {
        value: "setup",
        title: "Full setup and service",
        price: "Quoted · 25+ guests",
        description:
          "Buffet tables, chafing dishes, serving staff, cleanup. Quoted for your venue.",
      },
    ],
  },
};

/** Home "Taste it first." — the trial selector on the brand field, 5-meal totals at the end. */
export const TrialOnBrand: Story = {
  args: {
    name: "trial",
    legend: "Trial plate",
    isLegendHidden: true,
    layout: "row",
    tone: "on-brand",
    defaultValue: "classic",
    options: [
      {
        value: "everyday",
        title: "Everyday",
        description: `${formatRupees(120)} a meal`,
        price: formatRupees(600),
      },
      {
        value: "classic",
        title: "Classic",
        badge: (
          <Badge tone="brand" icon={Star}>
            Recommended
          </Badge>
        ),
        description: `${formatRupees(130)} a meal · launch price (was ${formatRupees(140)})`,
        price: formatRupees(650),
      },
      {
        value: "signature",
        title: "Signature",
        description: `${formatRupees(200)} a meal`,
        price: formatRupees(1000),
      },
    ],
  },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-7">
      <ChoiceCardGroup {...args} />
    </div>
  ),
};

/** HomelyMeals "30 seconds to decide" — question rows. */
export const DecideList: Story = {
  args: {
    name: "decide",
    legend: "Not sure which one?",
    isLegendHidden: true,
    layout: "row",
    defaultValue: "full",
    options: [
      { value: "taste", title: "“I want to taste it first”" },
      { value: "full", title: "“I want the full Pink Paprikaa experience”" },
      { value: "basics", title: "“I just want the basics, kept simple”" },
      { value: "spoiled", title: "“I want to feel a little spoiled every day”" },
      { value: "both", title: "“I don’t want to think about lunch or dinner”" },
      { value: "household", title: "“Two or more of us live together”" },
      { value: "group", title: "“I’m ordering for a PG, hostel or office”" },
    ],
  },
};
```

- [ ] **Step 7: Export**

```ts
export {
  ChoiceCardGroup,
  type ChoiceCardGroupProps,
  type ChoiceGridMin,
  type ChoiceOption,
} from "./molecules/choice-card-group/choice-card-group";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/design-tokens/tokens/component/choice-card.json packages/design-tokens/tokens/semantic/shadow.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/choice-card-group packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/choice-card.json packages/design-tokens/tokens/semantic/shadow.json packages/design-tokens/contrast-pairs.json packages/ui/src/molecules/choice-card-group packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): ChoiceCardGroup molecule

Card-style single choice from the handoff calculators on native radios
in a fieldset: tiles in an AutoGrid or full-width rows, a real radio on
the brand-surface trial selector. ref/onChange/onBlur reach every radio,
so react-hook-form's register() works unmodified. Adds the semantic
shadow.selected (a 2px selected border that never shifts layout).

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

