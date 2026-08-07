import type { Meta, StoryObj } from "@storybook/react-vite";

import { PinkPaprikaaWebUi } from "./ui";

const meta = {
  component: PinkPaprikaaWebUi,
  title: "PinkPaprikaaWebUi",
} satisfies Meta<typeof PinkPaprikaaWebUi>;
export default meta;

type Story = StoryObj<typeof PinkPaprikaaWebUi>;

export const Primary = {
  args: {},
} satisfies Story;
