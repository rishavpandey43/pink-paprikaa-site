### Task 11: CheckCard

**Files:**

- Create: `packages/ui/src/molecules/check-card/check-card.tsx`, `check-card.test.tsx`, `check-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** none (handoff component)

**Interfaces:**

- Consumes: native `<input type="checkbox">`; `Icon` (`Check`); `shadow-selected` (Task 10); `transition-control` (Plan 2a); `useId`; `fakeRegister` (Plan 2b, tests).
- Produces: `CheckCard`, `type CheckCardProps` (contract §6). Server-safe. Every native input prop (`name`, `checked`, `defaultChecked`, `onChange`, `onBlur`, `ref`, `disabled`, `value`) goes to the checkbox, so `{...register("upfront")}` works; `className` goes to the card.

- [ ] **Step 1: Tokens** — none new: the tick box is `size-5.5` (22px) with `rounded-sm` (6px), the card `min-h-13` (52px), `shadow-selected` from Task 10.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/check-card/check-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations, fakeRegister } from "../../../vitest.setup";
import { CheckCard } from "./check-card";

const UPFRONT = {
  title: "Pay 3 months upfront",
  description: "Classic at ₹125 a meal, locked for 3 cycles",
} as const;

describe("CheckCard", () => {
  it("is a checkbox named by its title and described by its detail", () => {
    render(<CheckCard {...UPFRONT} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    expect(checkbox).toHaveAccessibleDescription(UPFRONT.description);
  });

  it("toggles by click and by Space, with the native change event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CheckCard {...UPFRONT} onChange={onChange} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    await user.click(checkbox);
    expect(checkbox).toBeChecked();
    await user.keyboard(" ");
    expect(checkbox).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("toggles when the card's words are clicked, not just the box", async () => {
    const user = userEvent.setup();
    render(<CheckCard {...UPFRONT} />);
    await user.click(screen.getByText(UPFRONT.description));
    expect(screen.getByRole("checkbox", { name: UPFRONT.title })).toBeChecked();
  });

  it("submits with its form under its name", async () => {
    const user = userEvent.setup();
    render(
      <form aria-label="Plan">
        <CheckCard {...UPFRONT} name="upfront" />
      </form>
    );
    await user.click(screen.getByRole("checkbox"));
    const form = screen.getByRole("form", { name: "Plan" });
    expect(form instanceof HTMLFormElement && new FormData(form).get("upfront")).toBe("on");
  });

  it("takes react-hook-form's register() unmodified", async () => {
    const user = userEvent.setup();
    const field = fakeRegister("upfront");
    render(<CheckCard {...UPFRONT} {...field} />);
    const checkbox = screen.getByRole("checkbox", { name: UPFRONT.title });
    expect(field.ref).toHaveBeenCalledWith(checkbox);
    expect(checkbox).toHaveAttribute("name", "upfront");
    await user.click(checkbox);
    expect(field.onChange).toHaveBeenCalledOnce();
    await user.tab();
    expect(field.onBlur).toHaveBeenCalledOnce();
  });

  it("stays a light island on dark fields and can be disabled", () => {
    const { container } = render(<CheckCard {...UPFRONT} disabled />);
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
    expect(screen.getByRole("checkbox")).toBeDisabled();
  });

  it("has no accessibility violations when checked", async () => {
    const { container } = render(<CheckCard {...UPFRONT} defaultChecked />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- check-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./check-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/check-card/check-card.tsx`:

```tsx
import { type ComponentProps, type ReactNode, useId } from "react";

import { Check } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const checkCard = componentVariants({
  slots: {
    root: "has-checked:shadow-selected flex min-h-13 cursor-pointer items-center gap-3 rounded-md border border-border-default bg-surface-card px-3.5 py-3 text-text-heading transition-control has-checked:border-border-brand has-checked:bg-pink-50 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-focus has-disabled:cursor-not-allowed has-disabled:border-border-subtle has-disabled:bg-ink-200 has-disabled:text-ink-400",
    // The native checkbox, restyled, with the tick stacked on it in the same grid cell.
    box: "grid shrink-0 place-items-center",
    input:
      "peer col-start-1 row-start-1 size-5.5 cursor-pointer appearance-none rounded-sm border-2 border-border-brand bg-ink-000 checked:bg-pink-500 focus-visible:outline-none disabled:cursor-not-allowed",
    tick: "pointer-events-none col-start-1 row-start-1 hidden text-ink-000 peer-checked:inline-flex",
    body: "flex min-w-0 flex-col items-start gap-0.5 text-left",
    title: "font-display text-body-sm font-bold",
    description: "text-caption",
  },
});

export interface CheckCardProps extends Omit<ComponentProps<"input">, "size" | "title" | "type"> {
  title: ReactNode;
  description?: ReactNode | undefined;
}

/** A card-sized toggle with a tick box (Pay 3 months upfront, No onion no garlic). */
export function CheckCard({ title, description, className, id, ...props }: CheckCardProps) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const styles = checkCard();

  return (
    <label data-surface="light" className={styles.root({ className })}>
      <span className={styles.box()}>
        <input
          type="checkbox"
          id={baseId}
          aria-labelledby={`${baseId}-title`}
          aria-describedby={description ? `${baseId}-description` : undefined}
          className={styles.input()}
          {...props}
        />
        <Icon icon={Check} size="xs" className={styles.tick()} />
      </span>
      <span className={styles.body()}>
        <span id={`${baseId}-title`} className={styles.title()}>
          {title}
        </span>
        {description ? (
          <span id={`${baseId}-description`} className={styles.description()}>
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- check-card 2>&1 | tail -8`
Expected: PASS (7 tests).

- [ ] **Step 6: Stories — both handoff usages (PlanCalculator), checked and disabled states**

`packages/ui/src/molecules/check-card/check-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { CheckCard } from "./check-card";

const meta = {
  title: "Molecules/CheckCard",
  component: CheckCard,
  args: {
    title: "Pay 3 months upfront",
    description: `Classic at ${formatRupees(125)} a meal, locked for 3 cycles`,
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-text-measure-prose">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'A card-sized toggle with a tick box, from the handoff PlanCalculator. A native checkbox: every input prop goes to it, so `{...register("upfront")}` works unmodified. The whole card is the label.',
      },
    },
  },
} satisfies Meta<typeof CheckCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, userEvent }) => {
    const checkbox = canvas.getByRole("checkbox", { name: "Pay 3 months upfront" });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard(" ");
    await expect(checkbox).not.toBeChecked();
  },
};

/** PlanCalculator "3. How many meals" — upfront, checked. */
export const Upfront: Story = { args: { defaultChecked: true } };

/** PlanCalculator "5. Make it yours" — no onion, no garlic. */
export const NoOnionGarlic: Story = {
  args: {
    title: `No onion, no garlic · +${formatRupees(30)} a meal`,
    description: "Cooked in a separate pan, off the main batch",
  },
};

export const Disabled: Story = { args: { disabled: true } };
```

- [ ] **Step 7: Export**

```ts
export { CheckCard, type CheckCardProps } from "./molecules/check-card/check-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/check-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/check-card packages/ui/src/index.ts
git commit -m "feat(ui): CheckCard molecule

Card-sized toggle on a restyled native checkbox (the handoff's upfront
and no-onion-garlic options). Native props go to the input, so
react-hook-form's register() works unmodified.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

