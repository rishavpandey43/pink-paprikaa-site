### Task 1: MenuItemRow

**Files:**

- Create: `packages/design-tokens/tokens/component/menu-item.json`
- Create: `packages/ui/src/molecules/menu-item-row/menu-item-row.tsx`, `menu-item-row.test.tsx`, `menu-item-row.stories.tsx`
- Modify: `packages/ui/src/lib/component-variants.ts` (`TEXT`), `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/menu-item-row/menu-item-row.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                    | Ruling  | Where, or the spec clause                                                                             |
| --------------------------------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------- |
| Dish name is a heading; price printed                                       | ALREADY | tests "names the dish…", "prints the price…"                                                          |
| `nameAs` picks the name element (incl. `"p"`)                               | ALREADY | `headingLevel` (spec §8.1 "Titled components take `headingLevel`"; contract §6 has no `nameAs`)       |
| `was` struck through (`<s>`)                                                | ALREADY | PriceTag owns the `<s>` (Plan 2b PriceTag test); this test asserts both prices                        |
| `diet` prop, veg default, `egg` mark; `DietMarks` story                     | DROP    | C10 (pure veg, no `diet` prop) — test "takes no diet prop" pins it                                    |
| Heat named for assistive tech                                               | ALREADY | test "shows the heat…" ("Spice level 3 of 4")                                                         |
| No heat scale on a dish without heat                                        | ADD     | test "renders no heat scale on a dish without heat"                                                   |
| Devanagari name `lang="hi"`; badge                                          | ALREADY | tests "marks the Devanagari…", "shows the heat, the badge…"                                           |
| `onAdd` → built-in Add button                                               | DROP    | spec §9.2 MenuItemRow: "`action` slot (replaces `onAdd`)"                                             |
| Add button's accessible name carries the dish ("Add Masala Fries")          | ADD     | `action` JSDoc; stories' `addButton(name)` sets `aria-label`; cross-plan: MenuList `renderItemAction` |
| No control on a menu that cannot take orders                                | ADD     | test "renders no control when the menu cannot take orders"                                            |
| Labelled placeholder until a photo; photo with its alt                      | ALREADY | test "labels the photo placeholder…"                                                                  |
| Hairline divider on / off                                                   | ALREADY | test "draws the hairline divider…"                                                                    |
| Caller `className` replaces the row's own padding                           | ADD     | test "lets a caller className replace its own padding"                                                |
| axe on the fullest state                                                    | ALREADY | last test                                                                                             |
| Thumbnail 80px at 360, 104px from `sm`                                      | ADD     | `thumbnail: "size-20 shrink-0 sm:size-26"`                                                            |
| `min-w-0` so a long name wraps instead of pushing the thumbnail off-screen  | ALREADY | `body: "min-w-0 flex-1"`, header `flex-wrap`; `Narrow` story play                                     |
| Stories `Default`, `WithDevanagariName`, `Discounted`                       | ALREADY | `Playground` / `Full`, `Devanagari`, `Discount`                                                       |
| Stories `AsAMenuSection`, `SpiceLevels`, `WithCustomAction`, `Narrow` (360) | ADD     | stories `AsAMenuSection`, `SpiceLevels`, `InCart`, `Narrow`                                           |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Badge` (`tone="soft"`), `DietMark` (`size="sm"`), `ImageSlot`, `PriceTag` (`size="sm"`), `SpiceLevel` (`size="sm"`), `headingTag`/`HeadingLevel`, `componentVariants`.
- Produces: `MenuItemRow`, `type MenuItemRowProps`, `type MenuItemImage` (contract §6). Documented default: `imageLabel = "Dish photo"`. No `diet` prop.

- [ ] **Step 1: Component tokens**

Create `packages/design-tokens/tokens/component/menu-item.json` (shared by MenuItemRow and MenuItemCard — one dish, two layouts):

```json
{
  "text": {
    "$type": "typography",
    "menu-item-name": {
      "$value": {
        "fontSize": "17px",
        "lineHeight": 1.3,
        "letterSpacing": "-0.005em",
        "fontWeight": "{font-weight.bold}"
      },
      "$description": "Dish name in MenuItemRow and MenuItemCard (design system 17 / 16.5px)."
    },
    "menu-item-devanagari": {
      "$value": { "fontSize": "15px", "lineHeight": 1.3, "fontWeight": "{font-weight.semibold}" },
      "$description": "Devanagari dish name set beside the Latin one."
    }
  }
}
```

In `packages/ui/src/lib/component-variants.ts`, append to `TEXT`: `"menu-item-name", "menu-item-devanagari",`.

Run: `pnpm nx build @pink-paprikaa-web/design-tokens --skip-nx-cache && rtk proxy grep -n "menu-item" packages/design-tokens/dist/theme.css`
Expected: `--text-menu-item-name: 17px;` with its three sub-properties, and `--text-menu-item-devanagari: 15px;`.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/menu-item-row/menu-item-row.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemRow } from "./menu-item-row";

describe("MenuItemRow", () => {
  it("names the dish as a level-3 heading and always shows the vegetarian mark", () => {
    render(<MenuItemRow name="Paprikaa Chilli Paneer" price={280} />);
    expect(
      screen.getByRole("heading", { level: 3, name: "Paprikaa Chilli Paneer" })
    ).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("takes no diet prop — every dish on the menu is vegetarian", () => {
    // @ts-expect-error — the kitchen is egg-free (spec C10): a diet prop must never compile.
    render(<MenuItemRow name="Gulkand Kulfi" price={180} diet="egg" />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("prints the price the brand way and keeps the struck-through old price", () => {
    render(<MenuItemRow name="Mushroom Keema Pav" price={340} was={380} />);
    const row = screen.getByRole("article");
    expect(row).toHaveTextContent("₹340");
    expect(row).toHaveTextContent("₹380");
  });

  it("marks the Devanagari name as Hindi so screen readers pronounce it", () => {
    render(<MenuItemRow name="Gulkand Kulfi" nameDevanagari="कुल्फी" price={180} />);
    expect(screen.getByText("कुल्फी")).toHaveAttribute("lang", "hi");
  });

  it("shows the heat, the badge and the description when given", () => {
    render(
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
      />
    );
    expect(screen.getByRole("img", { name: "Spice level 3 of 4" })).toBeInTheDocument();
    expect(screen.getByText("Bestseller")).toBeInTheDocument();
    expect(
      screen.getByText("Amritsari paneer, burnt chilli mayo, potato brioche.")
    ).toBeInTheDocument();
  });

  it("renders no heat scale on a dish without heat", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("img", { name: /Spice level/ })).not.toBeInTheDocument();
  });

  it("labels the photo placeholder until photography exists, then shows the photo", () => {
    const { rerender } = render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.getByText("Dish photo")).toBeInTheDocument();
    rerender(
      <MenuItemRow
        name="Kulhad Chai"
        price={90}
        image={{
          src: "/menu/kulhad-chai.avif",
          alt: "Kulhad chai in a clay cup",
          width: 208,
          height: 208,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "Kulhad chai in a clay cup" })).toHaveAttribute(
      "src",
      "/menu/kulhad-chai.avif"
    );
  });

  it("renders the action slot — the row never owns cart state", () => {
    render(
      <MenuItemRow name="Kulhad Chai" price={90} action={<button type="button">Add</button>} />
    );
    expect(screen.getByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("renders no control when the menu cannot take orders", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("draws the hairline divider by default and drops it on request", () => {
    const { rerender } = render(<MenuItemRow name="Kulhad Chai" price={90} />);
    expect(screen.getByRole("article")).toHaveClass("border-b");
    rerender(<MenuItemRow name="Kulhad Chai" price={90} hasDivider={false} />);
    expect(screen.getByRole("article")).not.toHaveClass("border-b");
  });

  it("uses the heading level the page needs", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} headingLevel={4} />);
    expect(screen.getByRole("heading", { level: 4, name: "Kulhad Chai" })).toBeInTheDocument();
  });

  it("lets a caller className replace its own padding", () => {
    render(<MenuItemRow name="Kulhad Chai" price={90} className="py-2" />);
    expect(screen.getByRole("article")).toHaveClass("py-2");
    expect(screen.getByRole("article")).not.toHaveClass("py-5");
  });

  it("has no accessibility violations in its fullest state", async () => {
    const { container } = render(
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        price={280}
        was={320}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
        action={<button type="button">Add</button>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-row 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./menu-item-row"`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/menu-item-row/menu-item-row.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import { Badge } from "../../atoms/badge/badge";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

/** A dish photograph from the image pipeline. Omit it and a labelled placeholder shows instead. */
export interface MenuItemImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

const menuItemRow = componentVariants({
  slots: {
    root: "flex items-start gap-5 py-5",
    body: "min-w-0 flex-1",
    header: "flex flex-wrap items-center gap-2",
    name: "text-menu-item-name font-display text-text-heading",
    nameDevanagari: "text-menu-item-devanagari font-devanagari text-text-brand",
    meta: "mt-2 flex items-center gap-3.5",
    description: "mt-2 mb-0 max-w-text-measure-narrow text-body-sm text-text-muted",
    action: "mt-3.5",
    // 80px at 360px, 104px (the design system's size) from `sm` up — the row holds its shape at both.
    thumbnail: "size-20 shrink-0 sm:size-26",
  },
  variants: {
    hasDivider: { true: { root: "border-b border-border-subtle" }, false: {} },
  },
});

export interface MenuItemRowProps extends ComponentProps<"article"> {
  name: string;
  /** Devanagari dish name, set beside the Latin one (`कुल्फी`). */
  nameDevanagari?: string | undefined;
  /** Ingredient-led, 14 words at most. */
  description?: string | undefined;
  price: number;
  was?: number | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  /** Short marker, e.g. "Bestseller" (rendered uppercase by Badge). */
  badge?: string | undefined;
  image?: MenuItemImage | undefined;
  /** What photograph belongs in the placeholder. Default "Dish photo". */
  imageLabel?: string | undefined;
  /**
   * The Add button or a QuantityStepper — the row never owns cart state. Name it with the dish
   * (`aria-label="Add Masala Fries"`), so a menu is not a list of controls all called "Add".
   */
  action?: ReactNode | undefined;
  hasDivider?: boolean | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * The menu list row: no card, a `border-subtle` hairline between items, the thumbnail on the
 * right. Every dish is vegetarian, so the DietMark always shows and there is no `diet` prop.
 */
export function MenuItemRow({
  name,
  nameDevanagari,
  description,
  price,
  was,
  spice,
  badge,
  image,
  imageLabel = "Dish photo",
  action,
  hasDivider = true,
  headingLevel = 3,
  className,
  ...props
}: MenuItemRowProps) {
  const styles = menuItemRow({ hasDivider });
  const Heading = headingTag(headingLevel);

  return (
    <article className={styles.root({ className })} {...props}>
      <div className={styles.body()}>
        <div className={styles.header()}>
          <DietMark size="sm" />
          <Heading className={styles.name()}>{name}</Heading>
          {nameDevanagari ? (
            <span lang="hi" className={styles.nameDevanagari()}>
              {nameDevanagari}
            </span>
          ) : null}
          {badge ? <Badge tone="soft">{badge}</Badge> : null}
        </div>
        <div className={styles.meta()}>
          <PriceTag amount={price} was={was} size="sm" />
          {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
        </div>
        {description ? <p className={styles.description()}>{description}</p> : null}
        {action ? <div className={styles.action()}>{action}</div> : null}
      </div>
      <ImageSlot
        ratio="square"
        radius="md"
        className={styles.thumbnail()}
        {...(image ?? { label: imageLabel })}
      />
    </article>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-row 2>&1 | tail -8`
Expected: PASS (13 tests). The `@ts-expect-error` line must be _used_: `pnpm nx typecheck @pink-paprikaa-web/ui --skip-nx-cache` passes (an unused directive would fail it).

- [ ] **Step 6: Stories — every row of `MenuItemRow.card.html`, plus Playground and OnSurfaces**

`packages/ui/src/molecules/menu-item-row/menu-item-row.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Plus } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OnSurfaces } from "../../lib/story-surfaces";
import { MenuItemRow } from "./menu-item-row";

/** The dish is folded into the name, so a menu is not a list of controls all called "Add". */
const addButton = (name: string) => (
  <Button size="sm" variant="secondary" icon={Plus} aria-label={`Add ${name}`}>
    Add
  </Button>
);

const meta = {
  title: "Molecules/MenuItemRow",
  component: MenuItemRow,
  args: {
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
    action: addButton("Paprikaa Chilli Paneer"),
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-article">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The menu list row — no card, just a `border-subtle` hairline between items. Every dish is vegetarian, so the DietMark always shows (there is no `diet` prop). Omit `image` and a labelled light-pink placeholder appears — no supplied photography exists yet. `action` takes the Add button (or a QuantityStepper); the row never owns cart state. Use `MenuItemCard` for grids and rails instead.",
      },
    },
  },
} satisfies Meta<typeof MenuItemRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "full": badge, heat, description and the Add button. */
export const Full: Story = {};

/** Card row "discount": `was` strikes the old price. */
export const Discount: Story = {
  args: {
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
    action: addButton("Mushroom Keema Pav"),
  },
};

/** Card row "devanagari" (the design system's egg variant is not built — spec C10). */
export const Devanagari: Story = {
  args: {
    name: "Gulkand Kulfi",
    nameDevanagari: "कुल्फी",
    price: 180,
    spice: 1,
    description: "Rose petal preserve, pistachio, saffron.",
    action: addButton("Gulkand Kulfi"),
  },
};

/** Card row "minimal": `hasDivider={false}`, no action. */
export const Minimal: Story = {
  args: { name: "Kulhad Chai", price: 90, hasDivider: false, action: undefined, badge: undefined },
};

/** A real section: one hairline between rows, and the last row drops its rule. */
export const AsAMenuSection: Story = {
  render: () => (
    <div>
      <MenuItemRow
        name="Paprikaa Chilli Paneer"
        nameDevanagari="पनीर"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche."
        action={addButton("Paprikaa Chilli Paneer")}
      />
      <MenuItemRow
        name="Masala Fries"
        price={190}
        was={240}
        spice={4}
        description="Masala fries, amchur, curry-leaf salt."
        action={addButton("Masala Fries")}
      />
      <MenuItemRow
        name="Kulhad Chai"
        price={90}
        description="Assam leaf, ginger, clay cup."
        action={addButton("Kulhad Chai")}
        hasDivider={false}
      />
    </div>
  ),
};

/** The four heat steps, each named ("Spice level 2 of 4") rather than left to colour. */
export const SpiceLevels: Story = {
  render: () => (
    <div>
      <MenuItemRow name="Steamed Momos" price={150} spice={1} />
      <MenuItemRow name="Honey Chilli Potato" price={220} spice={2} />
      <MenuItemRow name="Paprikaa Chilli Paneer" price={280} spice={3} />
      <MenuItemRow name="Masala Fries" price={190} spice={4} hasDivider={false} />
    </div>
  ),
};

/** Once the dish is in the cart the page swaps the action; the row never owns cart state. */
export const InCart: Story = {
  args: {
    action: (
      <Button size="sm" variant="ghost">
        In cart · 2
      </Button>
    ),
  },
};

/** 360px: the thumbnail steps down to 80px and a long name wraps instead of widening the row. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    name: "Paprikaa Chilli Paneer With Burnt Garlic",
    nameDevanagari: "पनीर",
    was: 320,
    hasDivider: false,
  },
  decorators: [
    (Story) => (
      <div className="w-90">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const row = canvas.getByRole("article");
    await expect(row.scrollWidth).toBeLessThanOrEqual(row.clientWidth);
  },
};

export const OnSurfaces: Story = {
  render: (args) => (
    <OnSurfaces>
      <div className="min-w-0 flex-1">
        <MenuItemRow {...args} hasDivider={false} />
      </div>
    </OnSurfaces>
  ),
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export {
  type MenuItemImage,
  MenuItemRow,
  type MenuItemRowProps,
} from "./molecules/menu-item-row/menu-item-row";
```

- [ ] **Step 8: Gate** — the per-task gate with `<paths>` = `packages/design-tokens/tokens/component/menu-item.json packages/ui/src/molecules/menu-item-row packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/design-tokens/tokens/component/menu-item.json packages/ui/src/molecules/menu-item-row packages/ui/src/lib/component-variants.ts packages/ui/src/index.ts
git commit -m "feat(ui): MenuItemRow molecule

The menu list row: dish name, optional Devanagari name (lang=hi), price,
heat, badge, description and an action slot, with a labelled photo
placeholder until photography exists. Every dish is vegetarian, so the
DietMark always shows and there is no diet prop — a test pins that it
does not compile.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

