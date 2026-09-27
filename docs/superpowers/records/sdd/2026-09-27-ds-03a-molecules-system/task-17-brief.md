### Task 17: ListRow (Slot)

Design-system sources: `components/molecules/ListRow.*`; UI kit `ui_kits/app/Screens.jsx` (account list). Card rows: value + chevron · trailing control · description · trailing badge · danger.

**Files:**

- Create: `packages/ui/src/molecules/list-row/list-row.tsx`, `list-row.test.tsx`, `list-row.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/list-row/list-row.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                                       | Ruling  | Where / why                                                                                   |
| ---------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------- |
| a static row carries no button semantics                                                       | ADD     | assertion in "shows its title…"                                                               |
| Space as well as Enter operates an action row                                                  | ADD     | asChild-button test                                                                           |
| chevron only when asked                                                                        | ADD     | chevron test                                                                                  |
| press feedback on an interactive row (`active:scale`)                                          | ADD     | `isInteractive` row `active:press-scale` + assertion                                          |
| caller `className` merges                                                                      | ADD     | test "merges a caller className…"                                                             |
| axe over a danger action row                                                                   | ADD     | axe test                                                                                      |
| `Narrow` story                                                                                 | ADD     | `Narrow` story                                                                                |
| `onClick` turns the row into a `<button>`                                                      | ALREADY | `asChild` + `<button>` / `<a>` / `next/link` (spec D8, contracts §5)                          |
| description clamps to 2; value; trailing; leading over icon; danger                            | ALREADY | tests "shows its title…", "puts a leading element…", "renders a trailing control…", "paints…" |
| hairline, none on the last row; 44px hit                                                       | ALREADY | divider test; `min-h-hit` in the asChild-link test                                            |
| `Default`, `WithValueAndChevron`, `WithDescription`, `WithTrailing`, `Danger`, `Group` stories | ALREADY | `Playground`, `WithDescription`, `TrailingBadge`, `TrailingControl`, `Danger`, `AccountList`  |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Icon`; `radix-ui` → `Slot` (`Slot.Root`, `Slot.Slottable` with the `child` render form — verified in `@radix-ui/react-slot` 1.3.3); `Switch`, `Badge` (stories).
- Produces: `ListRow`, `ListRowProps` — contract §5. A hairline-separated row; with `asChild` the row's content is rendered **into** the consumer's `<a>`, `next/link` or `<button>` (Plan 2a's Slottable pattern), which also gets the row's classes and hover tint. All inner wrappers are `<span>`, so the result is valid inside an anchor or a button. A row with a trailing control stays a `<div>` (a control inside a link is invalid).

- [ ] **Step 1: No new tokens**

`min-h-hit` (44px), `px-3 py-3.5`, `gap-3.5`, glyph sizes `lg`/`md` and `text-body-sm` / `text-caption` are all existing tokens; the colours are semantic (`text-heading`, `text-muted`, `text-subtle`, `text-danger`) plus the chevron's decorative `ink-400`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/list-row/list-row.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bell, LogOut, MapPin } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ListRow } from "./list-row";

describe("ListRow", () => {
  it("shows its title, description and value", () => {
    render(
      <ListRow
        icon={MapPin}
        title="Default outlet"
        description="Where your pickups go."
        value="Sector 57"
      />
    );
    expect(screen.getByText("Default outlet")).toHaveClass("text-text-heading");
    expect(screen.getByText("Where your pickups go.")).toHaveClass("line-clamp-2");
    expect(screen.getByText("Sector 57")).toHaveClass("text-text-muted");
    // A static row is only text: no button or link semantics.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("draws its glyph and chevron decoratively, and the chevron only when asked", () => {
    const { container, rerender } = render(<ListRow icon={MapPin} title="Default outlet" />);
    expect(container.querySelector("svg.lucide-chevron-right")).not.toBeInTheDocument();
    rerender(<ListRow icon={MapPin} title="Default outlet" hasChevron />);
    for (const glyph of container.querySelectorAll("svg")) {
      expect(glyph.closest("[aria-hidden='true']")).not.toBeNull();
    }
    expect(container.querySelector("svg.lucide-chevron-right")).toBeInTheDocument();
  });

  it("puts a leading element in place of the glyph", () => {
    const { container } = render(
      <ListRow icon={MapPin} leading={<span data-leading="">SP</span>} title="Sector 57" />
    );
    expect(container.querySelector("[data-leading]")).toBeInTheDocument();
    expect(container.querySelector("svg.lucide-map-pin")).not.toBeInTheDocument();
  });

  it("renders a trailing control, such as a switch", () => {
    render(
      <ListRow
        icon={Bell}
        title="Order updates"
        trailing={<input type="checkbox" role="switch" aria-label="Order updates" />}
      />
    );
    expect(screen.getByRole("switch", { name: "Order updates" })).toBeInTheDocument();
  });

  it("separates rows with a hairline unless hasDivider is false", () => {
    const { container, rerender } = render(<ListRow title="Loyalty" />);
    expect(container.firstElementChild).toHaveClass("border-b");
    rerender(<ListRow title="Loyalty" hasDivider={false} />);
    expect(container.firstElementChild).not.toHaveClass("border-b");
  });

  it("paints a destructive row in the danger colour", () => {
    render(<ListRow icon={LogOut} title="Delete my account" isDanger />);
    expect(screen.getByText("Delete my account")).toHaveClass("text-text-danger");
  });

  it("renders into a link with asChild, keeping its layout and hover", () => {
    render(
      <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
        <a href="/account/outlet" />
      </ListRow>
    );
    const link = screen.getByRole("link", { name: /Default outlet/ });
    expect(link).toHaveAttribute("href", "/account/outlet");
    expect(link).toHaveClass("min-h-hit", "hover:bg-surface-page-alt");
    expect(link).toHaveTextContent("Default outletSector 57");
  });

  it("renders into a button with asChild, so an action row is keyboard-operable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ListRow asChild icon={LogOut} title="Sign out" isDanger hasDivider={false}>
        <button type="button" onClick={onClick} />
      </ListRow>
    );
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveClass(
      "w-full",
      "text-start",
      "active:press-scale"
    );
  });

  it("merges a caller className over its own", () => {
    const { container } = render(<ListRow title="Loyalty" className="mx-0" />);
    expect(container.firstElementChild).toHaveClass("mx-0");
    expect(container.firstElementChild).not.toHaveClass("-mx-3");
  });

  it("has no accessibility violations as a static row and as a link", async () => {
    const { container } = render(
      <>
        <ListRow icon={Bell} title="Order updates" description="Texts when your food is ready." />
        <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
          <a href="/account/outlet" />
        </ListRow>
        <ListRow asChild icon={LogOut} title="Delete my account" isDanger hasDivider={false}>
          <button type="button" onClick={vi.fn()} />
        </ListRow>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/list-row 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./list-row`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/list-row/list-row.tsx`:

```tsx
import type { ComponentProps, ElementType, ReactNode } from "react";

import { ChevronRight } from "lucide-react";
import { Slot } from "radix-ui";

import { Icon, type IconComponent } from "../../atoms/icon/icon";
import { componentVariants } from "../../lib/component-variants";

const listRow = componentVariants({
  slots: {
    root: "-mx-3",
    row: "flex min-h-hit w-full min-w-0 items-center gap-3.5 rounded-sm px-3 py-3.5 text-start",
    icon: "text-text-muted",
    body: "grid min-w-0 flex-1 gap-0.5",
    title: "text-body-sm font-medium text-text-heading",
    description: "line-clamp-2 text-caption text-text-subtle",
    value: "shrink-0 text-body-sm text-text-muted",
    chevron: "text-ink-400",
  },
  variants: {
    hasDivider: { true: { root: "border-b border-border-subtle" } },
    isDanger: { true: { icon: "text-text-danger", title: "text-text-danger" } },
    isInteractive: {
      true: {
        // Hover tint and press feedback (dev parity) on a row rendered into a link or button.
        row: "cursor-pointer no-underline transition-colors duration-fast ease-out hover:bg-surface-page-alt active:press-scale",
      },
    },
  },
  defaultVariants: { hasDivider: true, isDanger: false, isInteractive: false },
});

export interface ListRowProps extends Omit<ComponentProps<"div">, "title"> {
  title: ReactNode;
  description?: ReactNode;
  /** Replaces the glyph, e.g. an Avatar. */
  leading?: ReactNode;
  icon?: IconComponent | undefined;
  /** Right-aligned muted value, e.g. "Sector 57". */
  value?: ReactNode;
  /** Right-aligned control, e.g. a Switch. Never combine with `asChild`. */
  trailing?: ReactNode;
  hasChevron?: boolean | undefined;
  hasDivider?: boolean | undefined;
  /** A destructive row — "Delete my account". */
  isDanger?: boolean | undefined;
  /** Render the row into its single child — an `<a>`, `next/link` or `<button>`. */
  asChild?: boolean | undefined;
}

/**
 * Settings, account and detail rows. Hairline separated — never a stack of cards — and at least
 * 44px tall. With `asChild` the whole row is the link or button, hover-tinted.
 */
export function ListRow({
  title,
  description,
  leading,
  icon,
  value,
  trailing,
  hasChevron = false,
  hasDivider = true,
  isDanger = false,
  asChild = false,
  className,
  children,
  ...props
}: ListRowProps) {
  const Row: ElementType = asChild ? Slot.Root : "div";
  const styles = listRow({ hasDivider, isDanger, isInteractive: asChild });
  const glyph =
    icon === undefined ? null : <Icon icon={icon} size="lg" className={styles.icon()} />;

  return (
    <div className={styles.root({ className })} {...props}>
      <Row className={styles.row()}>
        <Slot.Slottable child={children}>
          {(content) => (
            <>
              {leading ?? glyph}
              <span className={styles.body()}>
                <span className={styles.title()}>{title}</span>
                {description === undefined || description === null ? null : (
                  <span className={styles.description()}>{description}</span>
                )}
              </span>
              {value === undefined || value === null ? null : (
                <span className={styles.value()}>{value}</span>
              )}
              {trailing}
              {hasChevron ? (
                <Icon icon={ChevronRight} size="md" className={styles.chevron()} />
              ) : null}
              {content}
            </>
          )}
        </Slot.Slottable>
      </Row>
    </div>
  );
}
```

(Without `asChild` the row is a `<div>` and `Slottable` simply calls the render function; with it, `Slot.Root` renders the child element with the row's classes and this content inside it. `leading ?? glyph` treats only `undefined`/`null` as "no leading".)

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- src/molecules/list-row 2>&1 | tail -8`
Expected: PASS (10 tests).

- [ ] **Step 6: Stories**

`packages/ui/src/molecules/list-row/list-row.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Bell, CreditCard, Gift, LogOut, MapPin, Receipt, Trash2 } from "lucide-react";
import { expect, fn } from "storybook/test";

import { Badge } from "../../atoms/badge/badge";
import { Switch } from "../../atoms/switch/switch";
import { ListRow } from "./list-row";

const meta = {
  title: "Molecules/ListRow",
  component: ListRow,
  args: { icon: MapPin, title: "Default outlet", value: "Sector 57", hasChevron: true },
  render: (args) => (
    <ListRow {...args} asChild>
      <a href="#outlet" />
    </ListRow>
  ),
  parameters: {
    docs: {
      description: {
        component:
          "Settings, account and detail rows in the app. Rows are hairline separated — never a stack of cards — and at least 44px tall. `asChild` renders the whole row into a link or button (it gets the classes and the pink-50 hover); a row with a `trailing` control (Switch) stays a plain row. `isDanger` for destructive rows. The glyph, value and chevron follow the surface.",
      },
    },
  },
} satisfies Meta<typeof ListRow>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Card row "value + chevron" — a link row. */
export const Playground: Story = {};

/** Card row "trailing control". */
export const TrailingControl: Story = {
  args: { icon: Bell, title: "Order updates", value: undefined, hasChevron: false },
  render: (args) => (
    <ListRow {...args} trailing={<Switch label="Order updates" isLabelHidden defaultChecked />} />
  ),
};

/** Card row "description". */
export const WithDescription: Story = {
  args: {
    icon: CreditCard,
    title: "Payment methods",
    description: "UPI, cards and Paprikaa credit.",
    value: undefined,
  },
};

/** Card row "trailing badge". */
export const TrailingBadge: Story = {
  args: { icon: Gift, title: "Loyalty", value: undefined },
  render: (args) => (
    <ListRow {...args} trailing={<Badge tone="soft">4 of 6</Badge>} asChild>
      <a href="#loyalty" />
    </ListRow>
  ),
};

/** Card row "danger" — an action row rendered into a button. */
export const Danger: Story = {
  args: {
    icon: Trash2,
    title: "Delete my account",
    value: undefined,
    isDanger: true,
    hasDivider: false,
  },
  render: (args) => (
    <ListRow {...args} asChild>
      <button type="button" onClick={fn()} />
    </ListRow>
  ),
  play: async ({ canvas, userEvent }) => {
    const row = canvas.getByRole("button", { name: /Delete my account/ });
    await userEvent.tab();
    await expect(row).toHaveFocus();
  },
};

/** The app kit's account list. */
export const AccountList: Story = {
  render: () => (
    <div className="grid">
      <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
        <a href="#outlet" />
      </ListRow>
      <ListRow
        asChild
        icon={Receipt}
        title="Order history"
        description="Your past orders"
        hasChevron
      >
        <a href="#orders" />
      </ListRow>
      <ListRow asChild icon={CreditCard} title="Payment methods" value="UPI" hasChevron>
        <a href="#payments" />
      </ListRow>
      <ListRow
        icon={Bell}
        title="Order updates"
        trailing={<Switch label="Order updates" isLabelHidden defaultChecked />}
      />
      <ListRow asChild icon={LogOut} title="Sign out" isDanger hasDivider={false}>
        <button type="button" onClick={fn()} />
      </ListRow>
    </div>
  ),
};

/** Dev parity: at 360px the description clamps and the value keeps its place. */
export const Narrow: Story = {
  args: {
    title: "Default outlet for pickup orders",
    description: "MKM Market, Sector 57, Gurgaon.",
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-80">
        <Story />
      </div>
    ),
  ],
};
```

(`Switch` takes `isLabelHidden` — Plan 2b deviation 4 — so the row's title stays the only visible label while the switch keeps its name.)

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { ListRow, type ListRowProps } from "./molecules/list-row/list-row";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec eslint --fix packages/ui/src/molecules/list-row packages/ui/src/index.ts && pnpm exec prettier --write packages/ui/src/molecules/list-row packages/ui/src/index.ts
pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && pnpm nx run-many -t typecheck lint test -p @pink-paprikaa-web/ui @pink-paprikaa-web/design-tokens --skip-nx-cache --outputStyle=static && pnpm nx run @pink-paprikaa-web/storybook:build 2>&1 | tail -25
```

Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): ListRow molecule with asChild

Hairline-separated settings and detail rows. asChild renders the row's
glyph, text, value and chevron into the consumer's link or button, which
takes the row's classes and hover; inner wrappers are spans, so the markup
stays valid inside either.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

