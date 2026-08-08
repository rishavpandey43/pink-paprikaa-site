import type { Meta, StoryObj } from "@storybook/react-vite";

import { Clock, Flame, Leaf } from "lucide-react";
import { useState } from "react";

import { Tag } from "./tag";

const meta = {
  title: "Atoms/Tag",
  component: Tag,
  args: { children: "Small Plates" },
  argTypes: {
    icon: { control: false },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Tappable filter pill — menu categories, dietary filters, outlet cities. 38px tall, " +
          "Sentence or Title Case. Selected floods the brand pink; unselected is white with a " +
          "hairline border. For a non-interactive status marker in caps, use `Badge` instead.",
      },
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Selection: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag {...args} isSelected>
        All
      </Tag>
      <Tag {...args}>Small Plates</Tag>
      <Tag {...args}>Sweets</Tag>
    </div>
  ),
};

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag {...args} icon={Leaf}>
        Jain
      </Tag>
      <Tag {...args} icon={Flame} isSelected>
        Hot
      </Tag>
      <Tag {...args} icon={Clock}>
        Under 15 min
      </Tag>
    </div>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <Tag {...args} disabled>
        Breakfast
      </Tag>
      <Tag {...args} disabled icon={Leaf} isSelected>
        Jain
      </Tag>
    </div>
  ),
};

const CATEGORIES = ["All", "Small Plates", "North Indian", "Momos", "Chinese", "Sweets"];

function CategoryRail() {
  const [picked, setPicked] = useState("All");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {CATEGORIES.map((category) => (
        <Tag
          isSelected={picked === category}
          key={category}
          onClick={() => {
            setPicked(category);
          }}
        >
          {category}
        </Tag>
      ))}
    </div>
  );
}

/** In context: the menu category rail, one selection at a time. Wraps rather than clips at 360px. */
export const CategoryFilterRail: Story = {
  parameters: { layout: "padded" },
  render: () => <CategoryRail />,
};
