import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";

function Screen() {
  return (
    <div className="px-5 pb-5">
      <h2 className="mt-2 mb-4 font-display text-h3 font-bold text-text-heading">Menu</h2>
      <ul className="m-0 grid list-none gap-3 p-0">
        {[
          ["Paprikaa Chilli Paneer", "₹280"],
          ["Tandoori Momos", "₹220"],
          ["Amritsari Chole Kulcha", "₹240"],
          ["Masala Cold Brew", "₹180"],
        ].map(([name, price]) => (
          <li className="rounded-3 bg-surface-sunken p-3" key={name}>
            <span className="font-display text-body1 font-medium text-text-heading">{name}</span>
            <span className="float-right font-display text-body1 font-bold text-text-brand">
              {price}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * A stand-in for the real `TabBar`, which a template may not import. `label` exists for the same
 * reason the real one's does: a story that draws three artboards draws three `navigation`
 * landmarks, and landmarks are told apart by role *and* accessible name.
 *
 * It paints its own `surface-card` ground, exactly as the real bar does. Chrome that inherits
 * whatever the frame happens to be floods its 12.5px labels onto an unknown colour.
 */
function TabBar({ label = "Primary" }: { label?: string }) {
  return (
    <nav
      aria-label={label}
      className="flex h-(--layout-tabbar-h) shrink-0 items-center justify-around border-t border-border-subtle bg-surface-card"
    >
      {["Home", "Menu", "Cart", "You"].map((item) => (
        <span className="font-display text-caption font-medium text-text-muted" key={item}>
          {item}
        </span>
      ))}
    </nav>
  );
}

function Sheet() {
  return (
    <div className="absolute inset-x-0 bottom-0 rounded-t-5 bg-surface-card p-5 shadow-elevation4">
      <p className="m-0 font-display text-subtitle1 font-bold text-text-heading">
        Remove this item?
      </p>
      <p className="mt-2 mb-0 font-body text-body2 text-text-muted">
        Paprikaa Chilli Paneer will come off your order.
      </p>
    </div>
  );
}

const meta = {
  title: "Templates/AppShell",
  component: AppShell,
  args: { children: <Screen /> },
  argTypes: { overlay: { control: false }, tabBar: { control: false } },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The phone artboard every app screen is designed inside. The frame is `position: " +
          "relative`, which is what sheets and toasts anchor to, and its status bar and home " +
          "indicator are simulated chrome hidden from assistive tech.",
      },
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTabBar: Story = {
  args: { tabBar: <TabBar /> },
};

/** The sheet renders after the tab bar, so it covers it — which is what the overlay slot is for. */
export const WithOverlay: Story = {
  args: { overlay: <Sheet />, tabBar: <TabBar /> },
};

/**
 * Flip the chrome to `light` the moment the screen opens on a flooded ground — and note *which*
 * flooded ground carries it.
 *
 * The simulated clock is 12.5px and the home indicator is a hairline, so the frame they sit on has
 * to be one white reads on at small sizes: `surface-inverse`, where white measures 18.39:1. The
 * brand pink is 4.04:1, which is an AA pass for large text only, so it floods the screen's own
 * header block instead and carries nothing under 20px bold — here the 32px `h2`, and an eyebrow
 * promoted to the 20px `subtitle1` step so it clears the large-text bar rather than sitting on
 * pink at 11.5px.
 */
export const OnBrand: Story = {
  globals: { backgrounds: { value: "brand" } },
  args: {
    className: "bg-surface-inverse",
    tone: "light",
    tabBar: <TabBar />,
    children: (
      <div className="bg-surface-brand px-5 pt-3 pb-6">
        <p className="m-0 font-display text-subtitle1 font-bold tracking-overline text-text-on-brand uppercase">
          Sector 57
        </p>
        <h2 className="mt-2 mb-0 font-display text-h2 font-bold text-text-on-brand">
          Chai first, decisions later.
        </h2>
      </div>
    ),
  },
};

/** 375 · 390 · 430 — the three phone artboards, plus a fluid frame for a real viewport. */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <AppShell key={size} size={size} tabBar={<TabBar label={`Primary, ${size} artboard`} />}>
          <Screen />
        </AppShell>
      ))}
    </div>
  ),
};
