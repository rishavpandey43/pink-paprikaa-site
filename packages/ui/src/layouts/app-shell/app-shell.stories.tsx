import type { Meta, StoryObj } from "@storybook/react-vite";

import { House, Plus, ShoppingBag, User, Utensils } from "lucide-react";
import { useState } from "react";

import { Button } from "../../atoms/button/button";
import { IconButton } from "../../atoms/icon-button/icon-button";
import { Logo } from "../../atoms/logo/logo";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Text } from "../../atoms/text/text";
import { FilterBar } from "../../molecules/filter-bar/filter-bar";
import { LoyaltyCard } from "../../molecules/loyalty-card/loyalty-card";
import { MenuItemRow } from "../../molecules/menu-item-row/menu-item-row";
import { Dialog } from "../../organisms/dialog/dialog";
import { TabBar, type TabBarItem } from "../../organisms/tab-bar/tab-bar";
import { Cluster } from "../cluster/cluster";
import { Stack } from "../stack/stack";
import { AppShell } from "./app-shell";

const TABS: TabBarItem[] = [
  { value: "home", label: "Home", icon: House, href: "#home" },
  { value: "menu", label: "Menu", icon: Utensils, href: "#menu" },
  { value: "cart", label: "Cart", icon: ShoppingBag, href: "#cart", count: 2 },
  { value: "you", label: "You", icon: User, href: "#you" },
];

const CATEGORIES = ["All", "Small Plates", "All Day", "Sweets"].map((label) => ({
  value: label,
  label,
}));

function AppTabBar({ current, label }: { current: string; label?: string | undefined }) {
  return <TabBar items={TABS} value={current} label={label} />;
}

/** The app's menu screen, as on the card: filters, the loyalty card, dish rows. */
function MenuScreen() {
  return (
    <Stack space={4} className="px-5 pt-2 pb-5">
      <Text as="h1" variant="h3">
        Menu
      </Text>
      <FilterBar label="Menu category" options={CATEGORIES} />
      <LoyaltyCard visits={6} goal={10} reward="chai" />
      <div>
        <MenuItemRow
          name="Paprikaa Chilli Paneer"
          description="Amritsari paneer, burnt chilli chutney, spring onion."
          price={280}
          spice={3}
          hasDivider
          headingLevel={2}
          action={
            <IconButton
              icon={Plus}
              label="Add Paprikaa Chilli Paneer"
              variant="primary"
              size="sm"
            />
          }
        />
        <MenuItemRow
          name="Masala Cold Brew"
          description="Cold brew, jaggery, cardamom."
          price={220}
          spice={1}
          headingLevel={2}
          action={
            <IconButton icon={Plus} label="Add Masala Cold Brew" variant="primary" size="sm" />
          }
        />
      </div>
    </Stack>
  );
}

/** The pink-header home screen that `statusTone="light"` is for. */
function DemoHomeScreen() {
  return (
    <PatternField tone="brand" className="px-5 pt-1 pb-6">
      <Stack space={4}>
        <Logo tone="white" className="w-24" />
        <Text as="h1" variant="h2">
          Chai first, decisions later.
        </Text>
        <Text variant="body-sm" tone="muted">
          Sector 57 · pickup
        </Text>
      </Stack>
    </PatternField>
  );
}

/** The card's "with overlay sheet" frame: the real Dialog sheet, portalled into the phone. */
function SheetInFrame() {
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  return (
    <AppShell ref={setFrame} statusTone="ink" tabBar={<AppTabBar current="menu" />}>
      <MenuScreen />
      {frame === null ? null : (
        <Dialog
          defaultOpen
          variant="sheet"
          title="Remove this item?"
          portalContainer={frame}
          footer={
            <>
              <Button variant="ghost" size="sm">
                Keep It
              </Button>
              <Button size="sm">Remove</Button>
            </>
          }
        >
          Chilli Paneer will come off your order.
        </Dialog>
      )}
    </AppShell>
  );
}

const meta = {
  title: "Layouts/AppShell",
  component: AppShell,
  args: {
    statusTone: "ink",
    time: "9:41",
    size: "phone",
    tabBar: <AppTabBar current="menu" />,
    children: <MenuScreen />,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Wraps every app screen so sheets and toasts position correctly: the frame is position: relative and contains fixed-position children, which is what overlays anchor to. The `overlay` slot renders inside the frame, and the frame element (take it with `ref`) is the portal container — Dialog\'s `portalContainer`, or the ToastProvider viewport. `children` is the scrolling screen body — keep at least one control in it so keyboard users can reach, and so scroll, it. Set `statusTone="light"` whenever the screen opens on a pink header; the status row floods brand to meet it. The tab bar is TabBar, the sheet is Dialog (`variant="sheet"`, portalled into the frame), the screen uses FilterBar, LoyaltyCard and MenuItemRow.',
      },
    },
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const WithTabBar: Story = { name: "with tabBar" };

export const WithOverlaySheet: Story = {
  name: "with overlay sheet",
  render: () => <SheetInFrame />,
  parameters: {
    // Story `rules` replace the preview list: keep token contrast off, as Dialog does.
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: false },
          { id: "aria-hidden-focus", enabled: false },
        ],
      },
    },
  },
};

export const StatusTones: Story = {
  name: "statusTone",
  render: () => (
    <Cluster space={6} align="start">
      <AppShell statusTone="ink" tabBar={<AppTabBar current="menu" label="Primary, ink status" />}>
        <MenuScreen />
      </AppShell>
      <AppShell
        statusTone="light"
        tabBar={<AppTabBar current="home" label="Primary, light status" />}
      >
        <DemoHomeScreen />
      </AppShell>
    </Cluster>
  ),
};

export const PhoneSm: Story = {
  name: 'size="phone-sm" · 360×780',
  args: { size: "phone-sm" },
};

/** Both frames side by side: 390×844 and the 360×780 floor (dev parity). */
export const Sizes: Story = {
  name: "size — phone and phone-sm",
  render: () => (
    <Cluster space={6} align="start">
      {(["phone", "phone-sm"] as const).map((size) => (
        <AppShell
          key={size}
          size={size}
          tabBar={<AppTabBar current="menu" label={`Primary, ${size}`} />}
        >
          <MenuScreen />
        </AppShell>
      ))}
    </Cluster>
  ),
};
