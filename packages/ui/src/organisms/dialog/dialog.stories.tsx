import type { Meta, StoryObj } from "@storybook/react-vite";

import { Phone } from "lucide-react";
import { useState } from "react";
import { expect, screen, waitFor, within } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { ringClippers } from "../../lib/story-ring";
import { Field } from "../../molecules/field/field";
import { VIEWPORT_360 } from "../story-fixtures";
import { Dialog, type DialogProps } from "./dialog";

/**
 * Radix hides the page behind an open dialog while trapping focus; `aria-hidden-focus` misreads
 * it. A story's `rules` replace the preview's list, so `color-contrast` (owned by the token
 * contrast policy) is switched off again here.
 */
const OPEN_DIALOG_A11Y = {
  a11y: {
    config: {
      rules: [
        { id: "color-contrast", enabled: false },
        { id: "aria-hidden-focus", enabled: false },
      ],
    },
  },
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
          'A decision that must be made now. `variant="modal"` is centred (24px radius, shadow-4, 56% ink scrim); `variant="sheet"` is the app\'s bottom sheet with a grab handle and top corners only. Focus is trapped, Escape and the scrim close it, focus returns to the trigger (or, without one, to what had focus when it opened — Safari and Firefox on macOS do not focus a clicked button, so pass a `trigger` where a pointer open must get focus back), the page cannot scroll. `portalContainer` renders it inside a positioned frame (AppShell\'s overlay slot) instead of the page body.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The panel fades and slides in (`animate-sheet-in`): wait for it to land before measuring. */
async function settle(dialog: HTMLElement) {
  await Promise.all(dialog.getAnimations().map((animation) => animation.finished));
  return dialog;
}

/**
 * The panel clips (`overflow-hidden`) and its body scrolls (`overflow-y-auto`), so the padding must
 * hold every focus ring whole: tab round the trapped focus — close button, fields (whose ring is
 * the field box's), footer buttons — and prove nothing cuts any of them.
 */
function proveRingsWhole(stops: number): NonNullable<Story["play"]> {
  return async ({ userEvent }) => {
    const dialog = await settle(await screen.findByRole("dialog"));
    const seen = new Set<Element>();
    for (let step = 0; step <= stops; step += 1) {
      await userEvent.tab();
      const active = document.activeElement;
      if (!(active instanceof HTMLElement) || seen.has(active)) break;
      seen.add(active);
      await expect(dialog).toContainElement(active);
      const ring = active.matches("input, select, textarea") ? active.parentElement : active;
      if (ring === null) throw new Error("a field control outside its field box");
      await expect(ringClippers(ring)).toEqual([]);
    }
    await expect(seen.size).toBe(stops);
  };
}

export const Playground: Story = {};

/** Card row: centred modal. */
export const CentredModal: Story = {
  args: { defaultOpen: true, size: "sm" },
  parameters: OPEN_DIALOG_A11Y,
  play: proveRingsWhole(5),
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
  play: proveRingsWhole(3),
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
    await expect(
      await settle(await screen.findByRole("dialog", { name: "Book a table" }))
    ).toBeVisible();
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
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Dialog
      {...args}
      open={isOpen}
      hasCloseButton={false}
      footer={
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            Keep It
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setIsOpen(false);
            }}
          >
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
    const dialog = await settle(await screen.findByRole("dialog", { name: "Remove this item?" }));
    await expect(within(dialog).queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await expect(screen.getByRole("dialog", { name: "Remove this item?" })).toBeVisible();
    // A click outside the panel lands on the scrim; it cannot close the dialog either.
    const scrim = document.querySelector<HTMLElement>(".bg-surface-overlay");
    if (scrim === null) throw new Error("no scrim");
    await userEvent.click(scrim);
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
  play: proveRingsWhole(3),
};

/** The smallest supported viewport: the modal keeps its gutter on both sides. */
export const Mobile: Story = {
  args: { defaultOpen: true },
  globals: VIEWPORT_360,
  parameters: OPEN_DIALOG_A11Y,
  play: proveRingsWhole(5),
};
