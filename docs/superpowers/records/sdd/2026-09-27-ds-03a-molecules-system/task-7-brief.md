### Task 7: Alert (+ client dismiss leaf)

Design-system sources: `components/molecules/Alert.*`; handoff `PlanCalculator.dc.html` (nudge → `brand`, PG hint → `neutral`), `DawatCalculator.dc.html` (warnings on ink → `warning`, a light island). Card rows: tone (info, success) · warning, danger · brand + action · dismissible.

**Files:**

- Create: `packages/design-tokens/tokens/component/alert.json`
- Create: `packages/ui/src/molecules/alert/alert.tsx`, `alert-dismiss.tsx`, `alert.test.tsx`, `alert.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/alert/alert.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                | Ruling  | Where / why                                                                                            |
| ----------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------ |
| each tone fills its soft ground                                         | ADD     | fill column in the tone `it.each`                                                                      |
| full 1px border, never a coloured left edge                             | ADD     | test "carries a full border…"                                                                          |
| dismiss hit area ≥ 36px (dev: IconButton `sm`)                          | ADD     | `AlertDismiss` `relative before:absolute before:-inset-2` (24px glyph, 40px hit) + assertion           |
| caller `className` merges                                               | ADD     | test "merges a caller className…"                                                                      |
| `Narrow` story (360px, title + dismiss wrap)                            | ADD     | `Narrow` story                                                                                         |
| `role="status"` for every tone                                          | ALREADY | `status` for all but `danger`, which is `alert` (deviation 11 — better)                                |
| title above message; flush one-liner without title; one action; dismiss | ALREADY | tests "is a polite status…", "renders its action slot…", "offers a dismiss button only…"               |
| glyph not overridable ("the tone is the mark")                          | DROP    | contracts §5 `AlertProps.icon` (the handoff PG hint uses its own glyph)                                |
| warning glyph in tandoor, body text heading-coloured                    | DROP    | spec D4 / §5.3: the tone's `text-text-*` token paints glyph and text (turmeric-strong passes AA)       |
| `Tones`, `WithAction`, `MessageOnly`, `Dismissible` stories             | ALREADY | `InfoAndSuccess`, `WarningAndDanger`, `BrandWithAction`, `Nudge` / `Neutral` (no title), `Dismissible` |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `Button`, `OnSurfaces` (Plan 2a, stories).
- Produces: `Alert`, `AlertProps` — contract §5 (deviation 11). `alert.tsx` is server-safe; `alert-dismiss.tsx` (`"use client"`) is the dismiss button, rendered only when `onDismiss` is given.

- [ ] **Step 1: Component token and contrast pair**

`packages/design-tokens/tokens/component/alert.json`:

```json
{
  "text": {
    "$type": "typography",
    "alert-title": {
      "$value": {
        "fontSize": "15px",
        "lineHeight": 1.6,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Alert title (Poppins 700)."
    }
  }
}
```

Append `"alert-title"` to `TEXT`. The four status tones reuse Plan 1's `status-on-soft` pairs and `neutral` reuses `light-text` (heading on sunken); the brand tone paints a new pair — append to `contrast-pairs.json` → `groups`:

```json
{
  "id": "alert",
  "surface": null,
  "pairs": [["color-pink-800", "color-surface-brand-soft"]],
  "min": 4.5
}
```

Rebuild and run the token tests (as in Task 6 Step 1). Expected: PASS (≈ 8.4).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/alert/alert.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Building2 } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Alert } from "./alert";

describe("Alert", () => {
  it("is a polite status message with its title and body", () => {
    render(<Alert title="Kitchen is busy">Pickup is running 25 minutes today.</Alert>);
    const alert = screen.getByRole("status");
    expect(alert).toHaveTextContent("Kitchen is busy");
    expect(alert).toHaveTextContent("Pickup is running 25 minutes today.");
  });

  it("interrupts for danger", () => {
    render(
      <Alert tone="danger" title="That card didn't go through">
        Try another card or pay by UPI.
      </Alert>
    );
    expect(screen.getByRole("alert")).toHaveTextContent("That card didn't go through");
  });

  it.each([
    ["info", "lucide-info", "text-text-info", "bg-status-info-soft"],
    ["success", "lucide-check", "text-text-success", "bg-status-success-soft"],
    ["warning", "lucide-triangle-alert", "text-text-warning", "bg-status-warning-soft"],
    ["danger", "lucide-circle-alert", "text-text-danger", "bg-status-danger-soft"],
    ["brand", "lucide-megaphone", "text-pink-800", "bg-surface-brand-soft"],
    ["neutral", "lucide-info", "text-text-heading", "bg-surface-sunken"],
  ] as const)("paints the %s tone with its glyph and soft ground", (tone, glyph, colour, fill) => {
    const { container } = render(<Alert tone={tone}>Message.</Alert>);
    expect(container.firstElementChild).toHaveClass(colour, fill);
    expect(container.querySelector(`svg.${glyph}`)).toBeInTheDocument();
  });

  it("carries a full border rather than a coloured left edge", () => {
    const { container } = render(<Alert tone="danger">Try another card or pay by UPI.</Alert>);
    expect(container.firstElementChild).toHaveClass("border", "border-status-danger");
    expect(container.firstElementChild).not.toHaveClass("border-l-4");
  });

  it("merges a caller className over its own radius", () => {
    const { container } = render(<Alert className="rounded-lg">We now take UPI.</Alert>);
    expect(container.firstElementChild).toHaveClass("rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("rounded-md");
  });

  it("takes a glyph of its own", () => {
    const { container } = render(
      <Alert tone="neutral" icon={Building2}>
        Ordering for a PG, hostel or office of 20+? Talk to us about group pricing.
      </Alert>
    );
    expect(container.querySelector("svg.lucide-building-2")).toBeInTheDocument();
  });

  it("renders its action slot under the message", () => {
    render(
      <Alert
        tone="brand"
        title="New in Sector 57"
        action={<button type="button">See the Menu</button>}
      >
        Doors open Friday, 8am.
      </Alert>
    );
    expect(screen.getByRole("button", { name: "See the Menu" })).toBeInTheDocument();
  });

  it("offers a dismiss button only when onDismiss is given", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const { rerender } = render(<Alert>We now take UPI at every counter.</Alert>);
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    rerender(<Alert onDismiss={onDismiss}>We now take UPI at every counter.</Alert>);
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    // A 24px glyph button with a 40px hit area (dev parity; spec §5.5 floor is 24px).
    expect(dismiss).toHaveClass("size-6", "before:-inset-2");
    await user.click(dismiss);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("is a light island, so its action and links keep light skins on a dark field", () => {
    const { container } = render(
      <Alert tone="warning">Full setup and service starts at 50 guests.</Alert>
    );
    expect(container.firstElementChild).toHaveAttribute("data-surface", "light");
  });

  it("has no accessibility violations with a title, an action and a dismiss", async () => {
    const { container } = render(
      <Alert
        tone="brand"
        title="New in Sector 57"
        action={<button type="button">See the Menu</button>}
        onDismiss={vi.fn()}
      >
        Doors open Friday, 8am.
      </Alert>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/alert 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./alert`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/alert/alert-dismiss.tsx`:

```tsx
"use client";

import { X } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";

export interface AlertDismissProps {
  onDismiss: () => void;
}

/** Alert's dismiss button — the one interactive corner of an otherwise static molecule. */
export function AlertDismiss({ onDismiss }: AlertDismissProps) {
  return (
    <button
      type="button"
      aria-label="Dismiss"
      onClick={onDismiss}
      // 24px to see, 40px to hit (`before:-inset-2`, dev parity): the pseudo-element takes the tap.
      className="relative grid size-6 shrink-0 place-items-center rounded-pill text-current transition-opacity duration-fast ease-out before:absolute before:-inset-2 hover:opacity-70"
    >
      <Icon icon={X} size="sm" />
    </button>
  );
}
```

`packages/ui/src/molecules/alert/alert.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Check, CircleAlert, Info, Megaphone, TriangleAlert } from "lucide-react";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import { AlertDismiss } from "./alert-dismiss";

const alert = componentVariants({
  slots: {
    root: "flex items-start gap-3 rounded-md border px-4 py-3.5",
    icon: "mt-px",
    body: "min-w-0 flex-1",
    title: "text-alert-title m-0 font-display",
    content: "text-body-sm text-pretty",
    action: "mt-2.5",
  },
  variants: {
    tone: {
      info: { root: "border-status-info bg-status-info-soft text-text-info" },
      success: { root: "border-status-success bg-status-success-soft text-text-success" },
      warning: { root: "border-status-warning bg-status-warning-soft text-text-warning" },
      danger: { root: "border-status-danger bg-status-danger-soft text-text-danger" },
      brand: { root: "border-border-brand bg-surface-brand-soft text-pink-800" },
      neutral: {
        root: "border-border-subtle bg-surface-sunken text-text-heading",
        icon: "text-text-brand",
      },
    },
    hasTitle: { true: { content: "mt-0.75" } },
  },
  defaultVariants: { tone: "info", hasTitle: false },
});

type AlertTone = NonNullable<AlertProps["tone"]>;

const TONE_ICON: Readonly<Record<AlertTone, IconComponent>> = {
  info: Info,
  success: Check,
  warning: TriangleAlert,
  danger: CircleAlert,
  brand: Megaphone,
  neutral: Info,
};

export interface AlertProps extends Omit<ComponentProps<"div">, "title"> {
  tone?: "info" | "success" | "warning" | "danger" | "brand" | "neutral" | undefined;
  title?: ReactNode;
  /** Usually one small ghost Button. */
  action?: ReactNode;
  /** Shows the dismiss button. */
  onDismiss?: (() => void) | undefined;
  /** Replaces the tone's glyph (the handoff's PG hint uses Building2). */
  icon?: IconComponent | undefined;
}

/**
 * Persistent inline message — kitchen delays, closed outlets, payment problems, calculator nudges.
 * Soft tint with a matching full 1px border (never a coloured left border only). A light island on
 * any surface. Use Toast for transient confirmations instead.
 */
export function Alert({
  tone = "info",
  title,
  action,
  onDismiss,
  icon,
  className,
  children,
  ...props
}: AlertProps) {
  const hasTitle = title !== undefined && title !== null;
  const styles = alert({ tone, hasTitle });

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      data-surface="light"
      className={styles.root({ className })}
      {...props}
    >
      <Icon icon={icon ?? TONE_ICON[tone]} size="md" className={styles.icon()} />
      <div className={styles.body()}>
        {hasTitle ? <p className={styles.title()}>{title}</p> : null}
        {children === undefined || children === null ? null : (
          <div className={styles.content()}>{children}</div>
        )}
        {action === undefined ? null : <div className={styles.action()}>{action}</div>}
      </div>
      {onDismiss === undefined ? null : <AlertDismiss onDismiss={onDismiss} />}
    </div>
  );
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/alert 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/alert/alert.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Building2, TrendingDown } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Alert } from "./alert";

const meta = {
  title: "Molecules/Alert",
  component: Alert,
  args: {
    tone: "warning",
    title: "Kitchen is busy",
    children: "Pickup is running 25 minutes today.",
  },
  parameters: {
    docs: {
      description: {
        component:
          "Persistent inline message — kitchen delays, closed outlets, payment problems, calculator nudges. Soft tint fill with a matching **full** 1px border, never a coloured left border only. Tones: info, success, warning, danger (announced as an alert), brand, and neutral (the handoff's quiet hint). `action` takes one small Button; `onDismiss` adds a dismiss button. An Alert is a light island: on a pink or ink field it stays a tinted panel with light-skinned actions. Use Toast for transient confirmations instead.",
      },
    },
  },
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone" — info and success. */
export const InfoAndSuccess: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert tone="info" title="Pickup only">
        Delivery starts in 2027.
      </Alert>
      <Alert tone="success" title="Order confirmed">
        Kitchen has it. Counter 2.
      </Alert>
    </div>
  ),
};

/** Card row "warning danger". */
export const WarningAndDanger: Story = {
  render: () => (
    <div className="grid gap-3">
      <Alert tone="warning" title="Kitchen is busy">
        Pickup is running 25 minutes today.
      </Alert>
      <Alert tone="danger" title="That card didn't go through">
        Try another card or pay by UPI.
      </Alert>
    </div>
  ),
};

/** Card row "brand + action". */
export const BrandWithAction: Story = {
  args: {
    tone: "brand",
    title: "New in Sector 57",
    children: "Doors open Friday, 8am.",
    action: <Button size="sm">See the Menu</Button>,
  },
};

/** Card row "dismissible". */
export const Dismissible: Story = {
  args: {
    tone: "info",
    title: undefined,
    children: "We now take UPI at every counter.",
    onDismiss: fn(),
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onDismiss).toHaveBeenCalledTimes(1);
  },
};

/** Handoff Plan calculator nudge — `tone="brand"`, own glyph, no title. */
export const Nudge: Story = {
  args: {
    tone: "brand",
    title: undefined,
    icon: TrendingDown,
    children: "Add 2 more people and every meal drops to ₹120.",
  },
};

/** Handoff Plan calculator PG hint — `tone="neutral"`. */
export const Neutral: Story = {
  args: {
    tone: "neutral",
    title: undefined,
    icon: Building2,
    children: "Ordering for a PG, hostel or office of 20+? Talk to us about group pricing.",
  },
};

/** Dev parity: 360px, the floor — title, message and dismiss wrap; the glyphs hold their size. */
export const Narrow: Story = {
  args: {
    tone: "danger",
    title: "That card didn't go through",
    children: "Try another card or pay by UPI at the counter.",
    onDismiss: fn(),
  },
  decorators: [
    (Story) => (
      <div className="max-w-90">
        <Story />
      </div>
    ),
  ],
};

/** Handoff Dawat calculator warning on the ink quote panel — a light island on every surface. */
export const OnSurfaces: Story = {
  args: { title: undefined, children: "Full setup and service starts at 50 guests." },
  render: (args) => (
    <OnSurfaces>
      <Alert {...args} />
    </OnSurfaces>
  ),
};
```

(`title: undefined` in a story's args is allowed: Storybook args are `Partial<AlertProps>`, whose `title` is `ReactNode`, which includes `undefined`.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Alert, type AlertProps } from "./molecules/alert/alert";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/alert packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/alert packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/alert.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Alert molecule with a client dismiss leaf

Six tones (the handoff adds neutral), title, action slot and an optional
dismiss button in its own client file. Danger interrupts as an alert; the
panel is a light island so its action keeps light skins on pink or ink.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

