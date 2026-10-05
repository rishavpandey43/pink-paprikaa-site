import type { Meta, StoryObj } from "@storybook/react-vite";

import { Users } from "lucide-react";
import { useState } from "react";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";

import { paint } from "../../lib/story-paint";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Select } from "./select";

const OUTLETS = [{ value: "sector-57", label: "Sector 57, Gurgaon" }];
const GUESTS = [
  { value: "2", label: "2 guests" },
  { value: "4", label: "4 guests" },
  { value: "6", label: "6 guests" },
];
const SLOTS = [
  { value: "19:30", label: "7:30pm" },
  { value: "20:00", label: "8:00pm" },
  { value: "20:30", label: "8:30pm", isDisabled: true },
];
const LONG_LIST = Array.from({ length: 24 }, (_, index) => ({
  value: `slot-${String(index)}`,
  label: `${String(11 + Math.floor(index / 2))}:${index % 2 === 0 ? "00" : "30"}`,
}));

const meta = {
  title: "Atoms/Select",
  component: Select,
  args: { "aria-label": "Pick your outlet", options: OUTLETS },
  argTypes: { icon: { control: false } },
  render: (args) => (
    <div className="w-full max-w-text-measure-prose">
      <Select {...args} />
    </div>
  ),
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Dropdown for short, known lists — outlet, table size, pickup slot. Matches Input exactly: the same heights, radius, status colours and glyphs (the status glyph replaces the chevron), `disabled`, and `readOnly` (sunken fill + lock). Opens our own listbox (MenuPanel), never the browser popup; ≤640px becomes a bottom sheet. A hidden native `<select>` in lib keeps `{...register()}` and FormData working. For more than ~12 options use Combobox. Label and message belong to Field.",
      },
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Rest: Story = { name: "rest", args: { defaultValue: "sector-57" } };

export const PlaceholderAndIcon: Story = {
  name: "placeholder + icon",
  args: { "aria-label": "Guests", icon: Users, placeholder: "Choose a size", options: GUESTS },
};

export const StatusError: Story = {
  name: "error",
  args: { "aria-label": "Time", placeholder: "Choose a slot", status: "error", options: SLOTS },
  // The placeholder and 8:30pm are disabled <option>s: they must not paint the field disabled.
  play: async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "Time" });
    const box = select.parentElement;
    if (box === null) throw new Error("The select renders inside its field box.");
    await expect(getComputedStyle(box).backgroundColor).toBe(
      paint(select, "backgroundColor", "--color-surface-card")
    );
    await expect(getComputedStyle(box).borderColor).toBe(
      paint(select, "borderColor", "--color-status-danger")
    );
    // Placeholder uses text-subtle on the label span; the button inherits the field's body colour.
    await expect(getComputedStyle(select).color).toBe(paint(select, "color", "--color-text-body"));
  },
};

export const StatusSuccess: Story = {
  name: "success",
  args: { "aria-label": "Outlet", status: "success" },
};

export const StatusWarning: Story = {
  name: "warning",
  args: { "aria-label": "Outlet", status: "warning" },
};

export const ReadOnlyAndDisabled: Story = {
  name: "readOnly / disabled",
  render: () => (
    <div className="grid w-full max-w-text-measure-prose gap-3">
      <Select aria-label="Outlet" readOnly options={OUTLETS} />
      <Select aria-label="Outlet, unavailable" readOnly status="error" options={OUTLETS} />
      <Select
        aria-label="Delivery slot"
        disabled
        options={[{ value: "none", label: "Not available yet" }]}
      />
    </div>
  ),
  // Locked but readable: a read-only select is disabled natively, yet paints body text on a
  // default border, while a disabled one greys. A probe painted with the token inside the same
  // field box gives the expected value in the browser's own format.
  play: async ({ canvas }) => {
    const readOnly = canvas.getByRole("combobox", { name: "Outlet" });
    const disabled = canvas.getByRole("combobox", { name: "Delivery slot" });
    const box = readOnly.parentElement;
    if (box === null) throw new Error("The select renders inside its field box.");

    await expect(getComputedStyle(readOnly).color).toBe(
      paint(readOnly, "color", "--color-text-body")
    );
    await expect(getComputedStyle(readOnly).opacity).toBe("1");
    await expect(getComputedStyle(box).borderColor).toBe(
      paint(readOnly, "borderColor", "--color-border-default")
    );
    await expect(getComputedStyle(disabled).color).toBe(
      paint(disabled, "color", "--color-ink-400")
    );

    // A status still shows on a read-only select: the disabled paint must not reset its border.
    const invalid = canvas.getByRole("combobox", { name: "Outlet, unavailable" });
    const invalidBox = invalid.parentElement;
    if (invalidBox === null) throw new Error("The select renders inside its field box.");
    await expect(getComputedStyle(invalidBox).borderColor).toBe(
      paint(invalid, "borderColor", "--color-status-danger")
    );
  },
};

export const Sizes: Story = {
  name: "size",
  render: () => (
    <div className="grid w-full max-w-text-measure-prose gap-3">
      <Select aria-label="Outlet, small" size="sm" options={OUTLETS} />
      <Select aria-label="Outlet, medium" size="md" options={OUTLETS} />
      <Select aria-label="Outlet, large" size="lg" options={OUTLETS} />
    </div>
  ),
};

/** Review focus 2: a long label truncates inside the box; the box never outgrows a 360px phone. */
export const LongLabelAt360: Story = {
  name: "long option label at 360px",
  args: {
    "aria-label": "Pick your outlet",
    options: [
      {
        value: "57",
        label: "Sector 57, HSVP Market (MKM Market), Gurgaon 122003 — the pickup counter",
      },
    ],
  },
  render: (args) => (
    <div data-testid="frame" className="w-90">
      <Select {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId("frame");
    const box = canvas.getByRole("combobox", { name: "Pick your outlet" }).parentElement;
    await expect(box?.getBoundingClientRect().width).toBeLessThanOrEqual(
      frame.getBoundingClientRect().width
    );
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
  },
};

/**
 * R95: two Selects side by side at the 360px floor — a 328px content box (16px gutters) with a
 * 12px gap leaves 158px a column; the intrinsic minimum must fit it, or the pair overflows the phone.
 */
export const TwoUpAt360: Story = {
  name: "two up at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  render: () => (
    <div data-testid="frame" className="grid w-82 grid-cols-2 gap-3">
      <Select aria-label="Guests" placeholder="Guests" options={GUESTS} />
      <Select aria-label="Time" placeholder="Time" options={SLOTS} />
    </div>
  ),
  play: async ({ canvas }) => {
    const frame = canvas.getByTestId("frame");
    const guests = canvas.getByRole("combobox", { name: "Guests" }).parentElement;
    const time = canvas.getByRole("combobox", { name: "Time" }).parentElement;
    await expect(frame.scrollWidth).toBeLessThanOrEqual(frame.clientWidth);
    await expect(guests?.getBoundingClientRect().right).toBeLessThanOrEqual(
      time?.getBoundingClientRect().left ?? 0
    );
    await expect(time?.getBoundingClientRect().right).toBeLessThanOrEqual(
      frame.getBoundingClientRect().right
    );
  },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Select aria-label="Guests" icon={Users} placeholder="Choose a size" options={GUESTS} />
    </OnSurfaces>
  ),
};

/**
 * R90: in a content-sized parent (an inline row, a flex cluster) the box has an intrinsic minimum,
 * so a short placeholder reads in full instead of clipping to "Pick …".
 */
export const ContentSizedParent: Story = {
  args: {
    "aria-label": "How spicy?",
    placeholder: "Pick one",
    status: "error",
    options: [{ value: "mild", label: "Mild" }],
  },
  render: (args) => (
    <div className="inline-flex">
      <Select {...args} />
    </div>
  ),
  play: async ({ canvas }) => {
    const select = canvas.getByRole("combobox", { name: "How spicy?" });
    const style = getComputedStyle(select);
    const probe = document.createElement("span");
    probe.style.font = style.font;
    probe.style.whiteSpace = "pre";
    probe.textContent = "Pick one";
    document.body.append(probe);
    const textWidth = probe.getBoundingClientRect().width;
    probe.remove();
    const room =
      select.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight);
    await expect(room).toBeGreaterThanOrEqual(textWidth);
  },
};

/** Card row: list open with the brand diamond on the chosen row. */
export const OpenList: Story = {
  name: "open list",
  args: {
    "aria-label": "Pickup time",
    defaultValue: "20:00",
    defaultOpen: true,
    options: SLOTS,
  },
  play: async ({ canvas }) => {
    const listbox = await waitFor(() => screen.getByRole("listbox", { name: "Pickup time" }));
    await waitFor(() => expect(listbox).toBeVisible());
    const chosen = within(listbox).getByRole("option", { name: "8:00pm" });
    await expect(chosen).toHaveAttribute("aria-selected", "true");
    await expect(chosen.querySelector("[aria-hidden='true']")).not.toBeNull();
    await expect(canvas.getByRole("combobox")).toHaveAttribute("aria-expanded", "true");
  },
};

/** Keyboard: open, type-to-jump, Enter selects, Escape returns focus. */
export const Keyboard: Story = {
  name: "keyboard",
  args: {
    "aria-label": "Spice",
    options: [
      { value: "mild", label: "Mild" },
      { value: "medium", label: "Medium" },
      { value: "hot", label: "Hot" },
    ],
  },
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("combobox", { name: "Spice" });
    trigger.focus();
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(screen.getByRole("listbox")).toBeVisible());
    await userEvent.keyboard("h");
    await userEvent.keyboard("{Enter}");
    await expect(trigger).toHaveTextContent("Hot");
    await expect(trigger).toHaveFocus();
  },
};

/** Long list: many options render in the open panel. */
export const LongList: Story = {
  name: "long list",
  args: {
    "aria-label": "Pickup slot",
    placeholder: "Choose a slot",
    defaultOpen: true,
    options: LONG_LIST,
  },
  play: async () => {
    const listbox = await waitFor(() => screen.getByRole("listbox", { name: "Pickup slot" }));
    await waitFor(() => expect(listbox).toBeVisible());
    await expect(within(listbox).getAllByRole("option").length).toBe(24);
  },
};

/**
 * Select inside a dialog-sized frame (plain chrome — atom stories cannot import Dialog/Field).
 * Ruling: prove portal + open list without pulling organisms into atoms/.
 */
export const InDialog: Story = {
  name: "in dialog",
  args: { "aria-label": "Outlet", options: OUTLETS },
  render: () => (
    <div
      role="dialog"
      aria-label="Book a table"
      className="relative w-full max-w-dialog-sm rounded-xl bg-surface-card p-6 shadow-4"
    >
      <Select aria-label="Outlet" options={OUTLETS} placeholder="Pick an outlet" defaultOpen />
    </div>
  ),
  play: async () => {
    await expect(await screen.findByRole("dialog", { name: "Book a table" })).toBeVisible();
    await waitFor(() => expect(screen.getByRole("listbox")).toBeVisible());
  },
};

/**
 * Select portalled into a positioned phone frame (stand-in for AppShell overlay — atoms cannot
 * import layouts/).
 */
export const InAppShell: Story = {
  name: "in app shell",
  args: { "aria-label": "Outlet", options: OUTLETS },
  render: function InAppShellSelect() {
    const [frame, setFrame] = useState<HTMLDivElement | null>(null);
    return (
      <div
        ref={setFrame}
        className="relative h-app-shell-sm-h w-app-shell-sm-w overflow-hidden rounded-xl border border-border-subtle bg-surface-page"
      >
        <div className="p-4">
          {frame === null ? null : (
            <Select aria-label="Outlet" options={OUTLETS} defaultOpen portalContainer={frame} />
          )}
        </div>
      </div>
    );
  },
  play: async () => {
    await waitFor(() => expect(screen.getByRole("listbox", { name: "Outlet" })).toBeVisible());
  },
};

/** ≤640 sheet: handle, title, 52px rows. */
export const Sheet360: Story = {
  name: "sheet at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  args: {
    "aria-label": "Spice",
    defaultOpen: true,
    sheet: true,
    options: [
      { value: "mild", label: "Mild" },
      { value: "medium", label: "Medium" },
      { value: "hot", label: "Hot" },
    ],
  },
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "aria-hidden-focus", enabled: false },
          { id: "scrollable-region-focusable", enabled: false },
        ],
      },
    },
  },
  play: async () => {
    await waitFor(() => expect(screen.getByRole("listbox", { name: "Spice" })).toBeVisible());
    await expect(screen.getByRole("option", { name: "Mild" })).toHaveClass("min-h-13");
    await expect(document.querySelector('[class*="animate-sheet-in"]')).not.toBeNull();
  },
};
