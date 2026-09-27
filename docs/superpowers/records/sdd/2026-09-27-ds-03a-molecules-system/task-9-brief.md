### Task 9: Snackbar (client, Radix Toast)

Design-system sources: `components/molecules/Snackbar.*`. Card rows: tones (ink, success, danger + Retry) · undo + dismiss · live copy.

A Snackbar owns its own Radix provider and viewport, mounted **only while open** (the design system's `if (!open) return null`): an idle Snackbar leaves no empty landmark behind, and the viewport has no hotkey, so it never competes with the app's `ToastProvider` for F8. Radix Toast still supplies the timer, swipe-to-dismiss, Escape, pause-on-hover and the announcement.

**Files:**

- Create: `packages/design-tokens/tokens/component/snackbar.json`
- Create: `packages/ui/src/molecules/snackbar/snackbar.tsx`, `snackbar.test.tsx`, `snackbar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/snackbar/snackbar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                             | Ruling  | Where / why                                                                                 |
| -------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| confirmation announced politely, failure assertively                 | ADD     | Radix `type` by tone + announcer `it.each` (as Toast)                                       |
| action 44px hit target + press feedback; dismiss hit ≥ 36px          | ADD     | `action` `-my-3 min-h-hit … active:press-scale`; `dismiss` `before:-inset-2` (40px) + test  |
| caller `className` merges                                            | ADD     | test "merges a caller className over the bar" (on the bar, not the anchor)                  |
| stories: brand tone, `top-center` / `bottom-right` anchors, `Narrow` | ADD     | `Brand`, `TopCenter`, `BottomRight`, `Narrow` stories                                       |
| dismiss only when `onClose` is given                                 | DROP    | deviation 6: the design system defines Snackbar as a bar "with a text action and a dismiss" |
| `duration={0}` keeps the bar up                                      | ALREADY | `duration={Infinity}` (Radix) — test "stays until dismissed…"                               |
| `isOpen` / `onClose` / `onAction`                                    | ALREADY | `open` / `onOpenChange` (spec §8.2), `action: { label, altText, onClick }` (contracts §5)   |
| renders nothing closed; four tone fills; brand white; five positions | ALREADY | tests "leaves nothing behind…", tone and position `it.each`                                 |
| auto-hide after 3.2s; dismiss/action close and report                | ALREADY | tests "hides itself after 3.2 seconds…", "closes from its dismiss…", "runs its action…"     |
| `Default`, `Tones` (danger + Retry), `UndoAndDismiss` stories        | ALREADY | `Playground`, `Success`, `DangerWithRetry`, `UndoAndDismiss`, `LiveCopy`, `TopRight`        |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `NotificationProps`, `NOTIFICATION_ICON`, `NOTIFICATION_SURFACE` (Task 8); `Icon`; `Button` (stories).
- Produces: `Snackbar`, `SnackbarProps` — contract §5 + `isContained`, `className` (deviations 4, 4a, 6, 12). Default `duration` 3200ms, `position` `"bottom-center"`, `isContained` `true`.

- [ ] **Step 1: Component tokens and contrast pairs**

`packages/design-tokens/tokens/component/snackbar.json`:

```json
{
  "color": {
    "$type": "color",
    "snackbar-success-bg": {
      "$value": "{color.mint-strong}",
      "$description": "Success snackbar fill — white on the design system's mint fails AA (3.16:1)."
    }
  },
  "spacing": {
    "$type": "dimension",
    "snackbar": { "$value": "420px", "$description": "Snackbar bar maximum width." }
  },
  "text": {
    "$type": "typography",
    "snackbar": {
      "$value": { "fontSize": "14.5px", "lineHeight": 1.4 },
      "$description": "Snackbar message (DM Sans 500)."
    },
    "snackbar-action": {
      "$value": { "fontSize": "12.5px", "lineHeight": 1.4, "letterSpacing": "0.06em" },
      "$description": "Snackbar text action (Poppins 700, uppercase)."
    }
  }
}
```

Append `"snackbar"` to `SPACING`, and `"snackbar"`, `"snackbar-action"` to `TEXT`. Append to `contrast-pairs.json` → `groups` (the ink action is `text-text-brand`, pink-300 on ink, already in Plan 1's `ink-surface` group):

```json
{
  "id": "snackbar",
  "surface": "ink",
  "pairs": [
    ["color-text-body", "color-snackbar-success-bg"],
    ["color-text-body", "color-status-danger"]
  ],
  "min": 4.5
}
```

Rebuild and run the token tests. Expected: PASS.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/snackbar/snackbar.test.tsx`:

```tsx
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Snackbar } from "./snackbar";

const UNDO = { label: "Undo", altText: "Undo removing Chilli Paneer" } as const;

function messages(): HTMLElement {
  return screen.getByRole("region", { name: "Messages" });
}

describe("Snackbar", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows its message with a dismiss button", () => {
    render(<Snackbar>Table held for 10 minutes.</Snackbar>);
    expect(within(messages()).getByText("Table held for 10 minutes.")).toBeInTheDocument();
    expect(within(messages()).getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("leaves nothing behind while closed", () => {
    render(
      <Snackbar open={false} onOpenChange={vi.fn()}>
        Code copied.
      </Snackbar>
    );
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("anchors inside the nearest positioned box by default, or to the window", () => {
    const { rerender } = render(<Snackbar>Code copied.</Snackbar>);
    expect(within(messages()).getByRole("list")).toHaveClass(
      "absolute",
      "bottom-6",
      "justify-center"
    );
    rerender(<Snackbar isContained={false}>Code copied.</Snackbar>);
    const list = within(messages()).getByRole("list");
    expect(list).toHaveClass("fixed", "bottom-dock-clearance");
    expect(list).not.toHaveClass("absolute");
  });

  it.each([
    ["bottom-left", ["bottom-6", "justify-start"]],
    ["bottom-right", ["bottom-6", "justify-end"]],
    ["top-center", ["top-6", "justify-center"]],
    ["top-right", ["top-6", "justify-end"]],
  ] as const)("sits at %s", (position, classes) => {
    render(<Snackbar position={position}>Code copied.</Snackbar>);
    expect(within(messages()).getByRole("list")).toHaveClass(...classes);
  });

  it.each([
    ["ink", "ink", "bg-surface-inverse", "text-text-brand"],
    ["brand", "brand", "bg-surface-brand", "text-text-body"],
    ["success", "ink", "bg-snackbar-success-bg", "text-text-body"],
    ["danger", "ink", "bg-status-danger", "text-text-body"],
  ] as const)("paints the %s tone and its action", (tone, surface, fill, actionColour) => {
    render(
      <Snackbar tone={tone} action={{ ...UNDO, onClick: vi.fn() }}>
        Chilli Paneer removed.
      </Snackbar>
    );
    const bar = within(messages()).getByRole("listitem");
    expect(bar).toHaveAttribute("data-surface", surface);
    expect(bar).toHaveClass(fill);
    expect(within(bar).getByRole("button", { name: "Undo" })).toHaveClass(actionColour);
  });

  it.each([
    ["ink", "polite"],
    ["success", "polite"],
    ["danger", "assertive"],
  ] as const)(
    "announces a %s bar %sly — a failure interrupts, a confirmation waits",
    (tone, politeness) => {
      render(<Snackbar tone={tone}>Code copied.</Snackbar>);
      expect(
        document.body.querySelector(`[role="status"][aria-live="${politeness}"]`)
      ).toBeInTheDocument();
    }
  );

  it("gives the action a 44px hit height and the dismiss a 40px one, without growing the bar", () => {
    render(<Snackbar action={{ ...UNDO, onClick: vi.fn() }}>Chilli Paneer removed.</Snackbar>);
    expect(screen.getByRole("button", { name: "Undo" })).toHaveClass("min-h-hit", "-my-3");
    expect(screen.getByRole("button", { name: "Dismiss" })).toHaveClass(
      "size-6",
      "before:-inset-2"
    );
  });

  it("merges a caller className over the bar", () => {
    render(<Snackbar className="rounded-lg">Code copied.</Snackbar>);
    const bar = within(messages()).getByRole("listitem");
    expect(bar).toHaveClass("rounded-lg");
    expect(bar).not.toHaveClass("rounded-md");
  });

  it("runs its action, then closes and reports it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Snackbar action={{ ...UNDO, onClick }} onOpenChange={onOpenChange}>
        Chilli Paneer removed.
      </Snackbar>
    );
    await user.click(screen.getByRole("button", { name: "Undo" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByText("Chilli Paneer removed.")).not.toBeInTheDocument();
  });

  it("closes from its dismiss button and reports it", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<Snackbar onOpenChange={onOpenChange}>Code copied.</Snackbar>);
    await user.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });

  it("hides itself after 3.2 seconds by default", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(<Snackbar onOpenChange={onOpenChange}>Code copied.</Snackbar>);
    act(() => {
      vi.advanceTimersByTime(3199);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("stays until dismissed with an infinite duration", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <Snackbar duration={Infinity} onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("follows open when controlled", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <Snackbar open={false} onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    expect(screen.queryByText("Code copied.")).not.toBeInTheDocument();
    rerender(
      <Snackbar open onOpenChange={onOpenChange}>
        Code copied.
      </Snackbar>
    );
    expect(within(messages()).getByText("Code copied.")).toBeInTheDocument();
  });

  it("has no accessibility violations with an action and a dismiss", async () => {
    const { container } = render(
      <div className="relative">
        <Snackbar action={{ ...UNDO, onClick: vi.fn() }}>Chilli Paneer removed.</Snackbar>
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/snackbar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./snackbar`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/snackbar/snackbar.tsx`:

```tsx
"use client";

import { X } from "lucide-react";
import { Toast as RadixToast } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_SURFACE,
  type NotificationProps,
} from "../../lib/notification";
import { useControllableState } from "../../lib/use-controllable-state";

/** The design system's auto-hide delay. */
const SNACKBAR_DURATION = 3200;

/** No F8 hotkey: the app's ToastProvider owns it. */
const NO_HOTKEY: string[] = [];

const snackbar = componentVariants({
  slots: {
    anchor: "pointer-events-none inset-x-6 z-toast m-0 flex list-none p-0",
    root: "max-w-snackbar pointer-events-auto flex w-full min-w-0 animate-sheet-in items-center gap-3 rounded-md py-3.25 pr-3.5 pl-4 text-text-body shadow-3",
    message: "text-snackbar min-w-0 flex-1 font-body font-medium text-pretty",
    // Hit areas (dev parity): the action is 44px tall (`min-h-hit`, margin pulled into the 13px
    // padding by `-my-3`); the 24px dismiss takes taps over 40px through `before:-inset-2`.
    action:
      "text-snackbar-action -my-3 inline-flex min-h-hit shrink-0 items-center rounded-xs px-1.5 font-display font-bold uppercase active:press-scale",
    dismiss:
      "relative grid size-6 shrink-0 place-items-center rounded-pill text-current opacity-70 transition-opacity duration-fast ease-out before:absolute before:-inset-2 hover:opacity-100",
  },
  variants: {
    isContained: {
      /** Inside the nearest positioned ancestor (AppShell, or a `relative` wrapper). */
      true: { anchor: "absolute" },
      /** The window edge. */
      false: { anchor: "fixed" },
    },
    position: {
      "bottom-center": { anchor: "bottom-6 justify-center" },
      "bottom-left": { anchor: "bottom-6 justify-start" },
      "bottom-right": { anchor: "bottom-6 justify-end" },
      "top-center": { anchor: "top-6 justify-center" },
      "top-right": { anchor: "top-6 justify-end" },
    },
    tone: {
      ink: { root: "bg-surface-inverse", action: "text-text-brand" },
      brand: { root: "bg-surface-brand", action: "text-text-body" },
      success: { root: "bg-snackbar-success-bg", action: "text-text-body" },
      danger: { root: "bg-status-danger", action: "text-text-body" },
    },
  },
  compoundVariants: [
    {
      isContained: false,
      position: ["bottom-center", "bottom-left", "bottom-right"],
      class: { anchor: "bottom-dock-clearance md:bottom-6" },
    },
  ],
  defaultVariants: { isContained: true, position: "bottom-center", tone: "ink" },
});

type SnackbarPosition =
  "bottom-center" | "bottom-left" | "bottom-right" | "top-center" | "top-right";

/** Swipe towards the edge the bar is anchored to. */
const SWIPE_DIRECTION: Readonly<Record<SnackbarPosition, "up" | "down">> = {
  "bottom-center": "down",
  "bottom-left": "down",
  "bottom-right": "down",
  "top-center": "up",
  "top-right": "up",
};

/** Toast's props minus `isPop` (contract §5), plus where the bar sits. */
export interface SnackbarProps extends NotificationProps {
  position?: SnackbarPosition | undefined;
  /** Anchor to the nearest positioned ancestor (default); `false` pins the bar to the window edge. */
  isContained?: boolean | undefined;
}

/**
 * Anchored confirmation bar for a completed action that may need an escape hatch — copying a code,
 * undoing a removal, retrying a failure. A squared bar with an optional text action and a dismiss;
 * auto-hides after 3.2s. Never show a Snackbar and a Toast at once.
 */
export function Snackbar({
  open,
  defaultOpen,
  onOpenChange,
  tone = "ink",
  icon,
  action,
  duration = SNACKBAR_DURATION,
  position = "bottom-center",
  isContained = true,
  className,
  children,
}: SnackbarProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? true,
    onChange: onOpenChange,
  });
  const styles = snackbar({ tone, position, isContained });

  if (!isOpen) return null;

  return (
    <RadixToast.Provider duration={duration} swipeDirection={SWIPE_DIRECTION[position]}>
      <RadixToast.Root
        open={isOpen}
        onOpenChange={setIsOpen}
        // Severity picks the politeness (dev parity): a failure interrupts, a confirmation waits.
        type={tone === "danger" ? "foreground" : "background"}
        data-surface={NOTIFICATION_SURFACE[tone]}
        className={styles.root({ className })}
      >
        <Icon icon={icon ?? NOTIFICATION_ICON[tone]} size="md" />
        <RadixToast.Description className={styles.message()}>{children}</RadixToast.Description>
        {action === undefined ? null : (
          <RadixToast.Action
            altText={action.altText}
            onClick={action.onClick}
            className={styles.action()}
          >
            {action.label}
          </RadixToast.Action>
        )}
        <RadixToast.Close aria-label="Dismiss" className={styles.dismiss()}>
          <Icon icon={X} size="sm" />
        </RadixToast.Close>
      </RadixToast.Root>
      <RadixToast.Viewport label="Messages" hotkey={NO_HOTKEY} className={styles.anchor()} />
    </RadixToast.Provider>
  );
}
```

(The early `return null` comes after every hook call, so the rules of hooks hold.)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/snackbar 2>&1 | tail -8`
Expected: PASS (21 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/snackbar/snackbar.stories.tsx` (one open Snackbar per story: two open at once would be two `Messages` landmarks, which the design system never shows):

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Snackbar } from "./snackbar";

const meta = {
  title: "Molecules/Snackbar",
  component: Snackbar,
  args: { duration: Infinity, children: "Table held for 10 minutes.", onOpenChange: fn() },
  render: (args) => (
    <div className="relative h-28 rounded-lg border border-border-subtle bg-surface-page-alt">
      <Snackbar {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Anchored confirmation bar for a completed action that may need an escape hatch — copying a code, undoing a removal, retrying a failure. **Snackbar vs Toast:** Snackbar is a squared bar with a text action and a dismiss, for things the guest may want to reverse or act on; Toast is a pill with no dismiss, for pure confirmations like add-to-cart. Never show both at once. By default it anchors to the nearest positioned ancestor — inside AppShell that is the phone frame; on a web page give the wrapper `position: relative`, or pass `isContained={false}` to pin it to the window. Auto-hides after 3.2s (`duration={Infinity}` keeps it).",
      },
    },
  },
} satisfies Meta<typeof Snackbar>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "tones" — ink. */
export const Playground: Story = {};

/** Card row "tones" — success. */
export const Success: Story = {
  args: { tone: "success", children: "Code copied. Paste it at checkout." },
};

/** Card row "tones" — danger with Retry. */
export const DangerWithRetry: Story = {
  args: {
    tone: "danger",
    children: "That card didn't go through.",
    action: { label: "Retry", altText: "Retry the payment", onClick: fn() },
  },
};

/** Card row "undo + dismiss". */
export const UndoAndDismiss: Story = {
  args: {
    children: "Chilli Paneer removed.",
    action: { label: "Undo", altText: "Undo removing Chilli Paneer", onClick: fn() },
  },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Dismiss" }));
    await expect(args.onOpenChange).toHaveBeenCalledWith(false);
    await expect(canvas.queryByText("Chilli Paneer removed.")).not.toBeInTheDocument();
  },
};

function LiveCopyDemo() {
  const [isCopied, setIsCopied] = useState(false);
  return (
    <div className="relative grid h-40 place-items-start rounded-lg border border-border-subtle p-4">
      <Button
        variant="secondary"
        onClick={() => {
          setIsCopied(true);
        }}
      >
        Copy PAPRIKAA50
      </Button>
      <Snackbar tone="success" position="bottom-left" open={isCopied} onOpenChange={setIsCopied}>
        Code copied. Paste it at checkout.
      </Snackbar>
    </div>
  );
}

/** Card row "live copy" — the code-copied flow (a Button stands in for the coupon stub). */
export const LiveCopy: Story = {
  render: () => <LiveCopyDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy PAPRIKAA50" }));
    await expect(await canvas.findByText("Code copied. Paste it at checkout.")).toBeInTheDocument();
  },
};

/** `position="top-right"`. */
export const TopRight: Story = { args: { position: "top-right", children: "Order updated." } };

/** Dev parity: the other anchors, one open bar per story. */
export const TopCenter: Story = { args: { position: "top-center", children: "Order updated." } };

export const BottomRight: Story = {
  args: { position: "bottom-right", children: "Order updated." },
};

/** Dev parity: the brand tone. */
export const Brand: Story = { args: { tone: "brand", children: "Added to your order." } };

/** Dev parity: 360px is the floor — the bar caps at 420px and shrinks with the 24px gutter. */
export const Narrow: Story = {
  args: {
    children: "Chilli Paneer removed from your order.",
    action: { label: "Undo", altText: "Undo removing Chilli Paneer", onClick: fn() },
  },
  render: (args) => (
    <div className="relative h-28 max-w-90 rounded-lg border border-border-subtle bg-surface-page-alt">
      <Snackbar {...args} />
    </div>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { Snackbar, type SnackbarProps } from "./molecules/snackbar/snackbar";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/snackbar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/snackbar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/snackbar.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Snackbar molecule on Radix Toast

Squared bar with a text action and a dismiss, auto-hiding after 3.2s,
anchored to its positioned ancestor (or the window) at five positions.
Its provider mounts only while open, so an idle snackbar leaves no empty
landmark and never takes the app's F8 hotkey.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

