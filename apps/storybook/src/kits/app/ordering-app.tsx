import { ArrowRight, House, Plus, ShoppingBag, User, Utensils } from "lucide-react";
import { useEffect, useState } from "react";

import { brand } from "@pink-paprikaa-web/content";
import {
  AppShell,
  Button,
  type CartLine,
  CartPanel,
  cartTotals,
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
  const [step, setStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(initialScreen === "tracking");
  const [frame, setFrame] = useState<HTMLElement | null>(null);

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
  const { total } = cartTotals(lines, brand.billing.gstRate);
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
        ref={setFrame}
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
        overlay={
          <ToastProvider duration={2400} label="Notifications" isContained>
            {item === null || frame === null ? null : (
              <ItemSheet
                item={item}
                portalContainer={frame}
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
        }
      >
        {renderScreen()}
      </AppShell>
    </div>
  );
}
