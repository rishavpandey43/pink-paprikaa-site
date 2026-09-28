### Task 11: The App kit

Sources: `ui_kits/app/{index.html,Screens.jsx,ItemSheet.jsx,README.md}`. The kit's `diet: "egg"` dish flag is gone (C10); the invented account holder ("Aditi Rao", a phone number, "12 orders since 2024") becomes a signed-out Guest; the promo's closing time comes from `brand.hours`.

**Files:**

- Create: `apps/storybook/src/kits/app/{item-sheet.tsx,app-screens.tsx,ordering-app.tsx,app.stories.tsx}`

**Dev reference:** none (dev has no reference kits). Dev's `landmark-unique` (app-shell, tab-bar) and `scrollable-region-focusable` (cluster) findings are Task 0 A21 and A10.

**Interfaces:**

- Consumes: fixtures (Task 10), `KitNotice`, `expectNoHorizontalOverflow`; ui components per the imports; `formatRupees` (utils).
- Produces: `ItemSheet`, `HomeScreen`, `AccountScreen`, `OrderingApp` (`initialScreen`, `initialItem`, `initialLines`, `size`); stories `App/Ordering app` → `Home`, `Menu`, `ItemSheetOpen` ("Item sheet"), `Cart`, `Tracking`, `Account`, `Home360`.

- [ ] **Step 1: Write the failing App stories (Review Focus 3)**

Create `apps/storybook/src/kits/app/app.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, screen, within } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { FEATURED_DISH, SAMPLE_CART } from "../fixtures";
import { KIT_NOTICE } from "../kit-notice";
import { OrderingApp } from "./ordering-app";

const meta = {
  title: "App/Ordering app",
  component: OrderingApp,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "The design system's ordering-app kit (ui_kits/app) at 390×844 inside AppShell, composed only from @pink-paprikaa-web/ui. Flow: Home → customise a dish in the sheet → Add to Order (pop toast) → Cart → Pay → tracking advances Order in → On the tandoor → Ready → Back to Home. The item sheet and the pop toast render inside the phone frame, through AppShell's overlay slot. Reference kit — not production copy.",
      },
    },
  },
} satisfies Meta<typeof OrderingApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: { initialScreen: "home" },
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `Customise ${FEATURED_DISH.name}` }));
    const sheet = await screen.findByRole("dialog", { name: FEATURED_DISH.name });
    await userEvent.click(within(sheet).getByRole("button", { name: /^Add to Order/ }));
    await expect(
      await screen.findByText(`${FEATURED_DISH.name} added to your order.`)
    ).toBeVisible();
  },
};

export const Menu: Story = { args: { initialScreen: "menu" } };

export const ItemSheetOpen: Story = {
  name: "Item sheet",
  args: { initialScreen: "menu", initialItem: FEATURED_DISH },
};

export const Cart: Story = { args: { initialScreen: "cart", initialLines: SAMPLE_CART } };

export const Tracking: Story = { args: { initialScreen: "tracking", initialLines: SAMPLE_CART } };

export const Account: Story = { args: { initialScreen: "you" } };

export const Home360: Story = {
  name: "Home at 360px",
  args: { initialScreen: "home", size: "phone-sm" },
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- app.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./ordering-app"`.

- [ ] **Step 2: The item sheet**

Create `apps/storybook/src/kits/app/item-sheet.tsx`:

```tsx
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

import {
  Badge,
  Button,
  Checkbox,
  Cluster,
  Dialog,
  DietMark,
  ImageSlot,
  type MenuListItem,
  PriceTag,
  QuantityStepper,
  Radio,
  RadioGroup,
  SpiceLevel,
  Stack,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

const HEAT = [
  { value: 1, label: "Mild" },
  { value: 2, label: "Medium" },
  { value: 3, label: "Hot" },
  { value: 4, label: "Extra Hot" },
] as const;

type Heat = (typeof HEAT)[number]["value"];

/** The kit's sharing portion: 1.6 × the regular price, rounded. */
const SHARING_MULTIPLIER = 1.6;
const MAYO_PRICE = 40;

export interface ItemSheetProps {
  item: MenuListItem;
  /** AppShell's overlay element, so the sheet opens inside the phone frame (null before mount). */
  portalContainer: HTMLElement | null;
  onClose: () => void;
  onAdd: (item: MenuListItem, unitPrice: number, quantity: number) => void;
}

/** Item detail as a bottom sheet: portion, heat, add-on, quantity and a live total. */
export function ItemSheet({ item, portalContainer, onClose, onAdd }: ItemSheetProps) {
  const [portion, setPortion] = useState<"regular" | "sharing">("regular");
  const [heat, setHeat] = useState<Heat>(item.spice ?? 2);
  const [hasMayo, setHasMayo] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const sharingPrice = Math.round(item.price * SHARING_MULTIPLIER);
  const portionPrice = portion === "sharing" ? sharingPrice : item.price;
  const unitPrice = portionPrice + (hasMayo ? MAYO_PRICE : 0);

  return (
    <Dialog
      open
      variant="sheet"
      title={item.name}
      description={item.description}
      portalContainer={portalContainer}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      footer={
        <Button
          isFullWidth
          size="lg"
          icon={ShoppingBag}
          onClick={() => {
            onAdd(item, unitPrice, quantity);
          }}
        >
          {`Add to Order · ${formatRupees(unitPrice * quantity)}`}
        </Button>
      }
    >
      <Stack space={5}>
        <ImageSlot ratio="16:10" radius="lg" label="Dish photo 16:10" />
        <Cluster space={3}>
          <DietMark />
          {item.badge === undefined ? null : <Badge tone="soft">{item.badge}</Badge>}
          <PriceTag amount={portionPrice} was={item.was} />
          <SpiceLevel level={heat} hasLabel />
        </Cluster>
        <RadioGroup legend="Portion">
          <Radio
            name="portion"
            value="regular"
            label="Regular"
            price={item.price}
            checked={portion === "regular"}
            onChange={() => {
              setPortion("regular");
            }}
          />
          <Radio
            name="portion"
            value="sharing"
            label="Sharing"
            description="Feeds two."
            price={sharingPrice}
            checked={portion === "sharing"}
            onChange={() => {
              setPortion("sharing");
            }}
          />
        </RadioGroup>
        <RadioGroup legend="How spicy?">
          {HEAT.map(({ value, label }) => (
            <Radio
              key={value}
              name="heat"
              value={String(value)}
              label={label}
              checked={heat === value}
              onChange={() => {
                setHeat(value);
              }}
            />
          ))}
        </RadioGroup>
        <Checkbox
          label="Extra burnt chilli mayo"
          price={MAYO_PRICE}
          checked={hasMayo}
          onChange={(event) => {
            setHasMayo(event.target.checked);
          }}
        />
        <QuantityStepper label="Quantity" value={quantity} min={1} onValueChange={setQuantity} />
      </Stack>
    </Dialog>
  );
}
```

- [ ] **Step 3: Home and Account screens**

Create `apps/storybook/src/kits/app/app-screens.tsx`:

```tsx
import { Bell, CreditCard, MapPin, Plus, Receipt } from "lucide-react";

import { brand } from "@pink-paprikaa-web/content";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Cluster,
  Divider,
  FilterBar,
  Icon,
  IconButton,
  ListRow,
  Logo,
  LoyaltyCard,
  MenuItemCard,
  type MenuListItem,
  PatternField,
  SearchField,
  SpiceLevel,
  Switch,
  Text,
} from "@pink-paprikaa-web/ui";

import { MENU_CATEGORIES, MENU_ITEMS, OUTLET } from "../fixtures";

const CATEGORY_OPTIONS = [
  { value: "all", label: "All" },
  ...MENU_CATEGORIES.map((category) => ({ value: category, label: category })),
];

export interface HomeScreenProps {
  onOpenItem: (item: MenuListItem) => void;
  onSeeMenu: () => void;
}

/** App home: pink header, loyalty, category rail, most-ordered rail, tonight's promo. */
export function HomeScreen({ onOpenItem, onSeeMenu }: HomeScreenProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-surface-page">
      <PatternField tone="brand" tile={56}>
        <div className="flex flex-col gap-4.5 px-5 pt-1 pb-6.5">
          <div className="flex items-center justify-between">
            <Logo variant="wordmark" tone="white" className="w-35" />
            <IconButton icon={Bell} label="Notifications" variant="ghost" />
          </div>
          <Text variant="h2" as="p">
            Chai first,
            <br />
            decisions later.
          </Text>
          <span className="flex items-center gap-2">
            <Icon icon={MapPin} size="sm" />
            <Text variant="body-sm" tone="muted" as="span">
              {`${OUTLET.name} · pickup`}
            </Text>
          </span>
          <SearchField label="Search the menu" placeholder="Search chai, paneer, kulfi…" />
        </div>
      </PatternField>

      <div className="px-5 pt-5">
        <LoyaltyCard visits={3} goal={6} reward="chai" />
      </div>

      <div className="pt-5.5 pl-5">
        <FilterBar
          label="Menu categories"
          options={CATEGORY_OPTIONS}
          defaultValue="all"
          onValueChange={onSeeMenu}
        />
      </div>

      <div className="flex items-baseline justify-between px-5 pt-5.5">
        <Text variant="h4" as="h2">
          Most ordered
        </Text>
        <Button variant="ghost" size="sm" onClick={onSeeMenu}>
          See all
        </Button>
      </div>
      <Cluster
        isScrollable
        isNowrap
        space={3}
        aria-label="Most ordered dishes"
        className="px-5 pt-3.5 pb-1"
      >
        {MENU_ITEMS.slice(0, 3).map(({ id, category: _category, ...dish }) => (
          <MenuItemCard
            key={id}
            {...dish}
            className="w-54 shrink-0"
            action={
              <IconButton
                icon={Plus}
                label={`Customise ${dish.name}`}
                size="sm"
                onClick={() => {
                  const item = MENU_ITEMS.find((candidate) => candidate.id === id);
                  if (item !== undefined) onOpenItem(item);
                }}
              />
            }
          />
        ))}
      </Cluster>

      <div className="px-5 pt-6 pb-7">
        <Card variant="ink" padding="none" className="overflow-hidden">
          <PatternField tone="ink" tile={56} className="flex flex-col gap-2.5 p-5">
            <Badge tone="brand" className="self-start">
              Tonight Only
            </Badge>
            <Text variant="h4" weight="black" as="p">
              Extra Hot Fries, half price
            </Text>
            <span className="flex items-center gap-2.5">
              <SpiceLevel level={4} />
              <Text variant="caption" tone="muted" as="span">
                {brand.hours.weekday}
              </Text>
            </span>
            <Button size="sm" className="mt-1.5 self-start" onClick={onSeeMenu}>
              Add to Order
            </Button>
          </PatternField>
        </Card>
      </div>
    </div>
  );
}

/** Account: a signed-out guest, loyalty, settings rows and two switches. */
export function AccountScreen() {
  return (
    <div className="flex flex-1 flex-col gap-1 overflow-y-auto px-5 pt-1 pb-5">
      <div className="flex items-center gap-3.5 pt-2 pb-5">
        <Avatar name="Guest" size="lg" hasRing />
        <div className="flex flex-col">
          <Text variant="h4" as="p">
            Guest
          </Text>
          <Text variant="body-sm" tone="muted" as="span">
            Sign in with your mobile number
          </Text>
        </div>
      </div>
      <LoyaltyCard visits={3} goal={6} reward="chai" />
      <Divider variant="diamond" className="my-5" />
      <ListRow icon={MapPin} title="Default outlet" value={OUTLET.name} />
      <ListRow icon={Receipt} title="Order history" description="Your past orders" />
      <ListRow icon={CreditCard} title="Payment methods" value="UPI" />
      <Switch
        label="Order updates"
        description="A message when your order is ready."
        defaultChecked
      />
      <Switch label="Jain preferences" description="Hides onion and garlic." />
      <Button variant="secondary" isFullWidth className="mt-4">
        Sign out
      </Button>
    </div>
  );
}
```

(The kit's settings rows were buttons with chevrons wired to nothing; here they are informational rows without chevrons, so nothing looks tappable that is not. Recorded as a parity difference.)

- [ ] **Step 4: The ordering app**

Create `apps/storybook/src/kits/app/ordering-app.tsx`:

```tsx
import { ArrowRight, House, Plus, ShoppingBag, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";

import { brand } from "@pink-paprikaa-web/content";
import {
  AppShell,
  Button,
  type CartLine,
  CartPanel,
  IconButton,
  MenuList,
  type MenuListItem,
  OrderTracker,
  TabBar,
  Toast,
  ToastProvider,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

import { MENU_CATEGORIES, MENU_ITEMS, ORDER_STEPS, OUTLET } from "../fixtures";
import { KitNotice } from "../kit-notice";
import { AccountScreen, HomeScreen } from "./app-screens";
import { ItemSheet } from "./item-sheet";

const TAB_SCREENS = ["home", "menu", "cart", "you"] as const;
export type AppScreen = (typeof TAB_SCREENS)[number] | "tracking";

/** The kit's demo pacing between tracking steps. */
const STEP_INTERVAL_MS = 2600;

export interface OrderingAppProps {
  initialScreen?: AppScreen | undefined;
  /** Open the item sheet for this dish on first render. */
  initialItem?: MenuListItem | undefined;
  initialLines?: CartLine[] | undefined;
  size?: "phone" | "phone-sm" | undefined;
}

/** The design system's pickup-ordering app (ui_kits/app) at phone size, composed from the library. */
export function OrderingApp({
  initialScreen = "home",
  initialItem,
  initialLines = [],
  size = "phone",
}: OrderingAppProps) {
  const [screen, setScreen] = useState<AppScreen>(initialScreen);
  const [item, setItem] = useState<MenuListItem | null>(initialItem ?? null);
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const [toast, setToast] = useState<string | null>(null);
  const [step, setStep] = useState(initialScreen === "tracking" ? 1 : 0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isAdvancing || step >= ORDER_STEPS.length - 1) return undefined;
    const timer = setTimeout(() => {
      setStep((current) => current + 1);
    }, STEP_INTERVAL_MS);
    return () => {
      clearTimeout(timer);
    };
  }, [isAdvancing, step]);

  const itemCount = lines.reduce((count, line) => count + line.quantity, 0);
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + Math.round(subtotal * brand.billing.gstRate);
  const isTracking = screen === "tracking";

  function addToOrder(dish: MenuListItem, unitPrice: number, quantity: number) {
    setLines((current) =>
      current.some((line) => line.id === dish.id)
        ? current.map((line) =>
            line.id === dish.id ? { ...line, quantity: line.quantity + quantity } : line
          )
        : [...current, { id: dish.id, name: dish.name, price: unitPrice, quantity }]
    );
    setItem(null);
    setToast(`${dish.name} added to your order.`);
  }

  function changeQuantity(id: string, quantity: number) {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.id !== id)
        : current.map((line) => (line.id === id ? { ...line, quantity } : line))
    );
  }

  function placeOrder() {
    setStep(0);
    setIsAdvancing(true);
    setScreen("tracking");
  }

  function finishOrder() {
    setIsAdvancing(false);
    setLines([]);
    setScreen("home");
  }

  function showMenu() {
    setScreen("menu");
  }

  function renderScreen() {
    switch (screen) {
      case "home":
        return <HomeScreen onOpenItem={setItem} onSeeMenu={showMenu} />;
      case "menu":
        return (
          <MenuList
            items={MENU_ITEMS}
            categories={MENU_CATEGORIES}
            variant="list"
            title={null}
            className="flex-1 overflow-y-auto px-5 pb-5"
            renderItemAction={(dish) => (
              <IconButton
                icon={Plus}
                label={`Customise ${dish.name}`}
                size="sm"
                onClick={() => {
                  setItem(dish);
                }}
              />
            )}
          />
        );
      case "cart":
        return (
          <CartPanel
            lines={lines}
            title="Your order"
            meta={`Pickup · ${OUTLET.name}`}
            gstRate={brand.billing.gstRate}
            onQuantityChange={changeQuantity}
            placeAction={
              <Button isFullWidth size="lg" iconAfter={ArrowRight} onClick={placeOrder}>
                {`Pay ${formatRupees(total)}`}
              </Button>
            }
            browseAction={<Button onClick={showMenu}>Browse the Menu</Button>}
          />
        );
      case "you":
        return <AccountScreen />;
      case "tracking":
        return (
          <OrderTracker
            steps={ORDER_STEPS}
            current={step}
            code={`${brand.billing.invoicePrefix}-4821`}
            outlet={`${OUTLET.name}, ${OUTLET.city}`}
            total={total}
            payment="UPI"
            variant="flush"
            action={
              <Button variant="secondary" isFullWidth onClick={finishOrder}>
                Back to Home
              </Button>
            }
          />
        );
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <KitNotice source="ui_kits/app" />
      <AppShell
        size={size}
        statusTone={screen === "home" || isTracking ? "light" : "ink"}
        tabBar={
          isTracking ? undefined : (
            <TabBar
              label="Primary"
              value={screen}
              onValueChange={(value) => {
                const next = TAB_SCREENS.find((tab) => tab === value);
                if (next !== undefined) setScreen(next);
              }}
              items={[
                { value: "home", label: "Home", icon: House },
                { value: "menu", label: "Menu", icon: Utensils },
                {
                  value: "cart",
                  label: "Cart",
                  icon: ShoppingBag,
                  count: itemCount > 0 ? itemCount : undefined,
                },
                { value: "you", label: "You", icon: User },
              ]}
            />
          )
        }
        overlay={<div ref={setOverlayRoot} className="contents" />}
      >
        {renderScreen()}
      </AppShell>
      <ToastProvider duration={2400} label="Notifications" isContained>
        {item === null ? null : (
          <ItemSheet
            item={item}
            portalContainer={overlayRoot}
            onClose={() => {
              setItem(null);
            }}
            onAdd={addToOrder}
          />
        )}
        <Toast
          open={toast !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setToast(null);
          }}
          tone="brand"
          icon={ShoppingBag}
          isPop
          portalContainer={overlayRoot}
          action={{
            label: "View Cart",
            altText: "View your order",
            onClick: () => {
              setToast(null);
              setScreen("cart");
            },
          }}
        >
          {toast ?? ""}
        </Toast>
      </ToastProvider>
    </div>
  );
}
```

**Overlay wiring is Task 0's A13/A14 answer, not a guess to keep:** Plan 4's `Dialog` takes `portalContainer` and Plan 3a's `ToastProvider` has a contained viewport, so the sheet and the toast render inside `AppShell`'s `overlay` slot. This file assumes the prop names `portalContainer` (Dialog, and forwarded by `ItemSheet`) and `isContained` (ToastProvider), and that the contained viewport portals into the same `portalContainer` given to `Toast`. Replace each with the built API recorded in Task 0 — if the toast viewport is contained by rendering `ToastProvider` itself inside `overlay`, move the provider into the `overlay` element instead and drop `portalContainer` from `Toast`.

`ItemSheet` forwards `portalContainer` to `Dialog` (Step 2); if Task 0 recorded a different prop name, rename it in both files.

- [ ] **Step 5: Run to green, probe, gate and commit**

Run the Step 1 command → PASS (7 stories). Probe (Review Focus 3): render `Home360` with `size: "phone"` (390px) instead of `"phone-sm"`; expect FAIL `the page is 3…px wide at a 360px viewport`; revert. Paste both. (If A9 recorded that `phone-sm` is wider than 360px, `Home360` renders `<HomeScreen>` without `AppShell` — patch this story in Task 0 and say so.)

Compare with the source kit (`/ui_kits/app/index.html` on the Task 10 `serve`) at 1280; list differences with reasons.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- app.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/kits/app
git commit -m "feat(storybook): the App reference kit

The design system's ordering app at phone size: home, menu, item sheet, cart,
tracking and account, with the sheet and pop toast inside the phone frame.
The egg flag and the invented account holder are gone; closing time and the
outlet come from the brand facts. Tested at the 360px floor.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

