### Task 6: Switch

**Files:**

- Create: `packages/design-tokens/tokens/component/switch.json`
- Create: `packages/ui/src/atoms/switch/switch.tsx`, `switch.test.tsx`, `switch.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/switch/switch.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                            | Ruling  | Where / clause                                                |
| --------------------------------------------------- | ------- | ------------------------------------------------------------- |
| Radix Switch + `onCheckedChange`                    | DROP    | D7, D17, contract §3: `<input type="checkbox" role="switch">` |
| off by default, named by its label                  | ALREADY | Step 2                                                        |
| click turns it on and reports the state             | ALREADY | Step 2 click + register() tests                               |
| space bar after Tab, with a visible focus ring      | ADD     | Step 2 new test                                               |
| disabled ignores clicks                             | ADD     | Step 2 disabled test                                          |
| second line as the description                      | ALREADY | Step 2                                                        |
| on: track floods pink, knob slides                  | ALREADY | Step 2                                                        |
| disabled: real grey track, never opacity            | ALREADY | Step 2 (+ no-`opacity-` assertion added)                      |
| label left, track right, so knobs align             | ALREADY | Step 2 (`order-last`, text `flex-1`)                          |
| caller `className` on the row, replacing a conflict | ADD     | Step 2 new test                                               |
| axe over off, on + described, disabled              | ADD     | Step 2 a11y test                                              |
| stories default / on / description / states         | ALREADY | Step 6                                                        |
| story: preferences panel (the real shape)           | ADD     | Step 6 `PreferencesPanel`                                     |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `ChoiceControl` (placement `end`, `isLabelHidden`), `componentVariants`, `fakeRegister`, `OnSurfaces` (Plan 2a).
- Produces: `Switch`, `SwitchProps` as contract §3, plus `isLabelHidden?: boolean` (deviation 4). A native `<input type="checkbox" role="switch">`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/switch.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "switch-width": { "$value": "46px", "$description": "Track width." },
    "switch-height": { "$value": "28px", "$description": "Track height." },
    "switch-knob": { "$value": "22px" }
  }
}
```

Append to `SPACING`: `"switch-width", "switch-height", "switch-knob"`. The knob's offsets are quarter steps: 3px inset `top-0.75 left-0.75`, 18px slide (46 − 22 − 2 × 3) `translate-x-4.5`. No new contrast pair (label and description as Task 4).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/switch/switch.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { Switch } from "./switch";

const trackOf = (input: HTMLElement) => input.nextElementSibling?.firstElementChild;

describe("Switch", () => {
  it("is a native checkbox with role switch, named by its label", () => {
    render(<Switch label="Order updates" />);
    const toggle = screen.getByRole("switch", { name: "Order updates" });
    expect(toggle).toHaveAttribute("type", "checkbox");
    expect(toggle).not.toBeChecked();
  });

  it("sets the label first and the track last, so a column of switches aligns", () => {
    render(<Switch label="Order updates" />);
    const toggle = screen.getByRole("switch");
    expect(toggle.closest("label")).toHaveClass("items-center", "gap-3.5");
    expect(toggle.nextElementSibling).toHaveClass("order-last");
  });

  it("toggles on click and on the space bar", async () => {
    const user = userEvent.setup();
    render(<Switch label="Marketing texts" />);
    const toggle = screen.getByRole("switch");
    await user.click(screen.getByText("Marketing texts"));
    expect(toggle).toBeChecked();
    await user.keyboard(" ");
    expect(toggle).not.toBeChecked();
  });

  it("toggles from the space bar after Tab, ringing its track", async () => {
    const user = userEvent.setup();
    render(<Switch label="Jain preferences" />);
    await user.tab();
    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveFocus();
    await user.keyboard(" ");
    expect(toggle).toBeChecked();
    expect(trackOf(toggle)).toHaveClass("group-has-focus-visible/choice:outline-2");
  });

  it("puts className on the row, replacing a conflicting class", () => {
    render(<Switch label="Order updates" className="gap-8" />);
    const row = screen.getByRole("switch").closest("label");
    expect(row).toHaveClass("gap-8");
    expect(row).not.toHaveClass("gap-3.5");
  });

  it("fills the track and slides the knob when on — CSS off the native state", () => {
    render(<Switch label="Order updates" defaultChecked />);
    const track = trackOf(screen.getByRole("switch"));
    expect(track).toHaveClass("group-has-checked/choice:bg-pink-500", "w-switch-width");
    expect(track?.firstElementChild).toHaveClass("group-has-checked/choice:translate-x-4.5");
  });

  it("announces its description", () => {
    render(<Switch label="Jain preferences" description="Hides onion and garlic." />);
    expect(screen.getByRole("switch", { name: "Jain preferences" })).toHaveAccessibleDescription(
      "Hides onion and garlic."
    );
  });

  it("can hide its label visually and keep it as the name", () => {
    render(<Switch label="Order updates" isLabelHidden />);
    expect(screen.getByRole("switch", { name: "Order updates" })).toBeInTheDocument();
    expect(screen.getByText("Order updates")).toHaveClass("sr-only");
  });

  it("takes react-hook-form's register(): ref, name, onChange and onBlur reach the native input", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("alerts");
    render(<Switch label="Order updates" {...field} />);
    const toggle = screen.getByRole("switch");

    expect(field.ref).toHaveBeenCalledWith(toggle);
    expect(toggle).toHaveAttribute("name", "alerts");
    await user.click(toggle);
    expect(field.onChange).toHaveBeenCalledTimes(1);
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledTimes(1);
  });

  it("disables with a real fill (never opacity) and ignores clicks", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { container } = render(
      <Switch
        label="Delivery updates"
        description="Delivery starts in 2027."
        disabled
        onChange={onChange}
      />
    );
    const toggle = screen.getByRole("switch");
    expect(toggle).toBeDisabled();
    expect(trackOf(toggle)).toHaveClass("group-has-disabled/choice:bg-ink-200");
    expect(container.innerHTML).not.toMatch(/opacity-/);
    await user.click(screen.getByText("Delivery updates"));
    expect(toggle).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no accessibility violations off, on and described, or disabled", async () => {
    const { container } = render(
      <>
        <Switch label="Order updates" />
        <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
        <Switch label="Delivery updates" description="Delivery starts in 2027." disabled />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './switch'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/switch/switch.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { ChoiceControl } from "../../lib/choice-control";
import { componentVariants } from "../../lib/component-variants";

/** 46×28 track, 22px knob, 220ms slide; pink when on. */
const toggle = componentVariants({
  slots: {
    track: [
      "h-switch-height w-switch-width relative flex rounded-pill bg-ink-300 transition-colors duration-base ease-out",
      "group-has-checked/choice:bg-pink-500",
      "group-has-focus-visible/choice:outline-2 group-has-focus-visible/choice:outline-offset-2 group-has-focus-visible/choice:outline-focus",
      "group-has-disabled/choice:bg-ink-200",
    ],
    knob: "size-switch-knob absolute top-0.75 left-0.75 rounded-pill bg-ink-000 shadow-1 transition-transform duration-base ease-out group-has-checked/choice:translate-x-4.5",
  },
});

export interface SwitchProps extends Omit<ComponentProps<"input">, "type" | "size"> {
  label: ReactNode;
  description?: ReactNode;
  /** Hides the label visually — it stays the accessible name — for a row that already labels it. */
  isLabelHidden?: boolean | undefined;
}

/** Instant-effect toggle for settings; never inside a save-on-submit form. */
export function Switch(props: SwitchProps) {
  const styles = toggle();
  return (
    <ChoiceControl
      type="checkbox"
      role="switch"
      placement="end"
      control={
        <span className={styles.track()}>
          <span className={styles.knob()} />
        </span>
      }
      {...props}
    />
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Switch.card.html`; docs from `Switch.prompt.md`)**

`packages/ui/src/atoms/switch/switch.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Switch } from "./switch";

const meta = {
  title: "Atoms/Switch",
  component: Switch,
  args: { label: "Order updates" },
  render: (args) => (
    <div className="max-w-text-measure-prose w-full">
      <Switch {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Toggle for settings that take effect immediately — never inside a save-on-submit form. The label sits left and the control right, so a column of switches aligns. 46×28 track, 22px knob, 220ms slide. `isLabelHidden` keeps the label as the accessible name when the row around it already shows one.",
      },
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const OnAndOff: Story = {
  name: "on / off",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-4">
      <Switch label="Order updates" defaultChecked />
      <Switch label="Marketing texts" />
    </div>
  ),
};

export const Description: Story = {
  name: "description",
  args: { label: "Jain preferences", description: "Hides onion and garlic.", defaultChecked: true },
};

export const Disabled: Story = {
  name: "disabled",
  args: { label: "Delivery updates", description: "Delivery starts in 2027.", disabled: true },
};

export const LabelHidden: Story = {
  name: "isLabelHidden",
  args: { label: "Order updates", isLabelHidden: true, defaultChecked: true },
};

/** The real shape: a preferences panel where every row takes effect immediately. */
export const PreferencesPanel: Story = {
  name: "preferences panel",
  render: () => (
    <div className="max-w-text-measure-prose grid w-full gap-5 rounded-lg border border-border-subtle p-5">
      <Switch
        label="Order updates"
        description="Order confirmations and pickup times."
        defaultChecked
      />
      <Switch label="Marketing texts" description="Offers and new dishes, at most once a week." />
      <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
      <Switch label="Delivery updates" description="Delivery starts in 2027." disabled />
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Switch label="Jain preferences" description="Hides onion and garlic." defaultChecked />
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

```ts
export { Switch, type SwitchProps } from "./atoms/switch/switch";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/switch packages/design-tokens/tokens/component/switch.json
```

Run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Switch atom

A native checkbox with role=switch on the shared choice row, control last
so a column of switches aligns. The track fills and the knob slides through
CSS off the native state; isLabelHidden keeps the name for a switch inside
a row that already labels it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

