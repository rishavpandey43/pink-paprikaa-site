### Task 11: Dialog

**Dev reference:** `git show dev:packages/ui/src/organisms/dialog/dialog.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                     | Ruling  | Where / clause                                                                                      |
| ------------------------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| Closed until the trigger is used                             | ALREADY | test "opens from its trigger…"                                                                      |
| Named by its title; described by its description             | ALREADY | same test                                                                                           |
| Escape closes and reports `onOpenChange(false)`              | ALREADY | tests "closes on Escape…", "reports open changes…"                                                  |
| The close glyph closes                                       | ALREADY | test "closes from its labelled close button"                                                        |
| `hasCloseButton={false}` — a decision that must be answered  | ADD     | contract delta 4 (R110): hides the close button only; test "hides only the close button…"           |
| Focus moves into the dialog when it opens                    | ADD     | test "moves focus into the dialog when it opens"                                                    |
| Footer actions render and work                               | ALREADY | test "renders the footer actions"                                                                   |
| Controlled open state holds                                  | ALREADY | test "reports open changes and stays open when controlled"                                          |
| Sheet: top corners only, plus a grab handle                  | ADD     | the sheet test also asserts no `rounded-xl`                                                         |
| Three widths                                                 | ALREADY | `it.each` sizes (token widths, D4)                                                                  |
| `position="container"` anchors inside a phone frame          | ALREADY | `portalContainer` + the frame's `contain-layout` (AppShell, Plan 2c); story `InsideAPhoneFrame` ADD |
| A scrim over everything behind it                            | ADD     | test "lays the ink scrim over the page behind it"                                                   |
| Merges a caller `className`                                  | ADD     | contract delta 5 (R110): onto the panel; test "merges a caller className onto the panel"            |
| axe                                                          | ALREADY | test "has no accessibility violations while open"                                                   |
| The body scrolls; header and footer never leave the screen   | ADD     | `body` slot `min-h-0 flex-1 overflow-y-auto`, `shrink-0` header/footer, test "scrolls its body…"    |
| Footer wraps at 360px                                        | ALREADY | `flex-wrap`                                                                                         |
| `aria-describedby={undefined}` opt-out                       | ALREADY | Radix 1.1.23 omits it without a Description, no warning (Interfaces)                                |
| `isOpen` / `isDefaultOpen` names                             | DROP    | spec §8.2 — `open` / `defaultOpen` / `onOpenChange`                                                 |
| Stories Default · Sheet · WithDescription · WithForm · Sizes | ALREADY | Playground · Sheet · Large · Playground (`BOOKING_FORM`) · CentredModal/Playground/Large            |
| Story MustBeAnswered                                         | ADD     | `MustBeAnswered` (contract delta 4) — controlled, own footer actions, `play`                        |
| Story InsideAPhoneFrame                                      | ADD     | `InsideAPhoneFrame`                                                                                 |
| Story Smallest                                               | ADD     | `Mobile`                                                                                            |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/dialog.json`
- Create: `packages/ui/src/organisms/dialog/dialog.tsx` (client), `dialog.test.tsx`, `dialog.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: Radix `Dialog` from `radix-ui` (verified in `@radix-ui/react-dialog@1.1.23`: `Title` names the dialog; `aria-describedby` is set only when a `Description` is rendered and no console warning is emitted without one; the scroll lock (`react-remove-scroll`, which sets `body[data-scroll-locked]`) lives on `Overlay`, so the overlay must render; `Content` may be nested inside `Overlay`; `Portal container` accepts `Element | DocumentFragment | null`, falling back to `document.body`), `IconButton`, `componentVariants`; stories: `Button`, `Field`, `Input`, `Select`.
- Produces: `Dialog`, `DialogProps`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/dialog.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "dialog-sm": {
      "$value": "400px",
      "$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }
    },
    "dialog-md": {
      "$value": "460px",
      "$description": "Design system Dialog default width.",
      "$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }
    },
    "dialog-lg": {
      "$value": "640px",
      "$extensions": { "pink-paprikaa": { "utility": ["max-w"] } }
    }
  },
  "text": {
    "$type": "typography",
    "dialog-title": {
      "$value": {
        "fontSize": "22px",
        "lineHeight": 1.25,
        "letterSpacing": "-0.01em",
        "fontWeight": "{font-weight.bold}"
      }
    },
    "dialog-body": {
      "$value": { "fontSize": "15px", "lineHeight": 1.6, "fontWeight": "{font-weight.regular}" }
    }
  }
}
```

Append to `SPACING`:

```ts
  "dialog-sm",
  "dialog-md",
  "dialog-lg",
```

Append to `TEXT`:

```ts
  "dialog-title",
  "dialog-body",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/dialog/dialog.test.tsx`:

```tsx
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Dialog } from "./dialog";

const TRIGGER = <button type="button">Book a table</button>;

describe("Dialog", () => {
  it("opens from its trigger, named by its title and described by its description", async () => {
    const user = userEvent.setup();
    render(
      <Dialog trigger={TRIGGER} title="Book a table" description="We hold it for 15 minutes.">
        Pick your outlet.
      </Dialog>
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    const dialog = screen.getByRole("dialog", { name: "Book a table" });
    expect(dialog).toHaveAccessibleDescription("We hold it for 15 minutes.");
    expect(within(dialog).getByText("Pick your outlet.")).toBeInTheDocument();
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    const trigger = screen.getByRole("button", { name: "Book a table" });
    await user.click(trigger);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("moves focus into the dialog when it opens", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    expect(screen.getByRole("dialog").contains(document.activeElement)).toBe(true);
  });

  it("closes from its labelled close button", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("reports open changes and stays open when controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange} title="Remove this item?">
        Chilli Paneer will come off your order.
      </Dialog>
    );
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeInTheDocument();
  });

  it("hides only the close button with hasCloseButton={false}; Escape still asks to close", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dialog
        open
        onOpenChange={onOpenChange}
        hasCloseButton={false}
        title="Remove this item?"
        footer={<button type="button">Keep it</button>}
      >
        Chilli Paneer will come off your order.
      </Dialog>
    );
    const dialog = screen.getByRole("dialog", { name: "Remove this item?" });
    expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Keep it" })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("merges a caller className onto the panel", () => {
    render(<Dialog defaultOpen title="Book a table" className="shadow-2" />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("shadow-2");
    expect(dialog).not.toHaveClass("shadow-4");
  });

  it("locks page scroll while open", async () => {
    const user = userEvent.setup();
    render(<Dialog trigger={TRIGGER} title="Book a table" />);
    await user.click(screen.getByRole("button", { name: "Book a table" }));
    expect(document.body).toHaveAttribute("data-scroll-locked");
    await user.keyboard("{Escape}");
    expect(document.body).not.toHaveAttribute("data-scroll-locked");
  });

  it("lays the ink scrim over the page behind it", () => {
    render(<Dialog defaultOpen title="Book a table" />);
    expect(document.querySelector(".bg-surface-overlay")).toBeInTheDocument();
  });

  it("renders the sheet with a grab handle and top-only corners", () => {
    render(<Dialog defaultOpen variant="sheet" title="Remove this item?" />);
    const sheet = screen.getByRole("dialog");
    expect(sheet).toHaveClass("rounded-t-xl");
    expect(sheet).not.toHaveClass("rounded-xl");
    expect(sheet.querySelector('[aria-hidden="true"] .rounded-pill')).toBeInTheDocument();
  });

  it("scrolls its body, never the header or footer, so the actions stay on screen", () => {
    render(
      <Dialog
        defaultOpen
        title="Book a table"
        footer={<button type="button">Hold my table</button>}
      >
        Pick your outlet.
      </Dialog>
    );
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("overflow-hidden");
    expect(within(dialog).getByText("Pick your outlet.")).toHaveClass(
      "min-h-0",
      "flex-1",
      "overflow-y-auto"
    );
    expect(within(dialog).getByRole("button", { name: "Hold my table" }).parentElement).toHaveClass(
      "shrink-0"
    );
  });

  it.each([
    ["sm", "max-w-dialog-sm"],
    ["md", "max-w-dialog-md"],
    ["lg", "max-w-dialog-lg"],
  ] as const)("sizes the modal %s", (size, widthClass) => {
    render(<Dialog defaultOpen size={size} title="Book a table" />);
    expect(screen.getByRole("dialog")).toHaveClass(widthClass);
  });

  it("renders the footer actions", () => {
    render(
      <Dialog
        defaultOpen
        title="Remove this item?"
        footer={<button type="button">Remove</button>}
      />
    );
    expect(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Remove" })
    ).toBeInTheDocument();
  });

  it("portals into the given container instead of the page body", () => {
    const frame = document.createElement("div");
    document.body.append(frame);
    render(<Dialog defaultOpen title="Remove this item?" portalContainer={frame} />);
    expect(frame).toContainElement(screen.getByRole("dialog"));
    frame.remove();
  });

  it("has no accessibility violations while open", async () => {
    render(
      <Dialog
        defaultOpen
        title="Book a table"
        description="We hold it for 15 minutes."
        footer={<button type="button">Hold my table</button>}
      >
        Pick your outlet.
      </Dialog>
    );
    // Scoped to the dialog: Radix hides the rest of the page (aria-hidden) while focus is trapped.
    await expectNoA11yViolations(screen.getByRole("dialog"));
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- organisms/dialog 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./dialog`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/dialog/dialog.tsx`:

```tsx
"use client";

import type { ReactElement, ReactNode } from "react";

import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { componentVariants, type VariantProps } from "../../lib/component-variants";
import { isShown } from "../../lib/is-shown";

const dialog = componentVariants({
  slots: {
    overlay: "fixed inset-0 z-overlay flex bg-surface-overlay",
    // Only the body scrolls: the title, the close button and the footer's actions stay on screen.
    content:
      "flex max-h-full w-full animate-sheet-in flex-col overflow-hidden bg-surface-card shadow-4",
    handle: "flex shrink-0 justify-center pt-2.5",
    handleBar: "h-1 w-10 rounded-pill bg-ink-300",
    header: "flex shrink-0 items-start justify-between gap-4 px-6 pt-5",
    title: "text-dialog-title font-display text-text-heading",
    description: "shrink-0 px-6 pt-1 text-body-sm text-text-muted",
    body: "text-dialog-body min-h-0 flex-1 overflow-y-auto px-6 pt-3 pb-5 text-text-body",
    footer: "flex shrink-0 flex-wrap justify-end gap-2.5 px-6 pb-6",
  },
  variants: {
    variant: {
      modal: { overlay: "items-center justify-center p-6", content: "rounded-xl" },
      sheet: { overlay: "items-end", content: "rounded-t-xl" },
    },
    size: { sm: {}, md: {}, lg: {} },
  },
  compoundVariants: [
    { variant: "modal", size: "sm", class: { content: "max-w-dialog-sm" } },
    { variant: "modal", size: "md", class: { content: "max-w-dialog-md" } },
    { variant: "modal", size: "lg", class: { content: "max-w-dialog-lg" } },
  ],
  defaultVariants: { variant: "modal", size: "md" },
});

export interface DialogProps
  extends
    Pick<DialogPrimitive.DialogProps, "open" | "defaultOpen" | "onOpenChange">,
    Pick<VariantProps<typeof dialog>, "variant" | "size"> {
  /** The element that opens the dialog, e.g. a Button. */
  trigger?: ReactElement | undefined;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** Buttons, right-aligned. */
  footer?: ReactNode;
  closeLabel?: string | undefined;
  /**
   * `false` hides the close button only. Escape and the scrim still ask to close through
   * `onOpenChange` — a decision that must be answered is controlled, keeps itself open, and gives
   * its own action buttons in `footer`.
   */
  hasCloseButton?: boolean | undefined;
  /** Portal target; default `document.body`. Pass a positioned frame (AppShell's overlay slot) to keep the dialog inside it. */
  portalContainer?: HTMLElement | null | undefined;
  /** Merged onto the panel (the element with `role="dialog"`). */
  className?: string | undefined;
}

/**
 * A decision that must be made now: a centred modal (24px radius, `--shadow-4`, 56% ink scrim),
 * or a bottom sheet with a grab handle — the app default. Radix Dialog: focus is trapped, Escape
 * and the scrim close it, focus returns to the trigger, the page behind cannot scroll.
 */
export function Dialog({
  trigger,
  title,
  description,
  children,
  footer,
  variant = "modal",
  size = "md",
  closeLabel = "Close",
  hasCloseButton = true,
  portalContainer = null,
  className,
  ...root
}: DialogProps) {
  const slots = dialog({ variant, size });
  return (
    <DialogPrimitive.Root {...root}>
      {trigger ? <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger> : null}
      <DialogPrimitive.Portal container={portalContainer}>
        <DialogPrimitive.Overlay className={slots.overlay()}>
          <DialogPrimitive.Content data-surface="light" className={slots.content({ className })}>
            {variant === "sheet" ? (
              <div aria-hidden className={slots.handle()}>
                <span className={slots.handleBar()} />
              </div>
            ) : null}
            <div className={slots.header()}>
              <DialogPrimitive.Title className={slots.title()}>{title}</DialogPrimitive.Title>
              {hasCloseButton ? (
                <DialogPrimitive.Close asChild>
                  <IconButton icon={X} label={closeLabel} size="sm" variant="ghost" />
                </DialogPrimitive.Close>
              ) : null}
            </div>
            {isShown(description) ? (
              <DialogPrimitive.Description className={slots.description()}>
                {description}
              </DialogPrimitive.Description>
            ) : null}
            {isShown(children) ? <div className={slots.body()}>{children}</div> : null}
            {isShown(footer) ? <div className={slots.footer()}>{footer}</div> : null}
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- organisms/dialog 2>&1 | tail -8`
Expected: PASS (17 tests).

- [ ] **Step 6: Stories (card parity with `Dialog.card.html`)**

Stories that render open set `a11y` to skip `aria-hidden-focus` only: Radix marks the rest of the page `aria-hidden` while it traps focus inside the dialog, which that rule reports although the hidden content cannot receive focus. Every other rule still runs. Each story renders in its own iframe so open dialogs do not stack on the docs page.

`packages/ui/src/organisms/dialog/dialog.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "lucide-react";
import { useState } from "react";
import { expect, screen, waitFor, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { Field } from "../../molecules/field/field";
import { VIEWPORT_360 } from "../story-fixtures";
import { Dialog, type DialogProps } from "./dialog";

/** Radix hides the page behind an open dialog while trapping focus; that rule misreads it. */
const OPEN_DIALOG_A11Y = {
  a11y: { config: { rules: [{ id: "aria-hidden-focus", enabled: false }] } },
};

const BOOKING_FORM = (
  <div className="grid gap-3">
    <Field label="Outlet">
      {(control) => (
        <Select {...control} options={[{ value: "sector-57", label: "Sector 57, Gurgaon" }]} />
      )}
    </Field>
    <Field label="Mobile number">
      {(control) => <Input {...control} type="tel" icon={Phone} placeholder="98765 43210" />}
    </Field>
  </div>
);

const meta = {
  title: "Organisms/Dialog",
  component: Dialog,
  args: {
    trigger: <Button>Book a table</Button>,
    title: "Book a table",
    children: BOOKING_FORM,
    footer: (
      <>
        <Button variant="ghost" size="sm">
          Cancel
        </Button>
        <Button size="sm">Hold My Table</Button>
      </>
    ),
  },
  parameters: {
    docs: {
      story: { inline: false, height: "480px" },
      description: {
        component:
          'A decision that must be made now. `variant="modal"` is centred (24px radius, shadow-4, 56% ink scrim); `variant="sheet"` is the app\'s bottom sheet with a grab handle and top corners only. Focus is trapped, Escape and the scrim close it, focus returns to the trigger, the page cannot scroll. `portalContainer` renders it inside a positioned frame (AppShell\'s overlay slot) instead of the page body.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: centred modal. */
export const CentredModal: Story = {
  args: { defaultOpen: true, size: "sm" },
  parameters: OPEN_DIALOG_A11Y,
};

/** Card row: sheet. */
export const Sheet: Story = {
  args: {
    defaultOpen: true,
    variant: "sheet",
    title: "Remove this item?",
    children: "Chilli Paneer will come off your order.",
    footer: (
      <>
        <Button variant="ghost" size="sm">
          Keep It
        </Button>
        <Button size="sm">Remove</Button>
      </>
    ),
  },
  parameters: OPEN_DIALOG_A11Y,
};

export const Large: Story = {
  args: { defaultOpen: true, size: "lg", description: "We hold a table for 15 minutes." },
  parameters: OPEN_DIALOG_A11Y,
};

/** Keyboard: open from the trigger, Escape closes, focus returns. */
export const KeyboardFlow: Story = {
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Book a table" });
    await userEvent.click(trigger);
    await expect(await screen.findByRole("dialog", { name: "Book a table" })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};

/**
 * A decision that must be answered: no close button, and the caller keeps the dialog open when
 * Escape or the scrim ask to close (it passes no `onOpenChange`), so the footer's buttons are the
 * only way out.
 */
function MustBeAnsweredDialog(args: DialogProps) {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      {...args}
      open={open}
      hasCloseButton={false}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Keep It
          </Button>
          <Button size="sm" onClick={() => setOpen(false)}>
            Remove
          </Button>
        </>
      }
    />
  );
}

export const MustBeAnswered: Story = {
  args: {
    trigger: undefined,
    title: "Remove this item?",
    children: "Chilli Paneer will come off your order.",
  },
  parameters: OPEN_DIALOG_A11Y,
  render: (args) => <MustBeAnsweredDialog {...args} />,
  play: async ({ userEvent }) => {
    const dialog = await screen.findByRole("dialog", { name: "Remove this item?" });
    await expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeVisible();
    await userEvent.click(within(dialog).getByRole("button", { name: "Keep It" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  },
};

/**
 * The sheet inside a phone frame: the frame is `portalContainer`, and its `contain-layout` (as
 * AppShell's frame has) makes it the containing block for the fixed scrim, so the sheet anchors to
 * the frame, not the viewport.
 */
function FramedSheet(args: DialogProps) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setFrame}
      className="relative h-165 w-90 overflow-hidden rounded-lg border border-border-subtle bg-surface-page-alt contain-layout"
    >
      {frame === null ? null : <Dialog {...args} portalContainer={frame} />}
    </div>
  );
}

export const InsideAPhoneFrame: Story = {
  args: {
    defaultOpen: true,
    variant: "sheet",
    title: "Remove this item?",
    children: "Chilli Paneer will come off your order.",
    footer: (
      <>
        <Button variant="ghost" size="sm">
          Keep It
        </Button>
        <Button size="sm">Remove</Button>
      </>
    ),
  },
  parameters: OPEN_DIALOG_A11Y,
  render: (args) => <FramedSheet {...args} />,
};

/** The smallest supported viewport: the modal keeps its gutter on both sides. */
export const Mobile: Story = {
  args: { defaultOpen: true },
  globals: VIEWPORT_360,
  parameters: OPEN_DIALOG_A11Y,
};
```

- [ ] **Step 7: Export**

```ts
export { Dialog, type DialogProps } from "./organisms/dialog/dialog";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/dialog packages/design-tokens/tokens/component/dialog.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/dialog.json packages/ui/src/organisms/dialog packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): add the Dialog organism

Radix Dialog as the design system's modal and bottom sheet: title-named,
optionally described, focus-trapped, closed by Escape, the scrim or a named
close button, with focus returned and page scroll locked. Sizes come from
component tokens; portalContainer keeps it inside a phone frame.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

