### Task 2: MenuItemCard

**Files:**

- Create: `packages/ui/src/molecules/menu-item-card/menu-item-card.tsx`, `menu-item-card.test.tsx`, `menu-item-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/menu-item-card/menu-item-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                                      | Ruling  | Where, or the spec clause                                                                            |
| ----------------------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| Dish name is a heading; price printed; `was` struck                           | ALREADY | tests "names the dish…", "prints the price…"; PriceTag owns the `<s>` (Plan 2b)                      |
| `nameAs` picks the name element                                               | ALREADY | `headingLevel` (spec §8.1)                                                                           |
| Lifts on hover only when it is a link                                         | ADD     | test "lifts only when it is a link" (Card's `hover:lift`)                                            |
| Old class asserts `rounded-4`, `shadow-elevation1`, `hover:shadow-elevation3` | DROP    | D4 (token names mirror the design system: `rounded-lg`, `shadow-1`, `shadow-3`)                      |
| One real stretched link (`after:inset-0`), not a click handler on the card    | ADD     | assertion in test "makes the name a link that covers the card"                                       |
| Plain card, no link, without `href`                                           | ADD     | test "lifts only when it is a link"                                                                  |
| `diet` / `egg` mark; `DietMarks` story                                        | DROP    | C10                                                                                                  |
| Heat named; badge over the photo                                              | ALREADY | test "shows the badge, the heat…"                                                                    |
| `onAdd` floating button                                                       | DROP    | spec §9.2 MenuItemCard: floating `action` slot                                                       |
| Floating add named after the dish ("Add Masala Cold Brew")                    | ALREADY | stories' `addAction(name)`; test "keeps the floating action a sibling…"                              |
| No add button on a card that cannot take an order                             | ADD     | test "draws no action on a card that cannot take an order"                                           |
| Labelled placeholder                                                          | ALREADY | test "labels the 4:3 photo placeholder…"                                                             |
| Photograph with its alt once supplied                                         | ADD     | test "shows the photograph once one is supplied"                                                     |
| Caller `className` replaces the card radius                                   | ADD     | test "lets a caller className replace the card radius"                                               |
| axe                                                                           | ALREADY | last test                                                                                            |
| Description clamped to two lines                                              | ADD     | `description` slot `line-clamp-2`; asserted in "shows the badge, the heat…"                          |
| `h-full` + price row pinned to the bottom so a grid of cards lines up         | ADD     | body `flex flex-1 flex-col`, footer `mt-auto`; story `InAGrid`                                       |
| `min-w-0` on the name so a long name wraps                                    | ALREADY | `name` slot; story `Narrow` play                                                                     |
| Stories `Default`, `Variants`                                                 | ALREADY | `Playground`, `Variants`                                                                             |
| Stories `InAGrid`, `Narrow` (360)                                             | ADD     | stories `InAGrid`, `Narrow` (the width decorator moves off `meta` so a grid can render — see Step 6) |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Badge` (`tone="brand"`), `Card` (`asChild`, `padding="none"`, `isInteractive`), `DietMark`, `ImageSlot` (`ratio="4:3"`), `PriceTag`, `SpiceLevel`, `headingTag`, `type LinkAs`, `type MenuItemImage` (Task 1), the `menu-item-name` token (Task 1).
- Produces: `MenuItemCard`, `type MenuItemCardProps` (contract §6). Documented default: `imageLabel = "Dish photo"`. No `diet` prop.

- [ ] **Step 1: Tokens** — none new: the name reuses `text-menu-item-name` (Task 1); offsets are scale steps (`-bottom-4.5` = 18px, `right-3.5` = 14px, `p-4.5` = 18px).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/menu-item-card/menu-item-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import type { LinkAsProps } from "../../lib/link-as";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { MenuItemCard } from "./menu-item-card";

function RouterLink(props: LinkAsProps) {
  return <a data-router="" {...props} />;
}

describe("MenuItemCard", () => {
  it("names the dish as a heading and always shows the vegetarian mark", () => {
    render(<MenuItemCard name="Masala Cold Brew" price={220} />);
    expect(screen.getByRole("heading", { level: 3, name: "Masala Cold Brew" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("takes no diet prop — every dish on the menu is vegetarian", () => {
    // @ts-expect-error — the kitchen is egg-free (spec C10): a diet prop must never compile.
    render(<MenuItemCard name="Masala Fries" price={190} diet="egg" />);
    expect(screen.getByRole("img", { name: "Vegetarian" })).toBeInTheDocument();
  });

  it("prints the price and the struck-through old price", () => {
    render(<MenuItemCard name="Masala Fries" price={190} was={240} />);
    const card = screen.getByRole("article");
    expect(card).toHaveTextContent("₹190");
    expect(card).toHaveTextContent("₹240");
  });

  it("shows the badge, the heat and the description when given", () => {
    render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        badge="New"
        description="Cold brew, jaggery, cardamom."
      />
    );
    expect(screen.getByText("New")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Spice level 1 of 4" })).toBeInTheDocument();
    // Ingredient-led, 14 words at most — the card clamps it so a grid keeps one rhythm.
    expect(screen.getByText("Cold brew, jaggery, cardamom.")).toHaveClass("line-clamp-2");
  });

  it("labels the 4:3 photo placeholder until photography exists", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.getByText("Dish photo")).toBeInTheDocument();
  });

  it("shows the photograph once one is supplied", () => {
    render(
      <MenuItemCard
        name="Kulhad Chai"
        price={90}
        image={{
          src: "/menu/kulhad-chai.avif",
          alt: "Kulhad chai in a clay cup",
          width: 420,
          height: 315,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "Kulhad chai in a clay cup" })).toHaveAttribute(
      "src",
      "/menu/kulhad-chai.avif"
    );
    expect(screen.queryByText("Dish photo")).not.toBeInTheDocument();
  });

  it("draws no action on a card that cannot take an order", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("makes the name a link that covers the card when given an href", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" />);
    const link = screen.getByRole("link", { name: "Kulhad Chai" });
    expect(link).toHaveAttribute("href", "/menu/kulhad-chai");
    // One real, focusable link stretched over the card — never a click handler on the card.
    expect(link).toHaveClass("after:inset-0");
  });

  it("lifts only when it is a link — a lift on a plain card promises a click that does nothing", () => {
    const { rerender } = render(<MenuItemCard name="Kulhad Chai" price={90} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).not.toHaveClass("hover:lift");
    rerender(<MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" />);
    expect(screen.getByRole("article")).toHaveClass("hover:lift");
  });

  it("lets a caller className replace the card radius", () => {
    render(<MenuItemCard name="Kulhad Chai" price={90} className="rounded-md" />);
    expect(screen.getByRole("article")).toHaveClass("rounded-md");
    expect(screen.getByRole("article")).not.toHaveClass("rounded-lg");
  });

  it("renders the link through the app's router link when given one", () => {
    render(
      <MenuItemCard name="Kulhad Chai" price={90} href="/menu/kulhad-chai" linkAs={RouterLink} />
    );
    expect(screen.getByRole("link", { name: "Kulhad Chai" })).toHaveAttribute("data-router");
  });

  it("keeps the floating action a sibling of the link, never nested inside it", () => {
    render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        href="/menu/masala-cold-brew"
        action={
          <button type="button" aria-label="Add Masala Cold Brew">
            +
          </button>
        }
      />
    );
    const link = screen.getByRole("link", { name: "Masala Cold Brew" });
    expect(link).not.toContainElement(screen.getByRole("button", { name: "Add Masala Cold Brew" }));
  });

  it("has no accessibility violations as a link with an action", async () => {
    const { container } = render(
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        badge="New"
        description="Cold brew, jaggery, cardamom."
        href="/menu/masala-cold-brew"
        action={
          <button type="button" aria-label="Add Masala Cold Brew">
            +
          </button>
        }
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./menu-item-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/menu-item-card/menu-item-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";
import type { MenuItemImage } from "../menu-item-row/menu-item-row";

import { Badge } from "../../atoms/badge/badge";
import { Card } from "../../atoms/card/card";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { PriceTag } from "../../atoms/price-tag/price-tag";
import { SpiceLevel } from "../../atoms/spice-level/spice-level";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

const menuItemCard = componentVariants({
  slots: {
    root: "relative flex h-full flex-col",
    media: "relative",
    badge: "absolute top-3 left-3",
    // Above the stretched link's overlay, so the Add button stays its own target.
    action: "absolute right-3.5 -bottom-4.5 z-raised",
    // flex-1 + the footer's mt-auto pin the price row to the bottom, so a grid of cards lines up.
    body: "flex flex-1 flex-col gap-2 p-4.5",
    header: "flex items-center gap-2",
    name: "text-menu-item-name min-w-0 font-display text-text-heading",
    // Stretched link: the ::after covers the whole card, so the card clicks through to the dish.
    link: "text-inherit no-underline after:absolute after:inset-0",
    description: "m-0 line-clamp-2 max-w-none text-body-sm text-text-muted",
    footer: "mt-auto flex items-center justify-between gap-2.5 pt-0.5",
  },
});

export interface MenuItemCardProps extends ComponentProps<"article"> {
  name: string;
  description?: string | undefined;
  price: number;
  was?: number | undefined;
  spice?: 1 | 2 | 3 | 4 | undefined;
  badge?: string | undefined;
  image?: MenuItemImage | undefined;
  /** What photograph belongs in the placeholder. Default "Dish photo". */
  imageLabel?: string | undefined;
  /** The floating add button (IconButton, `shadow-brand`). */
  action?: ReactNode | undefined;
  /** Makes the dish name a link that covers the card. */
  href?: string | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/**
 * Image-first dish card for grids and rails: a 4:3 photo with an overlapping floating action,
 * then the DietMark, the name, the price and the heat. With `href` the card is a link and lifts
 * on hover; the action stays a separate button.
 */
export function MenuItemCard({
  name,
  description,
  price,
  was,
  spice,
  badge,
  image,
  imageLabel = "Dish photo",
  action,
  href,
  linkAs: LinkComponent = "a",
  headingLevel = 3,
  className,
  ...props
}: MenuItemCardProps) {
  const styles = menuItemCard();
  const Heading = headingTag(headingLevel);

  return (
    <Card
      asChild
      padding="none"
      isInteractive={href !== undefined}
      className={styles.root({ className })}
    >
      <article {...props}>
        <div className={styles.media()}>
          <ImageSlot ratio="4:3" radius="none" {...(image ?? { label: imageLabel })} />
          {badge ? (
            <Badge tone="brand" className={styles.badge()}>
              {badge}
            </Badge>
          ) : null}
          {action ? <div className={styles.action()}>{action}</div> : null}
        </div>
        <div className={styles.body()}>
          <div className={styles.header()}>
            <DietMark size="sm" />
            <Heading className={styles.name()}>
              {href === undefined ? (
                name
              ) : (
                <LinkComponent href={href} className={styles.link()}>
                  {name}
                </LinkComponent>
              )}
            </Heading>
          </div>
          {description ? <p className={styles.description()}>{description}</p> : null}
          <div className={styles.footer()}>
            <PriceTag amount={price} was={was} />
            {spice === undefined ? null : <SpiceLevel level={spice} size="sm" />}
          </div>
        </div>
      </article>
    </Card>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- menu-item-card 2>&1 | tail -8`
Expected: PASS (13 tests).

- [ ] **Step 6: Stories — the `MenuItemCard.card.html` "variants" row (three 210px cards), plus Playground, AsLink, InAGrid and Narrow**

`packages/ui/src/molecules/menu-item-card/menu-item-card.stories.tsx`:

```tsx
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { Plus } from "lucide-react";
import { expect } from "storybook/test";

import { IconButton } from "../../atoms/icon-button/icon-button";
import { MenuItemCard } from "./menu-item-card";

/**
 * One card at the design system's 210px. A story decorator, not a `meta` one: Storybook
 * concatenates story and meta decorators (`decorators: []` on a story removes nothing), so a
 * meta-level width would squeeze the grid stories too.
 */
const cardWidth: Decorator = (Story) => (
  <div className="w-52.5">
    <Story />
  </div>
);

const addAction = (name: string) => (
  <IconButton
    icon={Plus}
    label={`Add ${name}`}
    variant="primary"
    size="lg"
    className="shadow-brand"
  />
);

const meta = {
  title: "Molecules/MenuItemCard",
  component: MenuItemCard,
  args: {
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
    action: addAction("Masala Cold Brew"),
  },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          'Dish card for grids and horizontal rails — the website\'s "Most Ordered" and the app home. A 4:3 image on top with an overlapping floating `+` (pink, `shadow-brand`), then DietMark + name + price. Every dish is vegetarian (no `diet` prop). Give it `href` and the name becomes a link covering the card, which then lifts −2px on hover; the action stays its own button.',
      },
    },
  },
} satisfies Meta<typeof MenuItemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = { decorators: [cardWidth] };

/** Card row "variants": badge + add, discount + add, no action. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3.5">
      <div className="w-52.5">
        <MenuItemCard
          name="Masala Cold Brew"
          price={220}
          spice={1}
          badge="New"
          description="Cold brew, jaggery, cardamom."
          action={addAction("Masala Cold Brew")}
        />
      </div>
      <div className="w-52.5">
        <MenuItemCard
          name="Masala Fries"
          price={190}
          was={240}
          spice={4}
          description="Masala fries, amchur, curry-leaf salt."
          action={addAction("Masala Fries")}
        />
      </div>
      <div className="w-52.5">
        <MenuItemCard
          name="Kulhad Chai"
          price={90}
          spice={1}
          description="Assam leaf, ginger, clay cup."
        />
      </div>
    </div>
  ),
};

/** `href`: the whole card is a link to the dish; the add button stays separate. */
export const AsLink: Story = {
  args: { href: "#masala-cold-brew" },
  decorators: [cardWidth],
};

/** Uneven descriptions still line up: the price row is pinned to the bottom of every card. */
export const InAGrid: Story = {
  render: () => (
    <div className="grid max-w-content grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MenuItemCard
        name="Paprikaa Chilli Paneer"
        price={280}
        spice={3}
        badge="Bestseller"
        description="Amritsari paneer, burnt chilli mayo, potato brioche, house pickle."
        href="#paprikaa-chilli-paneer"
        action={addAction("Paprikaa Chilli Paneer")}
      />
      <MenuItemCard
        name="Kulhad Chai"
        price={90}
        description="Assam leaf, ginger."
        href="#kulhad-chai"
        action={addAction("Kulhad Chai")}
      />
      <MenuItemCard
        name="Masala Cold Brew"
        price={220}
        spice={1}
        description="Cold brew, jaggery, cardamom."
        href="#masala-cold-brew"
        action={addAction("Masala Cold Brew")}
      />
      <MenuItemCard
        name="Masala Fries"
        price={190}
        was={240}
        spice={4}
        description="Masala fries, amchur, curry-leaf salt."
        href="#masala-fries"
        action={addAction("Masala Fries")}
      />
    </div>
  ),
};

/** 360px: a long dish name wraps inside the card instead of pushing the price out of it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: {
    name: "Paprikaa Chilli Paneer With Burnt Garlic",
    price: 280,
    was: 320,
    badge: "Bestseller",
    href: "#paprikaa-chilli-paneer",
    action: addAction("Paprikaa Chilli Paneer With Burnt Garlic"),
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
  play: async ({ canvas }) => {
    const card = canvas.getByRole("article");
    await expect(card.scrollWidth).toBeLessThanOrEqual(card.clientWidth);
  },
};
```

- [ ] **Step 7: Export**

Append to `packages/ui/src/index.ts`:

```ts
export { MenuItemCard, type MenuItemCardProps } from "./molecules/menu-item-card/menu-item-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/menu-item-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/menu-item-card packages/ui/src/index.ts
git commit -m "feat(ui): MenuItemCard molecule

Image-first dish card with a floating action slot. With href the dish
name becomes a stretched link covering the card, so the add button is
never nested inside a link; the card lifts only when it is a link.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

