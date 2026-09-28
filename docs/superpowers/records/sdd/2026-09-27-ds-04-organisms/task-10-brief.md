### Task 10: TabBar

**Dev reference:** `git show dev:packages/ui/src/organisms/tab-bar/tab-bar.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                         | Ruling  | Where / clause                                                                                     |
| ---------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| One control per destination in a named `nav`                     | ALREADY | test "is a navigation landmark named Primary by default"                                           |
| Five destinations                                                | ADD     | test "carries five destinations too"                                                               |
| The destination in view is `aria-current="page"`                 | ALREADY | test "marks the current destination…"                                                              |
| Uncontrolled: starts on the first / `defaultValue`, moves itself | DROP    | contract §7 `value: string` (required) + D6 — server-safe, no state; stories hold state in `Frame` |
| Controlled: reports the tap, does not move itself                | ADD     | the `onValueChange` test asserts Home stays current                                                |
| Count announced with the label; singular/plural wording          | ALREADY | "Cart (2)" — no pluralised copy to own (D9)                                                        |
| The 64px bar                                                     | ALREADY | test "sits in the fixed 64px bar height"                                                           |
| A long label truncates; tabs `min-w-0` so five fit at 360px      | ADD     | `label` slot + test "keeps a long label on one line…"                                              |
| Press feedback (`active:scale`)                                  | ADD     | `active:press-scale` on the control (CSS only)                                                     |
| 44px hit target                                                  | ALREADY | full-height 64px controls                                                                          |
| Merges a caller `className`                                      | ADD     | test "merges a caller className over its own"                                                      |
| axe                                                              | ALREADY | test "has no accessibility violations"                                                             |
| Stories Default · FourDestinations · FiveDestinations            | ALREADY | Playground · FourTabsWithCount · FiveTabs                                                          |
| Story EachDestinationActive (each bar self-named)                | ADD     | `EachDestinationActive`                                                                            |
| Story Smallest (five at 360px)                                   | ADD     | `Mobile`                                                                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Files:**

- Create: `packages/design-tokens/tokens/component/tab-bar.json`
- Create: `packages/ui/src/organisms/tab-bar/tab-bar.tsx`, `tab-bar.test.tsx`, `tab-bar.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`SPACING`, `TEXT`), `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `Icon`/`IconComponent`, `LinkAs`/`LinkAsProps`, `componentVariants`; the `h-tabbar` token (Plan 1, 64px).
- Produces: `TabBar`, `TabBarProps`, `TabBarItem`.

Server-safe and isomorphic: link tabs (items with `href`) render from a server parent; button tabs need `onValueChange`, which only a client parent can pass — the handler is created only when it is given, so a server render never attaches one.

- [ ] **Step 1: Component tokens**

`packages/design-tokens/tokens/component/tab-bar.json`:

```json
{
  "spacing": {
    "$type": "dimension",
    "tab-bar-count": {
      "$value": "16px",
      "$description": "Count pill height and minimum width (design system TabBar)."
    }
  },
  "text": {
    "$type": "typography",
    "tab-bar-label": {
      "$value": { "fontSize": "11px", "lineHeight": 1.2, "fontWeight": "{font-weight.medium}" },
      "$description": "Tab label; bold when active."
    },
    "tab-bar-count": {
      "$value": { "fontSize": "10px", "lineHeight": 1, "fontWeight": "{font-weight.bold}" }
    }
  }
}
```

Append to `SPACING`:

```ts
  "tab-bar-count",
```

Append to `TEXT`:

```ts
  "tab-bar-label",
  "tab-bar-count",
```

- [ ] **Step 2: Write the failing test**

`packages/ui/src/organisms/tab-bar/tab-bar.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { TabBar, type TabBarItem } from "./tab-bar";

const ITEMS: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

function RouterLink({ href, className, children, ...props }: LinkAsProps) {
  return (
    <a href={href} className={className} data-router-link="" {...props}>
      {children}
    </a>
  );
}

describe("TabBar", () => {
  it("is a navigation landmark named Primary by default", () => {
    render(<TabBar items={ITEMS} value="home" />);
    expect(screen.getByRole("navigation", { name: "Primary" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
  });

  it("carries five destinations too", () => {
    render(
      <TabBar
        items={[...ITEMS, { value: "orders", label: "Orders", icon: Receipt }]}
        value="home"
      />
    );
    expect(screen.getAllByRole("button")).toHaveLength(5);
  });

  it("marks the current destination with aria-current=page, in the brand colour", () => {
    render(<TabBar items={ITEMS} value="menu" />);
    const menu = screen.getByRole("button", { name: "Menu" });
    expect(menu).toHaveAttribute("aria-current", "page");
    expect(menu).toHaveClass("text-text-brand", "font-bold");
    expect(screen.getByRole("button", { name: "Home" })).not.toHaveAttribute("aria-current");
  });

  it("reports the chosen destination when a button tab is pressed — by pointer or keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<TabBar items={ITEMS} value="home" onValueChange={onValueChange} />);
    await user.click(screen.getByRole("button", { name: "Menu" }));
    expect(onValueChange).toHaveBeenLastCalledWith("menu");
    screen.getByRole("button", { name: "You" }).focus();
    await user.keyboard("{Enter}");
    expect(onValueChange).toHaveBeenLastCalledWith("you");
    // Controlled: the bar reports the tap but only `value` moves it.
    expect(screen.getByRole("button", { name: "Home" })).toHaveAttribute("aria-current", "page");
  });

  it("keeps a long label on one line, truncated, so five tabs fit at 360px", () => {
    render(
      <TabBar items={[{ value: "orders", label: "Order history", icon: Receipt }]} value="orders" />
    );
    expect(screen.getByText("Order history")).toHaveClass("max-w-full", "truncate");
  });

  it("merges a caller className over its own", () => {
    render(<TabBar items={ITEMS} value="home" className="bg-surface-sunken" />);
    expect(screen.getByRole("navigation")).toHaveClass("bg-surface-sunken");
    expect(screen.getByRole("navigation")).not.toHaveClass("bg-surface-card");
  });

  it("announces a count with its label and hides the visual pill", () => {
    render(<TabBar items={ITEMS} value="home" />);
    const cart = screen.getByRole("button", { name: "Cart (2)" });
    const pill = cart.querySelector('[aria-hidden="true"].rounded-pill');
    expect(pill).toHaveTextContent("2");
  });

  it("renders link tabs through linkAs when items have an href", () => {
    render(
      <TabBar
        items={ITEMS.map((item) => ({ ...item, href: `#${item.value}` }))}
        value="cart"
        linkAs={RouterLink}
      />
    );
    const cart = screen.getByRole("link", { name: "Cart (2)" });
    expect(cart).toHaveAttribute("href", "#cart");
    expect(cart).toHaveAttribute("aria-current", "page");
    expect(cart).toHaveAttribute("data-router-link");
  });

  it("sits in the fixed 64px bar height", () => {
    render(<TabBar items={ITEMS} value="home" />);
    expect(screen.getByRole("navigation")).toHaveClass("h-tabbar");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<TabBar items={ITEMS} value="cart" />);
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- tab-bar 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./tab-bar`.

- [ ] **Step 4: Implement**

`packages/ui/src/organisms/tab-bar/tab-bar.tsx`:

```tsx
import type { ComponentProps } from "react";

import type { LinkAs } from "../../lib/link-as";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

export interface TabBarItem {
  value: string;
  label: string;
  icon: IconComponent;
  /** Badge count, e.g. cart items; 0 or omitted hides it. */
  count?: number | undefined;
  /** Makes the tab a link (rendered through `linkAs`); without it the tab is a button. */
  href?: string | undefined;
}

const tabBar = componentVariants({
  slots: {
    root: "h-tabbar border-t border-border-subtle bg-surface-card",
    list: "flex h-full",
    item: "flex min-w-0 flex-1",
    control:
      "text-tab-bar-label flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 font-display text-text-subtle no-underline transition-colors duration-fast ease-out hover:text-text-heading active:press-scale",
    glyph: "relative inline-flex",
    label: "max-w-full truncate",
    count:
      "h-tab-bar-count min-w-tab-bar-count text-tab-bar-count absolute -top-1 -right-2 grid place-items-center rounded-pill bg-surface-brand px-1 font-display text-text-on-brand",
  },
  variants: {
    isActive: { true: { control: "font-bold text-text-brand hover:text-text-brand" } },
  },
});

export interface TabBarProps extends ComponentProps<"nav"> {
  /** Four or five destinations, never more. */
  items: TabBarItem[];
  value: string;
  /** Called by button tabs. Link tabs navigate instead. Only a client parent can pass it. */
  onValueChange?: ((value: string) => void) | undefined;
  linkAs?: LinkAs | undefined;
  /** The landmark's name. */
  label?: string | undefined;
}

/**
 * The app's fixed 64px bottom navigation. The active destination is brand pink with a bold label;
 * a count renders as a pink pill on the icon and is read out with the label ("Cart (2)").
 */
export function TabBar({
  items,
  value,
  onValueChange,
  linkAs: LinkComponent = "a",
  label = "Primary",
  className,
  ...props
}: TabBarProps) {
  const slots = tabBar();
  return (
    <nav aria-label={label} data-surface="light" className={slots.root({ className })} {...props}>
      <ul className={slots.list()}>
        {items.map((item) => {
          const isActive = item.value === value;
          const control = slots.control({ isActive });
          const hasCount = item.count !== undefined && item.count > 0;
          const content = (
            <>
              <span className={slots.glyph()}>
                <Icon icon={item.icon} size="lg" />
                {hasCount ? (
                  <span aria-hidden className={slots.count()}>
                    {item.count}
                  </span>
                ) : null}
              </span>
              <span className={slots.label()}>{item.label}</span>
              {hasCount ? <span className="sr-only"> ({item.count})</span> : null}
            </>
          );
          return (
            <li key={item.value} className={slots.item()}>
              {item.href === undefined ? (
                <button
                  type="button"
                  aria-current={isActive ? "page" : undefined}
                  className={control}
                  onClick={
                    onValueChange === undefined
                      ? undefined
                      : () => {
                          onValueChange(item.value);
                        }
                  }
                >
                  {content}
                </button>
              ) : (
                <LinkComponent
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={control}
                >
                  {content}
                </LinkComponent>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- tab-bar 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories (card parity with `TabBar.card.html`)**

`packages/ui/src/organisms/tab-bar/tab-bar.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { House, Receipt, ShoppingBag, User, Utensils } from "lucide-react";
import { useState } from "react";
import { expect } from "storybook/test";

import { VIEWPORT_360 } from "../story-fixtures";
import { TabBar, type TabBarItem } from "./tab-bar";

const FOUR: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag, count: 2 },
  { value: "you", label: "You", icon: User },
];

const FIVE: TabBarItem[] = [
  { value: "home", label: "Home", icon: House },
  { value: "menu", label: "Menu", icon: Utensils },
  { value: "cart", label: "Cart", icon: ShoppingBag },
  { value: "orders", label: "Orders", icon: Receipt },
  { value: "you", label: "You", icon: User },
];

/** A phone-width frame, as on the card. */
function Frame({ items, initial }: { items: TabBarItem[]; initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="w-97.5 overflow-hidden rounded-lg border border-border-subtle">
      <TabBar items={items} value={value} onValueChange={setValue} />
    </div>
  );
}

const meta = {
  title: "Organisms/TabBar",
  component: TabBar,
  args: { items: FOUR, value: "menu" },
  parameters: {
    docs: {
      description: {
        component:
          "The app's fixed bottom navigation — 64px, four or five destinations, never more. The active destination is pink with a bold label; counts render as a pink pill on the icon and are read with the label. Items with `href` are links (through `linkAs`); otherwise buttons that call `onValueChange`.",
      },
    },
  },
} satisfies Meta<typeof TabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: 4 tabs + count. */
export const FourTabsWithCount: Story = {
  render: () => <Frame items={FOUR} initial="menu" />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cart (2)" }));
    await expect(canvas.getByRole("button", { name: "Cart (2)" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    await expect(canvas.getByRole("button", { name: "Menu" })).not.toHaveAttribute("aria-current");
  },
};

/** Card row: 5 tabs. */
export const FiveTabs: Story = { render: () => <Frame items={FIVE} initial="home" /> };

export const AsLinks: Story = {
  args: { items: FOUR.map((item) => ({ ...item, href: `#${item.value}` })), value: "home" },
  render: (args) => (
    <div className="w-97.5 overflow-hidden rounded-lg border border-border-subtle">
      <TabBar {...args} />
    </div>
  ),
};

/**
 * Each destination active in turn, for comparing the active treatment at a glance. Four bars are
 * four navigation landmarks, so each names itself — four called "Primary" could not be told apart.
 */
export const EachDestinationActive: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {FOUR.map((item) => (
        <div
          key={item.value}
          className="w-97.5 overflow-hidden rounded-lg border border-border-subtle"
        >
          <TabBar items={FOUR} value={item.value} label={`Primary, ${item.label} in view`} />
        </div>
      ))}
    </div>
  ),
};

/** Five tabs across the smallest supported viewport (360px): nothing wraps. */
export const Mobile: Story = {
  globals: VIEWPORT_360,
  parameters: { layout: "fullscreen" },
  render: () => <TabBar items={FIVE} value="home" />,
};
```

- [ ] **Step 7: Export**

```ts
export { TabBar, type TabBarItem, type TabBarProps } from "./organisms/tab-bar/tab-bar";
```

- [ ] **Step 8: Format, gate, commit**

```bash
pnpm exec prettier --write packages/ui/src/organisms/tab-bar packages/design-tokens/tokens/component/tab-bar.json packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
pnpm nx lint @pink-paprikaa-web/ui --fix --skip-nx-cache >/dev/null
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache \
  && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static \
  && pnpm nx run @pink-paprikaa-web/storybook:build
git add packages/design-tokens/tokens/component/tab-bar.json packages/ui/src/organisms/tab-bar packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): TabBar organism

The app's 64px bottom navigation as a labelled nav: link tabs through
linkAs or button tabs that report onValueChange, the current one marked
aria-current in brand pink, counts shown as a pill and read with the label.
Labels use the passing ink-600 and pink-600 text tokens.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

