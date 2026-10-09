import type { Meta, StoryObj } from "@storybook/react-vite";
import { Flag, Phone, Share2 } from "lucide-react";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { Avatar } from "../../atoms/avatar/avatar";
import { Card } from "../../atoms/card/card";
import { Typography } from "../../atoms/typography/typography";
import { ActionMenu, type ActionMenuItem } from "./action-menu";

const OUTLET_ITEMS: ActionMenuItem[] = [
  { value: "share", label: "Share outlet", icon: Share2 },
  { value: "call", label: "Call Sector 57", icon: Phone },
  { divider: true },
  { value: "report", label: "Report a problem", icon: Flag, isDanger: true },
];

const meta = {
  title: "Molecules/ActionMenu",
  component: ActionMenu,
  args: { items: OUTLET_ITEMS },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Row and card overflow menu (R134): ghost sm IconButton with ellipsis → Menu atom. Pass `items` (value/label/icon/meta/isDanger, dividers, groups); destructive actions sit last after a divider. ≤640px becomes a bottom sheet titled from `title` or `label`.",
      },
    },
  },
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: ghost, secondary, horizontal ellipsis. */
export const Variants: Story = {
  name: "variants",
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <ActionMenu items={OUTLET_ITEMS} />
      <ActionMenu items={OUTLET_ITEMS} variant="secondary" />
      <ActionMenu items={OUTLET_ITEMS} icon="ellipsis" label="More" />
    </div>
  ),
};

/** Card row: on brand. */
export const OnBrand: Story = {
  name: "on brand",
  render: () => (
    <div data-surface="brand" className="rounded-lg bg-surface-brand p-4">
      <ActionMenu items={OUTLET_ITEMS} />
    </div>
  ),
};

/** Card row: open inside a row card with Avatar; destructive last. */
export const OpenInRow: Story = {
  name: "open in row",
  parameters: {
    a11y: {
      config: {
        rules: [{ id: "aria-hidden-focus", enabled: false }],
      },
    },
  },
  render: () => (
    <Card padding="md" className="max-w-text-measure-prose">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name="Kavya Menon" />
          <Typography variant="body-sm">Kavya Menon</Typography>
        </div>
        <ActionMenu items={OUTLET_ITEMS} defaultOpen />
      </div>
    </Card>
  ),
  play: async () => {
    await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
    const rows = screen.getAllByRole("menuitem");
    await expect(rows.at(-1)).toHaveTextContent("Report a problem");
  },
};

/** Moved from Menu stories: pointer open, choose Share, focus returns. */
export const ThreeDotMenu: Story = {
  name: "three-dot menu",
  play: async ({ canvas }) => {
    const trigger = canvas.getByRole("button", { name: "More actions" });
    await userEvent.click(trigger);
    await expect(await screen.findByRole("menu", { name: "More actions" })).toBeVisible();
    await userEvent.click(screen.getByRole("menuitem", { name: "Share outlet" }));
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    await expect(trigger).toHaveFocus();
  },
};
