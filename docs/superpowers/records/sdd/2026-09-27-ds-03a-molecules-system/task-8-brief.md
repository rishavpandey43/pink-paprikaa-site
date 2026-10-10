### Task 8: Toast + ToastProvider (client, Radix Toast)

Design-system sources: `components/molecules/Toast.*`; UI kits `ui_kits/website/index.html` (page toast) and `ui_kits/app/index.html` (toast inside the phone frame). Card rows: tone (brand + action, ink) · status (success, danger) · pop.

**Files:**

- Create: `packages/design-tokens/tokens/component/toast.json`
- Create: `packages/ui/src/lib/notification.ts` (shared with Snackbar, Task 9)
- Create: `packages/ui/src/molecules/toast/toast.tsx`, `toast.test.tsx`, `toast.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/design-tokens/contrast-pairs.json`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/toast/toast.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                           | Ruling  | Where / why                                                                                                           |
| ------------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------------------------- |
| confirmation announced politely, failure assertively               | ADD     | Radix `type={tone === "danger" ? "foreground" : "background"}` + announcer `it.each` (Radix default: all assertive)   |
| action has a 44px hit target and press feedback                    | ADD     | `action` slot `-my-3 inline-flex min-h-hit … active:press-scale` + assertion                                          |
| caller `className` merges                                          | ADD     | test "merges a caller className…"                                                                                     |
| danger toast with an action (`Retry`); `CustomGlyph` story         | ADD     | `Status` story action, `CustomGlyph` story                                                                            |
| every toast rises in (`animate-pp-rise`), pop only swaps the curve | DROP    | spec D2: the design system's `Toast.jsx` animates only `pop` (`pp-toast-pop`); §8.1 reserves the entrance for `isPop` |
| `action` string + `onAction`                                       | ALREADY | contracts §5 `action: { label, altText, onClick }` (Radix `altText` for screen readers)                               |
| four tone fills; brand white on pink; one glyph, overridable; pill | ALREADY | tone `it.each`, "takes a glyph of its own"                                                                            |
| no action without a handler                                        | ALREADY | the action object carries its handler by type                                                                         |
| `InContext` story (bottom-centre above the tab bar, 360px)         | ALREADY | `Contained` story (`isContained`, deviation 4a) + the page-edge viewport test                                         |
| `Default`, `Tones`, `WithAction`, `Pop` stories                    | ALREADY | `Playground`, `Tones`, `Status`, `Pop`, `AddToOrder`                                                                  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `useControllableState` (Task 1); `Icon`; `radix-ui` → `Toast` (`Provider`, `Viewport`, `Root`, `Description`, `Action` — verified in `@radix-ui/react-toast` 1.2.23: the root is an `<li>` portalled into the viewport `<ol>`, the viewport sits in a `role="region"` labelled `Notifications (F8)`, a toast renders nothing until the viewport has mounted).
- Produces: `ToastProvider`, `ToastProviderProps`, `Toast`, `ToastProps` — contract §5 + `className`, `isContained` (deviations 4, 4a, 5, 12); internal `lib/notification.ts` (`NotificationTone`, `NotificationProps`, `NOTIFICATION_ICON`, `NOTIFICATION_SURFACE`).

- [ ] **Step 1: Component tokens and contrast pairs**

`packages/design-tokens/tokens/component/toast.json`:

```json
{
  "color": {
    "$type": "color",
    "toast-success-bg": {
      "$value": "{color.mint-strong}",
      "$description": "Success toast fill. White on the design system's mint measures 3.16:1; on the strong mint it measures 6.36:1."
    }
  },
  "text": {
    "$type": "typography",
    "toast": {
      "$value": { "fontSize": "14.5px", "lineHeight": 1.6 },
      "$description": "Toast message (DM Sans 500)."
    },
    "toast-action": {
      "$value": { "fontSize": "13px", "lineHeight": 1.4, "letterSpacing": "0.04em" },
      "$description": "Toast action label (Poppins 700, uppercase)."
    }
  }
}
```

Append `"toast"` and `"toast-action"` to `TEXT`. Toasts set `data-surface` (brand → `brand`, the rest → `ink`), so their text is `text-text-body` = white. Brand and ink are covered by Plan 1's surface groups; append to `contrast-pairs.json` → `groups`:

```json
{
  "id": "toast",
  "surface": "ink",
  "pairs": [
    ["color-text-body", "color-toast-success-bg"],
    ["color-text-body", "color-status-danger"]
  ],
  "min": 4.5
}
```

Rebuild and run the token tests. Expected: PASS (≈ 6.36 and 5.38).

- [ ] **Step 2: The shared notification vocabulary**

`packages/ui/src/lib/notification.ts`:

```ts
import type { ReactNode } from "react";

import { Check, Info, TriangleAlert } from "lucide-react";

import type { IconComponent } from "../atoms/icon/icon";

export type NotificationTone = "brand" | "ink" | "success" | "danger";

export interface NotificationAction {
  label: string;
  /** How a screen-reader user can do the same thing, e.g. "View your cart" (Radix `altText`). */
  altText: string;
  onClick: () => void;
}

/** What Toast and Snackbar share (contract §5: `SnackbarProps extends Omit<ToastProps, "isPop">`). */
export interface NotificationProps {
  open?: boolean | undefined;
  /** Shown on mount unless `false` (Radix default). */
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
  tone?: NotificationTone | undefined;
  /** Replaces the tone's glyph. */
  icon?: IconComponent | undefined;
  action?: NotificationAction | undefined;
  /** Time on screen, ms. `Infinity` keeps it until dismissed. */
  duration?: number | undefined;
  className?: string | undefined;
  /** One short sentence, no exclamation mark. */
  children: ReactNode;
}

export const NOTIFICATION_ICON: Readonly<Record<NotificationTone, IconComponent>> = {
  brand: Check,
  ink: Info,
  success: Check,
  danger: TriangleAlert,
};

/** A brand notification is a brand field; the rest are dark fields. On both, text and focus turn white. */
export const NOTIFICATION_SURFACE: Readonly<Record<NotificationTone, "brand" | "ink">> = {
  brand: "brand",
  ink: "ink",
  success: "ink",
  danger: "ink",
};
```

- [ ] **Step 3: Write the failing test**

`packages/ui/src/molecules/toast/toast.test.tsx`:

```tsx
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Heart } from "lucide-react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Toast, ToastProvider } from "./toast";

const VIEW_CART = { label: "View Cart", altText: "View your cart" } as const;

function notifications(): HTMLElement {
  return screen.getByRole("region", { name: "Notifications (F8)" });
}

describe("Toast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows its message in the notifications region", () => {
    render(
      <ToastProvider>
        <Toast>Added to your order.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByText("Added to your order.")).toBeInTheDocument();
  });

  it.each([
    ["brand", "brand", "bg-surface-brand", "lucide-check"],
    ["ink", "ink", "bg-surface-inverse", "lucide-info"],
    ["success", "ink", "bg-toast-success-bg", "lucide-check"],
    ["danger", "ink", "bg-status-danger", "lucide-triangle-alert"],
  ] as const)("paints the %s tone as a %s field with its glyph", (tone, surface, fill, glyph) => {
    render(
      <ToastProvider>
        <Toast tone={tone}>Order confirmed.</Toast>
      </ToastProvider>
    );
    const item = within(notifications()).getByRole("listitem");
    expect(item).toHaveAttribute("data-surface", surface);
    expect(item).toHaveClass(fill);
    expect(item.querySelector(`svg.${glyph}`)).toBeInTheDocument();
  });

  it("takes a glyph of its own", () => {
    render(
      <ToastProvider>
        <Toast icon={Heart}>Saved to favourites.</Toast>
      </ToastProvider>
    );
    expect(
      within(notifications()).getByRole("listitem").querySelector("svg.lucide-heart")
    ).toBeInTheDocument();
  });

  it.each([
    ["brand", "polite"],
    ["ink", "polite"],
    ["success", "polite"],
    ["danger", "assertive"],
  ] as const)(
    "announces a %s toast %sly — a failure interrupts, a confirmation waits",
    (tone, politeness) => {
      render(
        <ToastProvider>
          <Toast tone={tone}>Order update.</Toast>
        </ToastProvider>
      );
      // Radix portals its announcer into the body: `type` "background" → polite, "foreground" → assertive.
      expect(
        document.body.querySelector(`[role="status"][aria-live="${politeness}"]`)
      ).toBeInTheDocument();
    }
  );

  it("merges a caller className over the pill", () => {
    render(
      <ToastProvider>
        <Toast className="rounded-lg">Added to your order.</Toast>
      </ToastProvider>
    );
    const item = within(notifications()).getByRole("listitem");
    expect(item).toHaveClass("rounded-lg");
    expect(item).not.toHaveClass("rounded-pill");
  });

  it("runs its action, then closes and reports it", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider>
        <Toast tone="brand" onOpenChange={onOpenChange} action={{ ...VIEW_CART, onClick }}>
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    const viewCart = screen.getByRole("button", { name: "View Cart" });
    // A 44px hit height inside the pill (dev parity), its margin pulled back into the padding.
    expect(viewCart).toHaveClass("min-h-hit", "-my-3");
    await user.click(viewCart);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("plays the pop entrance only when asked", () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast>Table held.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("listitem")).not.toHaveClass("animate-toast-pop");
    rerender(
      <ToastProvider>
        <Toast isPop>Chilli Paneer added.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("listitem")).toHaveClass("animate-toast-pop");
  });

  it("follows open when controlled", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(
      <ToastProvider>
        <Toast open={false} onOpenChange={onOpenChange}>
          Table held.
        </Toast>
      </ToastProvider>
    );
    expect(within(notifications()).queryByRole("listitem")).not.toBeInTheDocument();
    rerender(
      <ToastProvider>
        <Toast open onOpenChange={onOpenChange}>
          Table held.
        </Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByText("Table held.")).toBeInTheDocument();
  });

  it("closes itself after its duration and reports it", () => {
    vi.useFakeTimers();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider duration={3000}>
        <Toast onOpenChange={onOpenChange}>Table held.</Toast>
      </ToastProvider>
    );
    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <ToastProvider>
        <Toast onOpenChange={onOpenChange}>Table held.</Toast>
      </ToastProvider>
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("puts its viewport at the page edge by default, or inside the nearest positioned box", () => {
    const { rerender } = render(
      <ToastProvider>
        <Toast>Added.</Toast>
      </ToastProvider>
    );
    expect(within(notifications()).getByRole("list")).toHaveClass("fixed", "bottom-dock-clearance");
    rerender(
      <ToastProvider isContained>
        <Toast>Added.</Toast>
      </ToastProvider>
    );
    const list = within(notifications()).getByRole("list");
    expect(list).toHaveClass("absolute", "bottom-4");
    expect(list).not.toHaveClass("fixed");
  });

  it("hydrates a server-rendered page with no mismatch, then shows the toast", async () => {
    const tree = (
      <ToastProvider>
        <Toast defaultOpen duration={Infinity}>
          Added to your order.
        </Toast>
      </ToastProvider>
    );
    const container = document.createElement("div");
    container.innerHTML = renderToString(tree);
    document.body.append(container);
    const onRecoverableError = vi.fn();
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);

    const root = await act(() => hydrateRoot(container, tree, { onRecoverableError }));

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(within(container).getByText("Added to your order.")).toBeInTheDocument();
    act(() => {
      root.unmount();
    });
    consoleError.mockRestore();
    container.remove();
  });

  it("has no accessibility violations with an action", async () => {
    const { container } = render(
      <ToastProvider>
        <Toast tone="brand" isPop action={{ ...VIEW_CART, onClick: vi.fn() }}>
          Chilli Paneer added.
        </Toast>
      </ToastProvider>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 4: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/toast 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./toast`.

- [ ] **Step 5: Implement**

`packages/ui/src/molecules/toast/toast.tsx`:

```tsx
"use client";

import type { ReactNode } from "react";

import { Toast as RadixToast } from "radix-ui";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";
import {
  NOTIFICATION_ICON,
  NOTIFICATION_SURFACE,
  type NotificationProps,
} from "../../lib/notification";
import { useControllableState } from "../../lib/use-controllable-state";

/** Radix Toast's own default time on screen. */
const TOAST_DURATION = 5000;

const toastViewport = componentVariants({
  base: "pointer-events-none z-toast m-0 flex list-none flex-col items-center gap-2 p-0",
  variants: {
    isContained: {
      /** The page edge, clear of the mobile action dock; 32px up from md. */
      false: "fixed inset-x-4 bottom-dock-clearance md:bottom-8",
      /** Inside the nearest positioned ancestor, e.g. AppShell's overlay slot. */
      true: "absolute inset-x-4 bottom-4",
    },
  },
  defaultVariants: { isContained: false },
});

const toast = componentVariants({
  slots: {
    root: "pointer-events-auto inline-flex max-w-full items-center gap-3 rounded-pill px-4 py-3 text-text-body shadow-3",
    message: "text-toast min-w-0 font-body font-medium text-pretty",
    // `min-h-hit` + `-my-3`: a 44px target that does not grow the pill (dev parity).
    action:
      "text-toast-action -my-3 inline-flex min-h-hit shrink-0 items-center rounded-xs px-0.5 font-display font-bold text-current uppercase active:press-scale",
  },
  variants: {
    tone: {
      brand: { root: "bg-surface-brand" },
      ink: { root: "bg-surface-inverse" },
      success: { root: "bg-toast-success-bg" },
      danger: { root: "bg-status-danger" },
    },
    isPop: { true: { root: "animate-toast-pop" } },
  },
  defaultVariants: { tone: "ink", isPop: false },
});

export interface ToastProviderProps {
  children: ReactNode;
  /** Default time on screen for every toast, ms. */
  duration?: number | undefined;
  /** Announced before each toast. */
  label?: string | undefined;
  /** Put the viewport inside the nearest positioned ancestor instead of at the page edge. */
  isContained?: boolean | undefined;
}

/**
 * Mount once: at the app root for page toasts (bottom-centre, above the mobile dock), or inside a
 * positioned frame such as AppShell's overlay slot with `isContained`. Every Toast rendered inside
 * it appears in its viewport.
 */
export function ToastProvider({
  children,
  duration = TOAST_DURATION,
  label = "Notification",
  isContained = false,
}: ToastProviderProps) {
  return (
    <RadixToast.Provider duration={duration} label={label} swipeDirection="down">
      {children}
      <RadixToast.Viewport className={toastViewport({ isContained })} />
    </RadixToast.Provider>
  );
}

export interface ToastProps extends NotificationProps {
  /** The single-overshoot entrance — add-to-cart and reward confirmations only. */
  isPop?: boolean | undefined;
}

/** Transient pill confirmation, no dismiss. Use Snackbar when the guest may want to undo. */
export function Toast({
  open,
  defaultOpen,
  onOpenChange,
  tone = "ink",
  icon,
  action,
  isPop = false,
  duration,
  className,
  children,
}: ToastProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? true,
    onChange: onOpenChange,
  });
  const styles = toast({ tone, isPop });

  return (
    <RadixToast.Root
      open={isOpen}
      onOpenChange={setIsOpen}
      // Severity picks the politeness (dev parity): a failure interrupts, a confirmation waits.
      type={tone === "danger" ? "foreground" : "background"}
      {...(duration === undefined ? {} : { duration })}
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
    </RadixToast.Root>
  );
}
```

- [ ] **Step 6: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/toast 2>&1 | tail -8`
Expected: PASS (15 tests, the hydration test included). If the hydration test logs a mismatch, the cause is render-time state that differs between server and client — never silence `console.error`; find the value (e.g. a `typeof window` branch) and move it into an effect.

- [ ] **Step 7: Stories**

`packages/ui/src/molecules/toast/toast.stories.tsx` (no shared decorator: each story mounts its own provider, so the "contained" story never has two regions with the same name):

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Gift } from "lucide-react";
import { useState } from "react";
import { expect, fn } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Toast, ToastProvider } from "./toast";

const VIEW_CART = { label: "View Cart", altText: "View your cart", onClick: fn() };

const meta = {
  title: "Molecules/Toast",
  component: Toast,
  args: { tone: "brand", duration: Infinity, action: VIEW_CART, children: "Added to your order." },
  render: (args) => (
    <ToastProvider>
      <Toast {...args} />
    </ToastProvider>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Transient pill confirmation, bottom-centre above the tab bar or dock. Mount one `ToastProvider` (at the app root, or `isContained` inside a positioned frame such as AppShell's overlay slot); every Toast inside it appears in its viewport. `isPop` is the only sanctioned overshoot in the system — reserve it for add-to-cart and reward confirmations. Copy is one short sentence, no exclamation mark. The optional action is an uppercase text button (`{ label, altText, onClick }`); there is no dismiss — use Snackbar for things the guest may want to reverse. Never show both at once.",
      },
      story: { inline: false, iframeHeight: "240px" },
    },
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "tone" — brand with its action, ink. */
export const Tones: Story = {
  render: () => (
    <ToastProvider>
      <Toast tone="brand" duration={Infinity} action={VIEW_CART}>
        Added to your order.
      </Toast>
      <Toast tone="ink" duration={Infinity}>
        Table held for 10 minutes.
      </Toast>
    </ToastProvider>
  ),
};

/** Card row "status" — success, danger. */
export const Status: Story = {
  render: () => (
    <ToastProvider>
      <Toast tone="success" duration={Infinity}>
        Order confirmed.
      </Toast>
      <Toast
        tone="danger"
        duration={Infinity}
        action={{ label: "Retry", altText: "Try the payment again", onClick: fn() }}
      >
        That card didn&apos;t go through.
      </Toast>
    </ToastProvider>
  ),
};

/** Card row "pop" — add-to-cart only. */
export const Pop: Story = { args: { isPop: true, children: "Chilli Paneer added." } };

/** Dev parity: `icon` overrides the tone's glyph. */
export const CustomGlyph: Story = {
  args: { icon: Gift, action: undefined, children: "You earned a free masala chai." },
};

function AddToOrderDemo() {
  const [added, setAdded] = useState(0);
  return (
    <ToastProvider>
      <Button
        onClick={() => {
          setAdded((count) => count + 1);
        }}
      >
        Add Chilli Paneer
      </Button>
      {added === 0 ? null : (
        <Toast key={added} tone="brand" isPop duration={4000} action={VIEW_CART}>
          Chilli Paneer added.
        </Toast>
      )}
    </ToastProvider>
  );
}

/** The real flow: each add pops a fresh toast. */
export const AddToOrder: Story = {
  render: () => <AddToOrderDemo />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add Chilli Paneer" }));
    await expect(await canvas.findByText("Chilli Paneer added.")).toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "View Cart" }));
    await expect(VIEW_CART.onClick).toHaveBeenCalled();
  },
};

/** `isContained` — the App kit's toast inside the phone frame (a positioned box here). */
export const Contained: Story = {
  render: (args) => (
    <div className="relative h-60 overflow-hidden rounded-xl border border-border-subtle bg-surface-page-alt">
      <ToastProvider isContained>
        <Toast {...args} />
      </ToastProvider>
    </div>
  ),
};
```

- [ ] **Step 8: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  Toast,
  type ToastProps,
  ToastProvider,
  type ToastProviderProps,
} from "./molecules/toast/toast";
```

- [ ] **Step 9: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/toast packages/ui/src/lib packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/toast packages/ui/src/lib packages/ui/src/index.ts packages/design-tokens/tokens/component/toast.json packages/design-tokens/contrast-pairs.json
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 10: Commit**

```bash
git add -A packages/ui packages/design-tokens
git commit -m "feat(ui): Toast and ToastProvider on Radix Toast

Pill confirmations in four tones with an optional text action and the
ease-pop entrance for add-to-cart. The provider's viewport is fixed to
the page edge or contained in a positioned frame (the App kit's phone).
Success fills with the strong mint: white on mint fails the policy.
A server-rendered page hydrates the provider without a mismatch.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

