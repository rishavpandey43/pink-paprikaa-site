import type { Meta, StoryObj } from "@storybook/react-vite";

import { House, ShoppingBag, User, Utensils } from "lucide-react";

import { Button } from "../../atoms/button/button";
import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { Logo } from "../../atoms/logo/logo";
import { PatternField } from "../../atoms/pattern-field/pattern-field";
import { Tag } from "../../atoms/tag/tag";
import { Text } from "../../atoms/text/text";
import { Cluster } from "../cluster/cluster";
import { Stack } from "../stack/stack";
import { AppShell } from "./app-shell";

const TABS = [
  { label: "Home", href: "#home", icon: House },
  { label: "Menu", href: "#menu", icon: Utensils },
  { label: "Cart", href: "#cart", icon: ShoppingBag },
  { label: "You", href: "#you", icon: User },
];

/**
 * Stand-in for the TabBar organism (Plan 4): four links on the 64px bar. A story that draws two
 * frames draws two `navigation` landmarks, which must differ by name, hence `label`.
 */
function DemoTabBar({
  current,
  label = "Primary",
}: {
  current: string;
  label?: string | undefined;
}) {
  return (
    <nav
      aria-label={label}
      className="grid h-tabbar flex-none grid-cols-4 border-t border-border-subtle"
    >
      {TABS.map(({ label, href, icon }) => (
        <a
          key={label}
          href={href}
          aria-current={label === current ? "page" : undefined}
          className={
            label === current
              ? "flex flex-col items-center justify-center gap-1 text-caption text-text-brand no-underline"
              : "flex flex-col items-center justify-center gap-1 text-caption text-text-muted no-underline"
          }
        >
          <Icon icon={icon} size="lg" />
          {label}
        </a>
      ))}
    </nav>
  );
}

/** Stand-in for the menu screen (FilterBar + MenuItemRow land in Plan 3b). */
function DemoMenuScreen() {
  return (
    <Stack space={4} className="px-5 pt-2 pb-5">
      <Text as="h1" variant="h3">
        Menu
      </Text>
      <Cluster isScrollable role="group" aria-label="Categories">
        {["All", "Small Plates", "All Day", "Sweets"].map((label) => (
          <Tag key={label} isSelected={label === "All"}>
            {label}
          </Tag>
        ))}
      </Cluster>
      <Card padding="md">
        <Stack space={1}>
          <Text as="h2" variant="h4">
            Paprikaa Chilli Paneer
          </Text>
          <Text variant="body-sm" tone="muted">
            Amritsari paneer, burnt chilli mayo.
          </Text>
        </Stack>
      </Card>
      <Card padding="md">
        <Stack space={1}>
          <Text as="h2" variant="h4">
            Masala Cold Brew
          </Text>
          <Text variant="body-sm" tone="muted">
            Cold brew, jaggery, cardamom.
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}

/** Stand-in for the pink-header home screen that `statusTone="light"` is for. */
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

/** Stand-in for the Dialog organism's sheet variant (Plan 4). */
function DemoSheet() {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-surface-overlay">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="remove-title"
        data-surface="light"
        className="rounded-t-xl bg-surface-card p-6 shadow-4"
      >
        <Stack space={2}>
          <Text as="h2" id="remove-title" variant="h4">
            Remove this item?
          </Text>
          <Text>Chilli Paneer will come off your order.</Text>
          <Cluster justify="end" className="pt-4">
            <Button variant="ghost" size="sm">
              Keep It
            </Button>
            <Button size="sm">Remove</Button>
          </Cluster>
        </Stack>
      </div>
    </div>
  );
}

const meta = {
  title: "Layouts/AppShell",
  component: AppShell,
  args: {
    statusTone: "ink",
    time: "9:41",
    size: "phone",
    tabBar: <DemoTabBar current="Menu" />,
    children: <DemoMenuScreen />,
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Wraps every app screen so sheets and toasts position correctly: the frame is position: relative and contains fixed-position children, which is what overlays anchor to. The `overlay` slot renders inside the frame, and the frame element (take it with `ref`) is the portal container — Dialog's `portalContainer`, or the ToastProvider viewport. `children` is the scrolling screen body — keep at least one control in it so keyboard users can reach, and so scroll, it. Set `statusTone=\"light\"` whenever the screen opens on a pink header; the status row floods brand to meet it. The tab bar, menu screen and sheet here are temporary stand-ins; Plan 4's final task replaces them with TabBar, Dialog and the Plan 3b molecules.",
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
  args: { overlay: <DemoSheet /> },
};

export const StatusTones: Story = {
  name: "statusTone",
  render: () => (
    <Cluster space={6} align="start">
      <AppShell statusTone="ink" tabBar={<DemoTabBar current="Menu" label="Primary, ink status" />}>
        <DemoMenuScreen />
      </AppShell>
      <AppShell
        statusTone="light"
        tabBar={<DemoTabBar current="Home" label="Primary, light status" />}
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
          tabBar={<DemoTabBar current="Menu" label={`Primary, ${size}`} />}
        >
          <DemoMenuScreen />
        </AppShell>
      ))}
    </Cluster>
  ),
};
