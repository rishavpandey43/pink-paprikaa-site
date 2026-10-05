import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf } from "lucide-react";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import {
  StatesRow,
  type StoryForceState,
  storyStateControlProps,
  storyStatesPseudo,
} from "../../lib/story-states";
import { OnSurfaces } from "../../lib/story-surfaces";
import { Tag } from "./tag";

const TAG_STATES = [
  "rest",
  "hover",
  "press",
  "focus",
  "disabled",
] as const satisfies readonly StoryForceState[];

const noop = () => undefined;

function SelectableRow({
  labels = ["All", "Small Plates", "Sweets"],
}: {
  labels?: readonly string[] | undefined;
}) {
  const [value, setValue] = useState("All");
  return (
    <div className="flex flex-wrap items-center gap-3">
      {labels.map((label) => (
        <Tag
          key={label}
          isSelected={value === label}
          onClick={() => {
            setValue(label);
          }}
        >
          {label}
        </Tag>
      ))}
    </div>
  );
}

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  args: { children: "Small Plates", isSelected: false },
  argTypes: { icon: { control: false } },
  parameters: {
    docs: {
      description: {
        component:
          "Tappable filter pill — menu categories, dietary filters, outlet cities. Sentence/Title Case (not caps — that's `Badge`). Selected = flooded pink; unselected = white with a 1px border. With `onClick` it is a toggle button (`aria-pressed`); without, a static chip. Static `color` success and brand are the delivery-zone chips. Tags are a fixed 38px and never wrap; a label longer than its row ellipsises.",
      },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { pseudo: storyStatesPseudo(TAG_STATES) },
  render: () => (
    <StatesRow
      states={TAG_STATES}
      render={(state) => (
        <Tag onClick={noop} {...storyStateControlProps(state)}>
          Small Plates
        </Tag>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const hover = canvasElement.querySelector("#cell-hover button");
    if (!(hover instanceof HTMLElement)) {
      throw new Error("Tag States: #cell-hover button missing");
    }
    await expect(hover).toHaveClass("hover:bg-state-hover");
  },
};

export const Selectable: Story = {
  name: "selectable (onClick + isSelected)",
  render: () => <SelectableRow />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const sweets = canvas.getByRole("button", { name: "Sweets" });
    await userEvent.click(sweets);
    await expect(sweets).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByRole("button", { name: "All" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  },
};

export const WithIcon: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag icon={Leaf}>Jain</Tag>
      <Tag icon={Flame} isSelected>
        Hot
      </Tag>
      <Tag icon={Clock}>Under 15 min</Tag>
    </div>
  ),
};

export const Disabled: Story = {
  name: "disabled",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Tag disabled onClick={noop}>
        Breakfast
      </Tag>
      <Tag disabled isSelected icon={Leaf} onClick={noop}>
        Jain
      </Tag>
      <Tag>Static, no onClick</Tag>
    </div>
  ),
};

/** In context: the menu category rail, one selection at a time. It wraps rather than clips at 360px. */
export const CategoryFilterRail: Story = {
  name: "in context: category rail at 360px",
  render: () => (
    <div className="w-90">
      <SelectableRow
        labels={["All", "Small Plates", "North Indian", "Momos", "Chinese", "Sweets"]}
      />
    </div>
  ),
};

export const Colors: Story = {
  name: "color",
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag color="neutral">Sector 55</Tag>
      <Tag color="success">Sector 57</Tag>
      <Tag color="success">Sector 56</Tag>
      <Tag color="brand">Sector 58</Tag>
      <Tag color="brand">Sector 62</Tag>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <Tag onClick={noop} isSelected>
        All
      </Tag>
      <Tag onClick={noop}>Sweets</Tag>
    </OnSurfaces>
  ),
};

export const LongLabel: Story = {
  name: "long label at 360px",
  render: () => (
    <div data-testid="frame" className="flex w-90 flex-wrap gap-2">
      <Tag onClick={noop} icon={Clock}>
        Under 15 minutes, every weekday lunch and dinner
      </Tag>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frame = canvas.getByTestId("frame").getBoundingClientRect();
    const tag = canvas.getByRole("button").getBoundingClientRect();
    await expect(tag.right).toBeLessThanOrEqual(frame.right + 0.5);
    await expect(tag.height).toBe(38);
  },
};
