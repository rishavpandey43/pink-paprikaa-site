### Task 7: AppShell

**Files:**

- Create: `packages/design-tokens/tokens/component/app-shell.json`, `packages/ui/src/layouts/app-shell/{app-shell.tsx,app-shell.test.tsx,app-shell.stories.tsx}`
- Modify: `packages/ui/src/lib/component-variants.ts`, `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/templates/app-shell/app-shell.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                            | Ruling  | Where / clause                                                                            |
| ----------------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------- |
| `relative overflow-hidden` frame that overlays anchor to                            | ALREADY | Step 2 first test (+ `contain-layout`, `ref`)                                             |
| `tabBar` and `overlay` slots; overlay after the tab bar                             | ALREADY | Step 2 ordering test                                                                      |
| `time` clock (default `9:41`) on the status bar                                     | ALREADY | Step 2                                                                                    |
| Status bar and home indicator hidden from assistive tech                            | ALREADY | Step 2 ordering + clock tests                                                             |
| `tone` ink/light flips the chrome text                                              | ALREADY | `statusTone` (contracts §4); light floods the row brand (resolution 7)                    |
| Sizes `sm` 375×812, `lg` 430×932                                                    | DROP    | Contracts §4 `size: "phone" \| "phone-sm"`; the 360×780 floor replaces the small artboard |
| Size `fluid` (fills its parent, capped at 430px)                                    | PENDING | Proposed contract delta 2 in `02c-audit.md`. Implement only if the controller accepts it  |
| Arbitrary `rounded-[44px]`, `h-[844px]`, `shadow-elevation4`                        | ALREADY | Component tokens (Step 1); D4 (old shadow name)                                           |
| Test: caller className replaces the radius and shadow                               | ADD     | Step 2 className test                                                                     |
| Test: axe on the light status tone with a tab bar                                   | ADD     | Step 2 "most complex state" axe test                                                      |
| Story `Default`, `WithTabBar`, `WithOverlay`, `OnBrand`                             | ALREADY | `Playground`, `WithTabBar`, `WithOverlaySheet`, `StatusTones`                             |
| Story `Sizes` (frames side by side)                                                 | ADD     | Step 6 `Sizes`                                                                            |
| Stand-in TabBar takes a `label`, so several frames never repeat a `navigation` name | ADD     | Step 6 `DemoTabBar` `label`, used by `StatusTones` and `Sizes`                            |
| Only large text on a brand header (the 4.04:1 note)                                 | DROP    | Spec §5.1: white on brand is the declared 3:1 exception                                   |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon` (Plan 1); `--shadow-4`, `--radius-pill`, `--color-ink-300` and the surfaces (Plan 1); in stories, `Stack` and `Cluster` (Tasks 3–4) plus `Text`, `Card`, `Tag`, `Button`, `PatternField` and `Logo`.
- Produces: `AppShell`, `type AppShellProps`, and component tokens:
  - spacing: `--spacing-app-shell-{w,h,sm-w,sm-h,status-x,home,home-bar-w,home-bar-h}`;
  - radius: `--radius-app-shell`;
  - text: `--text-app-shell-status`.
- Produces for Plans 3a/4: the frame root is the portal container for overlays. It is `position: relative`, and callers reach the element through `ref`. The `overlay` slot renders inside it; pass the ref's element to Dialog's `portalContainer`, or place the ToastProvider viewport in `overlay`.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/app-shell.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "app-shell-w": { "$value": "390px", "$description": "AppShell size=\"phone\" width." },
    "app-shell-h": { "$value": "844px", "$description": "AppShell size=\"phone\" height." },
    "app-shell-sm-w": {
      "$value": "360px",
      "$description": "AppShell size=\"phone-sm\": the system's 360px floor."
    },
    "app-shell-sm-h": { "$value": "780px", "$description": "AppShell size=\"phone-sm\" height." },
    "app-shell-status-x": { "$value": "22px", "$description": "Status bar side inset." },
    "app-shell-home": { "$value": "22px", "$description": "Home-indicator strip height." },
    "app-shell-home-bar-w": { "$value": "130px", "$description": "Home-indicator bar width." },
    "app-shell-home-bar-h": { "$value": "5px", "$description": "Home-indicator bar height." }
  },
  "radius": {
    "$type": "dimension",
    "app-shell": { "$value": "44px", "$description": "Phone frame corner." }
  },
  "text": {
    "$type": "typography",
    "app-shell-status": {
      "$value": { "fontSize": "13px", "lineHeight": 1, "fontWeight": "{font-weight.semibold}" },
      "$description": "Status-bar clock."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, add to `SPACING`:

```ts
  "app-shell-w",
  "app-shell-h",
  "app-shell-sm-w",
  "app-shell-sm-h",
  "app-shell-status-x",
  "app-shell-home",
  "app-shell-home-bar-w",
  "app-shell-home-bar-h",
```

add `"app-shell"` to `RADIUS`, and add `"app-shell-status"` to `TEXT`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/layouts/app-shell/app-shell.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { createRef } from "react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { AppShell } from "./app-shell";

function statusRow(): HTMLElement | null {
  return screen.getByText("9:41").parentElement;
}

describe("AppShell", () => {
  it("frames the screen at 390×844 as a light surface that anchors its overlays", () => {
    render(<AppShell data-testid="shell" />);
    const shell = screen.getByTestId("shell");
    expect(shell).toHaveAttribute("data-surface", "light");
    expect(shell).toHaveClass(
      "relative",
      "overflow-hidden",
      "contain-layout",
      "w-app-shell-w",
      "h-app-shell-h",
      "rounded-app-shell",
      "bg-surface-page",
      "shadow-4"
    );
  });

  it("offers the 360×780 phone, the system's smallest screen", () => {
    render(<AppShell size="phone-sm" data-testid="shell" />);
    expect(screen.getByTestId("shell")).toHaveClass("w-app-shell-sm-w", "h-app-shell-sm-h");
  });

  it("orders status bar, scrolling body, tab bar, home indicator, then the overlay", () => {
    render(
      <AppShell
        data-testid="shell"
        tabBar={<nav aria-label="Primary">Tabs</nav>}
        overlay={
          <div role="dialog" aria-label="Sheet">
            Sheet
          </div>
        }
      >
        <p>Menu</p>
      </AppShell>
    );
    const [status, body, tabBar, home, overlay] = [...screen.getByTestId("shell").children];
    expect(status).toHaveAttribute("aria-hidden", "true");
    expect(body).toHaveClass("min-h-0", "flex-1", "overflow-y-auto");
    expect(body).toContainElement(screen.getByText("Menu"));
    expect(tabBar).toBe(screen.getByRole("navigation", { name: "Primary" }));
    expect(home).toHaveAttribute("aria-hidden", "true");
    expect(overlay).toBe(screen.getByRole("dialog", { name: "Sheet" }));
  });

  it("shows the clock as device chrome, hidden from assistive tech", () => {
    render(<AppShell time="12:30" />);
    expect(screen.getByText("12:30").closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("keeps ink status text on the frame's own surface by default", () => {
    render(<AppShell />);
    const status = statusRow();
    expect(status).not.toHaveAttribute("data-surface");
    expect(status).not.toHaveClass("bg-surface-brand");
    expect(status).toHaveClass("text-text-heading", "text-app-shell-status", "font-display");
  });

  it("floods the status row brand, with white text, when the screen opens on a pink header", () => {
    render(<AppShell statusTone="light" />);
    const status = statusRow();
    expect(status).toHaveAttribute("data-surface", "brand");
    expect(status).toHaveClass("bg-surface-brand", "text-text-heading");
  });

  it("hands its frame to a ref — the stable element a Dialog or Toast portals into", () => {
    const frame = createRef<HTMLDivElement>();
    render(<AppShell ref={frame} data-testid="shell" overlay={<p>Sheet</p>} />);
    expect(frame.current).toBe(screen.getByTestId("shell"));
    expect(frame.current).toContainElement(screen.getByText("Sheet"));
  });

  it("lets a consumer className replace the frame's radius and shadow", () => {
    render(<AppShell className="rounded-lg shadow-1" data-testid="shell" />);
    const shell = screen.getByTestId("shell");
    expect(shell).toHaveClass("rounded-lg", "shadow-1");
    expect(shell).not.toHaveClass("rounded-app-shell");
    expect(shell).not.toHaveClass("shadow-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <AppShell
        tabBar={
          <nav aria-label="Primary">
            <a href="#menu">Menu</a>
          </nav>
        }
      >
        <h1>Menu</h1>
      </AppShell>
    );
    await expectNoA11yViolations(container);
  });

  it("has no accessibility violations on the light status tone with a sheet open", async () => {
    const { container } = render(
      <AppShell
        statusTone="light"
        tabBar={
          <nav aria-label="Primary">
            <a href="#home">Home</a>
          </nav>
        }
        overlay={
          <div role="dialog" aria-label="Remove this item?">
            <button type="button">Remove</button>
          </div>
        }
      >
        <h1>Home</h1>
      </AppShell>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./app-shell"`.

- [ ] **Step 4: Implement**

`packages/ui/src/layouts/app-shell/app-shell.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { BatteryFull } from "lucide-react";

import { Icon } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const appShell = componentVariants({
  slots: {
    // contain-layout makes the frame the containing block for absolute *and* fixed children, so
    // sheets, docks and toasts sit inside the phone the way they sit inside a real screen.
    base: "rounded-app-shell relative flex shrink-0 flex-col overflow-hidden bg-surface-page shadow-4 contain-layout",
    status:
      "px-app-shell-status-x text-app-shell-status flex h-11 flex-none items-center justify-between font-display text-text-heading",
    body: "flex min-h-0 flex-1 flex-col overflow-y-auto",
    home: "h-app-shell-home grid flex-none place-items-center",
    homeBar: "h-app-shell-home-bar-h w-app-shell-home-bar-w rounded-pill bg-ink-300",
  },
  variants: {
    size: {
      phone: { base: "h-app-shell-h w-app-shell-w" },
      "phone-sm": { base: "h-app-shell-sm-h w-app-shell-sm-w" },
    },
    statusTone: {
      ink: {},
      // The screen opens on the flooded brand header, so the status row floods to meet it.
      light: { status: "bg-surface-brand" },
    },
  },
});

/** The status row's own surface: none for ink (it reads on the frame), brand for light. */
const STATUS_SURFACE = { ink: undefined, light: "brand" } as const;

export interface AppShellProps extends ComponentProps<"div"> {
  /** Status-bar colour: ink on light screens; `light` (white on brand) when the screen opens on a pink header. */
  statusTone?: "ink" | "light";
  /** The status-bar clock. */
  time?: string;
  /** A TabBar, pinned above the home indicator. */
  tabBar?: ReactNode;
  /**
   * Sheets and toasts, rendered inside the frame. The frame (`position: relative`, reached through
   * `ref`) is the container they anchor to — pass it as Dialog's `portalContainer`, or place the
   * ToastProvider viewport here, and they stay inside the phone.
   */
  overlay?: ReactNode;
  /** phone 390×844 · phone-sm 360×780 (the system's 360px floor). */
  size?: "phone" | "phone-sm";
}

/**
 * The phone frame every app screen is shown in: status bar, the scrolling screen body (`children`),
 * the tab bar, the home indicator, and an overlay slot the frame anchors.
 */
export function AppShell({
  statusTone = "ink",
  time = "9:41",
  tabBar,
  overlay,
  size = "phone",
  className,
  children,
  ...props
}: AppShellProps) {
  const slots = appShell({ size, statusTone });
  return (
    <div data-surface="light" className={slots.base({ className })} {...props}>
      {/* Device chrome, not content: hidden from assistive tech. */}
      <div aria-hidden data-surface={STATUS_SURFACE[statusTone]} className={slots.status()}>
        <span>{time}</span>
        <Icon icon={BatteryFull} size="sm" />
      </div>
      <div className={slots.body()}>{children}</div>
      {tabBar}
      <div aria-hidden className={slots.home()}>
        <span className={slots.homeBar()} />
      </div>
      {overlay}
    </div>
  );
}
```

(The zip draws the battery from two nested spans. Lucide's `BatteryFull` at the 16px icon step keeps the frame on the system's iconography with no extra tokens; the parity review lists the difference.)

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories — card parity with atom stand-ins**

The card (`AppShell.card.html`) shows two frames: "with tabBar", and "with overlay sheet" — a Dialog sheet over the same screen. Its screen composes TabBar and Dialog (Plan 4) and FilterBar, MenuItemRow and LoyaltyCard (Plan 3b), none of which exist yet. The stories build the same screen from atoms and this plan's layouts, as story-local stand-ins (see "Hand-offs to later plans").

`packages/ui/src/layouts/app-shell/app-shell.stories.tsx`:

```tsx
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
```

- [ ] **Step 7: Export**

Add to `packages/ui/src/index.ts`:

```ts
export { AppShell, type AppShellProps } from "./layouts/app-shell/app-shell";
```

- [ ] **Step 8: Format, gate, commit**

Run `pnpm exec prettier --write packages/ui/src/layouts/app-shell packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts packages/design-tokens/tokens/component/app-shell.json`, then the gate. Expected: green; paste the summary lines.

```bash
git add packages/design-tokens/tokens/component/app-shell.json packages/ui/src/layouts/app-shell \
  packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): AppShell layout

The phone frame for app screens (390x844, and 360x780 for the floor):
status bar as hidden device chrome, a scrolling screen body, tab bar,
home indicator and an overlay slot the frame contains. statusTone=light
floods the status row brand to meet a pink header.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

