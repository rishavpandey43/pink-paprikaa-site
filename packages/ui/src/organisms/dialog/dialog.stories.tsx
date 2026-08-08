import type { Meta, StoryObj } from "@storybook/react-vite";

import { useState } from "react";

import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";
import { Select } from "../../atoms/select/select";
import { Field } from "../../molecules/field/field";
import { Dialog, type DialogProps } from "./dialog";

const meta = {
  title: "Organisms/Dialog",
  component: Dialog,
  args: {
    title: "Remove this item?",
    children: "Chilli Paneer will come off your order.",
  },
  argTypes: {
    children: { control: false },
    container: { control: false },
    footer: { control: false },
    trigger: { control: false },
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The modal for a decision that has to be made now: a 24px card on a 56% ink scrim, " +
          "with the focus trap, Escape handling and scroll lock all coming from Radix. Reach for " +
          '`variant="sheet"` on a phone screen, where a centred box leaves the thumb nowhere to land.',
      },
    },
  },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Opened from its own trigger — the shape a real page uses. */
export const Default: Story = {
  args: {
    trigger: <Button variant="secondary">Remove Item</Button>,
    footer: (
      <>
        <Button variant="ghost">Keep It</Button>
        <Button>Remove</Button>
      </>
    ),
  },
};

/** The bottom sheet: full width, a grab handle, and only its top corners rounded. */
export const Sheet: Story = {
  args: {
    variant: "sheet",
    trigger: <Button variant="secondary">Open Sheet</Button>,
    footer: (
      <>
        <Button variant="ghost">Keep It</Button>
        <Button>Remove</Button>
      </>
    ),
  },
};

/** A description sits under the title and is wired as the dialog's accessible description. */
export const WithDescription: Story = {
  args: {
    title: "Hold your table?",
    description: "We keep it for 15 minutes past the slot.",
    children: "Sector 57 seats 24 people, so weekend evenings go quickly.",
    trigger: <Button variant="secondary">Book a Table</Button>,
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button>Hold My Table</Button>
      </>
    ),
  },
};

/** A form body. The dialog scrolls its own middle, so the footer never leaves the screen. */
export const WithForm: Story = {
  args: {
    title: "Book a table",
    size: "sm",
    trigger: <Button variant="secondary">Book a Table</Button>,
    children: (
      <div className="grid gap-4">
        <Field htmlFor="dialog-outlet" label="Outlet">
          <Select id="dialog-outlet" options={["Sector 57", "MKM Market"]} />
        </Field>
        <Field htmlFor="dialog-mobile" label="Mobile number">
          <Input id="dialog-mobile" placeholder="98765 43210" />
        </Field>
      </div>
    ),
    footer: (
      <>
        <Button variant="ghost">Cancel</Button>
        <Button>Hold My Table</Button>
      </>
    ),
  },
};

/** 328 / 460 / 640px. Each is capped at the viewport, so none of them overflow 360px. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-4">
      <Dialog {...args} size="sm" trigger={<Button variant="secondary">Small</Button>} />
      <Dialog {...args} size="md" trigger={<Button variant="secondary">Medium</Button>} />
      <Dialog {...args} size="lg" trigger={<Button variant="secondary">Large</Button>} />
    </div>
  ),
};

/** No close glyph: the guest has to answer rather than dismiss. */
export const MustBeAnswered: Story = {
  args: {
    hasCloseButton: false,
    title: "Clear your order?",
    children: "All four items come off. This cannot be undone.",
    trigger: <Button variant="secondary">Clear Order</Button>,
    footer: (
      <>
        <Button variant="ghost">Keep My Order</Button>
        <Button>Clear It</Button>
      </>
    ),
  },
};

/**
 * Inside a phone frame the dialog anchors to the frame, not the viewport — `position="container"`
 * plus the same element as `container`. Both are needed; one without the other misplaces it.
 */
function AnchoredSheet(args: DialogProps) {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);

  return (
    <div
      className="relative h-75 w-60 overflow-hidden rounded-4 border border-border-subtle bg-surface-page-alt"
      ref={setFrame}
    >
      <Dialog {...args} container={frame} isDefaultOpen position="container" variant="sheet" />
    </div>
  );
}

export const InsideAPhoneFrame: Story = {
  render: (args) => (
    <AnchoredSheet
      {...args}
      footer={
        <>
          <Button size="sm" variant="ghost">
            Keep It
          </Button>
          <Button size="sm">Remove</Button>
        </>
      }
    />
  ),
};

/** The smallest supported viewport. The card keeps a 20px gutter on both sides. */
export const Smallest: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    isDefaultOpen: true,
    title: "Remove this item?",
    footer: (
      <>
        <Button variant="ghost">Keep It</Button>
        <Button>Remove</Button>
      </>
    ),
  },
};
