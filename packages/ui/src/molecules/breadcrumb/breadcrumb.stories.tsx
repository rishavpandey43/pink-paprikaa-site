import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect } from "storybook/test";

import { OnSurfaces } from "../../lib/story-surfaces";
import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  args: {
    items: [{ label: "Home", href: "#" }, { label: "Menu", href: "#" }, { label: "Small Plates" }],
  },
  parameters: {
    docs: {
      description: {
        component:
          'Path trail for website sub-pages (menu category, outlet, careers). Not used in the app. Chevron separators, muted links, current page in heading ink at 500 weight (`aria-current="page"`, never a link). Wraps, never clips. `linkAs` renders each crumb with the app\'s router link. On a pink or ink field it follows the surface — no `tone` prop.',
      },
    },
  },
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "3 levels". */
export const Playground: Story = {};

/** Card row "2 levels". */
export const TwoLevels: Story = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Outlets" }] },
};

/** Card row "long" — wraps, never clips. */
export const Long: Story = {
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Company", href: "#" },
      { label: "Franchise", href: "#" },
      { label: "Apply for a 2027 city" },
    ],
  },
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    await expect(window.innerWidth).toBe(360);
    await expect(canvas.getByRole("navigation").scrollWidth).toBeLessThanOrEqual(
      canvas.getByRole("navigation").clientWidth
    );
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  },
};

/** Dev parity: a grouping level with no page of its own stays plain text. */
export const UnlinkedLevel: Story = {
  args: { items: [{ label: "Home", href: "#" }, { label: "Company" }, { label: "Press" }] },
};

export const OnSurfacesStory: Story = {
  name: "OnSurfaces",
  render: (args) => (
    <OnSurfaces>
      {/* One landmark per ground, so each needs its own name (axe landmark-unique). */}
      {(ground) => <Breadcrumb {...args} aria-label={`Breadcrumb on ${ground}`} />}
    </OnSurfaces>
  ),
};
