import type { Meta, StoryObj } from "@storybook/react-vite";

import { Pencil, Undo2 } from "lucide-react";
import { expect } from "storybook/test";

import {
  StatesRow,
  type StoryForceState,
  storyStateControlProps,
  storyStatesPseudo,
} from "../../lib/story-states";
import { OnSurfaces } from "../../lib/story-surfaces";
import { TextButton } from "./text-button";

const TEXT_BUTTON_STATES = [
  "rest",
  "hover",
  "press",
  "focus",
  "disabled",
] as const satisfies readonly StoryForceState[];

const meta = {
  title: "Atoms/TextButton",
  component: TextButton,
  args: { children: "Undo", color: "brand", size: "md" },
  parameters: {
    docs: {
      description: {
        component:
          "Text-only action for toast/snackbar CTAs, Undo, Edit, View all. Looks like a word at rest; tinted pill on hover. Surface-aware via `data-surface` (never an `on` prop). `isCaps` for toast actions.",
      },
    },
  },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const States: Story = {
  parameters: { pseudo: storyStatesPseudo(TEXT_BUTTON_STATES) },
  render: () => (
    <StatesRow
      states={TEXT_BUTTON_STATES}
      render={(state) => <TextButton {...storyStateControlProps(state)}>Undo</TextButton>}
    />
  ),
  play: async ({ canvasElement }) => {
    const hover = canvasElement.querySelector("#cell-hover button");
    if (!(hover instanceof HTMLElement)) {
      throw new Error("TextButton States: #cell-hover button missing");
    }
    await expect(hover).toHaveClass("hover:bg-state-hover");
  },
};

export const Colors: Story = {
  name: "color",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <TextButton color="brand">Brand</TextButton>
      <TextButton color="neutral">Neutral</TextButton>
      <TextButton color="danger">Danger</TextButton>
    </div>
  ),
};

export const Caps: Story = {
  name: "isCaps",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <TextButton isCaps>Dismiss</TextButton>
      <TextButton isCaps color="danger">
        Delete
      </TextButton>
    </div>
  ),
};

export const WithIcons: Story = {
  name: "icon",
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <TextButton icon={Undo2}>Undo</TextButton>
      <TextButton iconAfter={Pencil}>Edit</TextButton>
    </div>
  ),
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: () => (
    <OnSurfaces>
      <TextButton>Undo</TextButton>
    </OnSurfaces>
  ),
};
