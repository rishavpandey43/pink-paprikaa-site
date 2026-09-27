import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, within } from "storybook/test";

import { Card } from "./card";

function Inner({ title, detail }: { title: string; detail: string }) {
  return (
    <>
      <h4 className="m-0">{title}</h4>
      <p className="mt-1.5 mb-0 font-body text-caption text-text-subtle">{detail}</p>
    </>
  );
}

const meta = {
  title: "Atoms/Card",
  component: Card,
  args: {
    variant: "default",
    padding: "md",
    className: "w-50",
    children: <Inner title="Sector 57" detail="8am – 11:30pm" />,
  },
  parameters: {
    docs: {
      description: {
        component:
          'The surface every block of content sits on. `default` white + 1px subtle border + shadow-1; `feature` light pink, 24px radius, no shadow; `brand` flooded pink; `ink` dark, footer-style; `quiet` sunken grey. Each sets `data-surface`, so content inside follows its field — a white card inside a pink section is a light island, with no colour props. Use `padding="none"` when the card starts with an image; `isInteractive` adds the −2px hover lift; `asChild` makes the whole card a link. No card ever has a coloured left border.',
      },
    },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Default: Story = {
  name: 'variant="default" · isInteractive',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card className="w-50">
        <Inner title="Sector 57" detail="8am – 11:30pm" />
      </Card>
      <Card isInteractive className="w-50">
        <Inner title="isInteractive" detail="hovers −2px to shadow-3" />
      </Card>
    </div>
  ),
};

export const FeatureQuiet: Story = {
  name: 'variant="feature" · "quiet"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card variant="feature" className="w-50">
        <Inner title="feature" detail="no border, no shadow" />
      </Card>
      <Card variant="quiet" className="w-50">
        <Inner title="quiet" detail="ink-100" />
      </Card>
    </div>
  ),
};

export const BrandInk: Story = {
  name: 'variant="brand" · "ink"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      <Card variant="brand" className="w-50">
        <Inner title="brand" detail="flooded pink" />
      </Card>
      <Card variant="ink" className="w-50">
        <Inner title="ink" detail="footer surfaces" />
      </Card>
    </div>
  ),
};

export const PaddingNone: Story = {
  name: 'padding="none"',
  render: () => (
    <Card padding="none" className="w-50">
      <div className="h-14 bg-surface-brand-soft" />
      <div className="p-3.5">
        <Inner title="media" detail="image sits flush" />
      </div>
    </Card>
  ),
};

export const Paddings: Story = {
  name: 'padding="sm" · "md" · "lg"',
  render: () => (
    <div className="flex flex-wrap items-start gap-3">
      {(["sm", "md", "lg"] as const).map((padding) => (
        <Card key={padding} padding={padding} className="w-50">
          <Inner title={`padding ${padding}`} detail="16 / 20 / 28px" />
        </Card>
      ))}
    </div>
  ),
};

export const AsChild: Story = {
  name: "asChild (a link)",
  render: () => (
    <Card asChild isInteractive className="w-50">
      <a href="/outlets/sector-57">
        <Inner title="Sector 57" detail="Booth No. 67P, MKM Market" />
      </a>
    </Card>
  ),
};

/** The other interactive pattern: the lift is styling only, and the real link inside owns the click. */
export const InteractiveWithLink: Story = {
  name: "isInteractive with a nested link",
  render: () => (
    <Card isInteractive className="w-60">
      <h4 className="m-0">
        <a href="/menu">See Full Menu</a>
      </h4>
      <p className="mt-1.5 mb-0 font-body text-caption text-text-subtle">
        Momos, chaat and North Indian plates · ₹180–₹320
      </p>
    </Card>
  ),
};

export const LightIsland: Story = {
  name: "light island inside a brand field",
  render: () => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-6">
      <Card className="w-60">
        <h4 className="m-0">Sector 57</h4>
        <p data-testid="island-copy" className="m-0 font-body text-caption">
          8am – 11:30pm
        </p>
      </Card>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const copy = within(canvasElement).getByTestId("island-copy");
    const card = copy.parentElement;
    await expect(getComputedStyle(copy).color).toBe("rgb(43, 31, 37)");
    await expect(card === null ? "" : getComputedStyle(card).backgroundColor).toBe(
      "rgb(255, 255, 255)"
    );
  },
};

/** A non-light surface nested in another resolves to the base values plus its own overrides. */
export const SoftInsideBrand: Story = {
  name: "soft card inside a brand field",
  render: () => (
    <div className="grid gap-3">
      <div data-surface="brand" className="rounded-xl bg-surface-brand p-6">
        <Card variant="feature" className="w-60">
          <p data-testid="nested-copy" className="m-0 font-body text-caption">
            8am – 11:30pm
          </p>
          <span data-testid="nested-focus" className="text-focus">
            focus
          </span>
        </Card>
      </div>
      <div data-surface="light" className="p-6">
        <p data-testid="base-copy" className="m-0 font-body text-caption">
          8am – 11:30pm
        </p>
        <span data-testid="base-focus" className="text-focus">
          focus
        </span>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const color = (id: string) => getComputedStyle(canvas.getByTestId(id)).color;
    await expect(color("nested-copy")).toBe(color("base-copy"));
    await expect(color("nested-focus")).toBe(color("base-focus"));
    await expect(color("nested-copy")).not.toBe("rgb(255, 255, 255)");
  },
};
