import type { Meta, StoryObj } from "@storybook/react-vite";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Steps, type StepsProps } from "./steps";

/** Home "How it works". */
const HOW_IT_WORKS = [
  { title: "Pick on the site", description: "Choose a plan or a Dawat. The price is right there." },
  {
    title: "Confirm on WhatsApp",
    description: "Your choices arrive pre-written. We reply and lock it in.",
  },
  {
    title: "We cook and deliver",
    description: "Cooked that morning in our Sector 57 kitchen, delivered to your door.",
  },
];

const meta = {
  title: "Molecules/Steps",
  component: Steps,
  args: { items: HOW_IT_WORKS },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Numbered steps as an `<ol>`. `variant="circle"` stacks steps beside a 44px pink disc (Home, Catering); `variant="rule"` lays them out in a grid under a 3px brand rule with a large "01" (Homely Meals). Semantic tokens: titles and descriptions follow the surface.',
      },
    },
  },
} satisfies Meta<typeof Steps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Both circle sections sit on the ink section. */
function renderOnInk(args: StepsProps) {
  return (
    <div data-surface="ink" className="rounded-xl bg-surface-inverse p-8">
      <Steps {...args} />
    </div>
  );
}

/** Home "How it works" — circle, on the ink section. */
export const HowItWorks: Story = { render: renderOnInk };

/** Catering "Three steps and it's done." — circle, on ink. */
export const HowToBook: Story = {
  args: {
    items: [
      {
        title: "Send us a message",
        description:
          "Date, rough headcount and the Dawat you like. A WhatsApp line is enough — or send it from the builder.",
      },
      {
        title: "We confirm within the hour",
        description:
          "Final price, delivery slot, and anything we’d change. Ask for a trial Dawat here.",
      },
      {
        title: "Pay 50% to hold the date",
        description: "Balance on delivery. Menu changes stay free up to 24 hours before.",
      },
    ],
  },
  render: renderOnInk,
};

/** Homely Meals "Starting takes one message." — rule variant. */
export const StartingTakesOneMessage: Story = {
  args: {
    variant: "rule",
    items: [
      {
        title: "WhatsApp us",
        description:
          "Your area and the plan you’re leaning toward. Or send it straight from the builder.",
      },
      {
        title: "Start with a trial",
        description: `5 meals on any days within a week. Classic ${formatRupees(650)}, Everyday ${formatRupees(600)}.`,
      },
      {
        title: "Pick your plan",
        description:
          "Weekday (24) or Full month (30). Runs from your start date. Weekdays only? Skip Saturdays free. Cancel with 7 days’ notice.",
      },
    ],
  },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      <div className="grid min-w-0 flex-1 gap-8">
        <Steps {...args} variant="circle" />
        <Steps {...args} variant="rule" />
      </div>
    </OnSurfaces>
  ),
};
