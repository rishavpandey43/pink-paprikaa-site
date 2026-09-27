### Task 15: Tooltip (client — Radix Tooltip)

**Files:**

- Modify: `packages/design-tokens/tokens/primitive/z-index.json`, `packages/ui/src/styles.css`
- Create: `packages/ui/src/atoms/tooltip/tooltip.tsx`, `tooltip.test.tsx`, `tooltip.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/atoms/tooltip/tooltip.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                         | Ruling                         | Where / clause                                                                                                                                       |
| ---------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| a separate `TooltipProvider` (shared delay, skip-delay sweep)    | DROP                           | spec §9.1 / contract §3 "provider included"; with a 0ms open delay there is no delay to skip                                                         |
| closed until the trigger is reached                              | ALREADY                        | Step 2                                                                                                                                               |
| opens on keyboard focus                                          | ALREADY                        | Step 2                                                                                                                                               |
| closes when focus leaves                                         | ADD                            | Step 2 new test                                                                                                                                      |
| closes on Escape                                                 | ALREADY                        | Step 2                                                                                                                                               |
| describes its trigger (`aria-describedby`)                       | ALREADY                        | Step 2                                                                                                                                               |
| uses the caller's control and adds no button                     | ADD                            | Step 2 handlers test                                                                                                                                 |
| four sides (`data-side`)                                         | ALREADY                        | `side` story `play` (real placement in Chromium)                                                                                                     |
| `isDefaultOpen` / `isOpen` / `onOpenChange`                      | ADD — contract delta P2 raised | spec §8.1 names them `defaultOpen` / `open` / `onOpenChange`; contract §3 `TooltipProps` has none. Not in this plan until the controller rules on P2 |
| ink pill, not a bordered box                                     | ALREADY                        | Step 2                                                                                                                                               |
| caller `className` on the pill                                   | DROP                           | contract §3 `TooltipProps` takes no native props                                                                                                     |
| a long hint wraps at a cap instead of running off a 360px screen | ADD                            | Step 4 `max-w-56` (in place of `whitespace-nowrap`; ≤5-word hints still sit on one line); Step 2; Step 6 `LongHint`                                  |
| axe                                                              | ALREADY                        | Step 2 (while open)                                                                                                                                  |
| stories default / sides / on a button                            | ALREADY                        | Step 6                                                                                                                                               |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Tooltip` namespace from the `radix-ui` meta package (`Provider`, `Root`, `Trigger`, `Portal`, `Content` — verified in `packages/ui/node_modules/radix-ui/dist/index.d.ts` → `@radix-ui/react-tooltip` 1.2.16), `componentVariants`, `Icon` (stories).
- Produces: `Tooltip`, `TooltipProps` exactly as contract §3 (`label`, `side` = top, `children: ReactElement`; provider included). `children` must forward props and `ref` to a focusable element (Button, IconButton, a native button) — Radix's `Trigger asChild` merges its handlers and `aria-describedby` onto it. New token `--z-tooltip: 90` and utility `z-tooltip`.

- [ ] **Step 1: Component tokens**

No component token: the pill's `6px 10px` padding is `py-1.5 px-2.5`, its type `text-caption`. The new value is a stacking level — `packages/design-tokens/tokens/primitive/z-index.json` (full file after the change):

```json
{
  "z": {
    "$type": "number",
    "raised": { "$value": 5 },
    "sticky": { "$value": 10 },
    "header": { "$value": 50 },
    "dock": { "$value": 60 },
    "overlay": { "$value": 70 },
    "toast": { "$value": 80 },
    "tooltip": {
      "$value": 90,
      "$description": "Above dialogs and toasts: a hint never hides behind what it explains."
    }
  }
}
```

In `packages/ui/src/styles.css`, after `@utility z-toast { … }`, add:

```css
@utility z-tooltip {
  z-index: var(--z-tooltip);
}
```

No list names (z levels are `@utility` classes, not a Tailwind namespace). Contrast: no new pair — `text-text-on-inverse` on `bg-surface-inverse` is the existing `on-inverse` group (the content portals to `<body>`, a light-surface context, so the pair never shifts).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/atoms/tooltip/tooltip.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Tooltip } from "./tooltip";

/** Radix renders the label twice: visibly, and inside the content as a hidden role="tooltip". */
function contentOf(tooltip: HTMLElement): HTMLElement {
  const content = tooltip.parentElement;
  if (content === null) throw new Error("the tooltip has no content element");
  return content;
}

function renderDairy() {
  return render(
    <Tooltip label="Contains dairy">
      <button type="button">Dairy</button>
    </Tooltip>
  );
}

describe("Tooltip", () => {
  it("stays closed until its trigger is focused, then describes the trigger", async () => {
    const user = userEvent.setup();
    renderDairy();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    await user.tab();
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Contains dairy");
    expect(screen.getByRole("button", { name: "Dairy" })).toHaveAccessibleDescription(
      "Contains dairy"
    );
  });

  it("opens on hover", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.hover(screen.getByRole("button", { name: "Dairy" }));
    expect(await screen.findByRole("tooltip")).toHaveTextContent("Contains dairy");
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.tab();
    await screen.findByRole("tooltip");
    await user.keyboard("{Escape}");
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("closes when focus leaves the trigger", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Tooltip label="Contains dairy">
          <button type="button">Dairy</button>
        </Tooltip>
        <button type="button">Elsewhere</button>
      </>
    );
    await user.tab();
    await screen.findByRole("tooltip");
    await user.tab();
    expect(screen.getByRole("button", { name: "Elsewhere" })).toHaveFocus();
    await waitFor(() => {
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });
  });

  it("is an ink pill stacked above dialogs and toasts, capped so a long hint wraps", async () => {
    const user = userEvent.setup();
    renderDairy();
    await user.tab();
    expect(contentOf(await screen.findByRole("tooltip"))).toHaveClass(
      "z-tooltip",
      "max-w-56",
      "rounded-sm",
      "bg-surface-inverse",
      "text-text-on-inverse",
      "text-caption",
      "shadow-2"
    );
  });

  it.each(["top", "bottom", "left", "right"] as const)(
    "opens with side %s (placement itself is checked in the browser, story Sides)",
    async (side) => {
      const user = userEvent.setup();
      render(
        <Tooltip label="Share" side={side}>
          <button type="button">Share</button>
        </Tooltip>
      );
      await user.tab();
      expect(await screen.findByRole("tooltip")).toHaveTextContent("Share");
    }
  );

  it("keeps the trigger's own name and handlers", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Tooltip label="Pickup only for now">
        <button type="button" onClick={onClick}>
          Delivery
        </button>
      </Tooltip>
    );
    await user.click(screen.getByRole("button", { name: "Delivery" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("has no accessibility violations while open", async () => {
    const user = userEvent.setup();
    const { container } = renderDairy();
    await user.tab();
    const tooltip = await screen.findByRole("tooltip");
    await expectNoA11yViolations(container);
    await expectNoA11yViolations(contentOf(tooltip));
  });
});
```

(jsdom lays nothing out, so Radix's collision handling may flip a side there; the `Sides` story's `play` asserts real placement in Chromium.)

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './tooltip'`.

- [ ] **Step 4: Implement**

`packages/ui/src/atoms/tooltip/tooltip.tsx`:

```tsx
"use client";

import type { ReactElement } from "react";

import { Tooltip as TooltipPrimitive } from "radix-ui";

import { componentVariants } from "../../lib/component-variants";

/** Tooltip.jsx shows the hint the moment the pointer arrives — no hover-intent delay. */
const OPEN_DELAY_MS = 0;
/** 8px from the trigger (Tooltip.jsx `calc(100% + 8px)`). Radix takes the offset in px. */
const SIDE_OFFSET_PX = 8;

/**
 * Ink pill, 12.5px, 6px radius, no arrow; fades in over 140ms (instantly with reduced motion).
 * Radix sizes the content to its max-content width, so a ≤5-word hint stays on one line as
 * Tooltip.jsx's `nowrap` does; `max-w-56` only makes a longer one wrap instead of leaving a phone.
 */
const tooltip = componentVariants({
  base: "z-tooltip max-w-56 rounded-sm bg-surface-inverse px-2.5 py-1.5 font-body text-caption text-text-on-inverse shadow-2 transition-opacity duration-fast ease-out starting:opacity-0",
});

export interface TooltipProps {
  /** Short hint, no full stop — never essential copy. */
  label: string;
  /** = "top" */
  side?: "top" | "bottom" | "left" | "right" | undefined;
  /** One focusable element that forwards props and ref (Button, IconButton, a native button). */
  children: ReactElement;
}

/** Names an icon-only control or explains a mark. Opens on hover and focus, closes on Escape. */
export function Tooltip({ label, side = "top", children }: TooltipProps) {
  return (
    <TooltipPrimitive.Provider delayDuration={OPEN_DELAY_MS}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content side={side} sideOffset={SIDE_OFFSET_PX} className={tooltip()}>
            {label}
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories (card parity with `Tooltip.card.html`; docs from `Tooltip.prompt.md`; `play` for the client component)**

`packages/ui/src/atoms/tooltip/tooltip.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ComponentProps } from "react";

import { Heart, Info, Milk, Share2 } from "lucide-react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Icon, type IconComponent } from "../icon/icon";
import { Tooltip } from "./tooltip";

interface TriggerProps extends ComponentProps<"button"> {
  icon: IconComponent;
  label: string;
}

/** Story-only stand-in for IconButton (an atom may not import another atom). Forwards every prop. */
function Trigger({ icon, label, ...props }: TriggerProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className="inline-flex size-11 items-center justify-center rounded-pill border border-border-default bg-surface-card text-text-heading hover:bg-pink-50"
      {...props}
    >
      <Icon icon={icon} size="md" />
    </button>
  );
}

const meta = {
  title: "Atoms/Tooltip",
  component: Tooltip,
  args: { label: "Contains dairy", side: "top", children: <Trigger icon={Milk} label="Dairy" /> },
  parameters: {
    docs: {
      description: {
        component:
          "Names an icon-only control or explains a mark; never holds essential copy. Ink pill, 12.5px, no arrow, 140ms fade; max ~5 words, no full stop. Opens on hover and on keyboard focus, closes on Escape, and becomes the trigger's accessible description. The child must forward props and ref to a focusable element — Button, IconButton or a native button. Client component (Radix Tooltip, provider included).",
      },
    },
  },
} satisfies Meta<typeof Tooltip>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole("button", { name: "Dairy" });

    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await expect(await page.findByRole("tooltip")).toHaveTextContent("Contains dairy");
    await expect(trigger).toHaveAccessibleDescription("Contains dairy");

    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(page.queryByRole("tooltip")).not.toBeInTheDocument());

    await userEvent.hover(trigger);
    await expect(await page.findByRole("tooltip")).toHaveTextContent("Contains dairy");
  },
};

const SIDES = [
  { side: "top", label: "Contains dairy", name: "Dairy", icon: Milk },
  { side: "bottom", label: "Save for later", name: "Save", icon: Heart },
  { side: "left", label: "Share", name: "Share", icon: Share2 },
  { side: "right", label: "Ground this morning", name: "Info", icon: Info },
] as const;

export const Sides: Story = {
  name: "side",
  render: () => (
    <div className="flex items-center gap-8 p-16">
      {SIDES.map(({ side, label, name, icon }) => (
        <Tooltip key={side} label={label} side={side}>
          <Trigger icon={icon} label={name} />
        </Tooltip>
      ))}
    </div>
  ),
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    for (const { side, name } of SIDES) {
      await userEvent.tab();
      await expect(canvas.getByRole("button", { name })).toHaveFocus();
      const tooltip = await page.findByRole("tooltip");
      await expect(tooltip.parentElement).toHaveAttribute("data-side", side);
    }
  },
};

/** A hint past ~5 words wraps at a 224px cap instead of running off a 360px screen. */
export const LongHint: Story = {
  name: "long hint",
  args: {
    label: "Cooked to order, so it takes about twelve minutes",
    children: <Trigger icon={Info} label="Prep time" />,
  },
  play: async ({ canvas, canvasElement }) => {
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.hover(canvas.getByRole("button", { name: "Prep time" }));
    const tooltip = await page.findByRole("tooltip");
    await expect(tooltip.parentElement?.getBoundingClientRect().width).toBeLessThanOrEqual(224);
  },
};

export const OnAButton: Story = {
  name: "on a button",
  args: {
    label: "Pickup only for now",
    children: (
      <button
        type="button"
        className="inline-flex h-9 items-center rounded-pill border-2 border-border-brand px-4 font-display text-body-sm font-bold text-text-brand"
      >
        Delivery
      </button>
    ),
  },
};
```

- [ ] **Step 7: Export**

```ts
export { Tooltip, type TooltipProps } from "./atoms/tooltip/tooltip";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/atoms/tooltip packages/ui/src/styles.css packages/design-tokens/tokens/primitive/z-index.json
```

Run the gate, then `pnpm nx test @pink-paprikaa-web/storybook --skip-nx-cache 2>&1 | tail -10`. Expected: green; `Atoms/Tooltip › Playground`, `› side` and `› long hint` pass in Chromium.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): add the Tooltip atom on Radix Tooltip

The design system's ink pill on four sides, opening on hover and keyboard
focus, closing on Escape, and describing its trigger. It stacks on a new
z-tooltip level above dialogs and toasts and fades in with @starting-style,
so no animation library is involved.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

