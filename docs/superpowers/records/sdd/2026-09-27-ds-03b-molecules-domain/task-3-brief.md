### Task 3: OutletCard

**Files:**

- Create: `packages/ui/src/molecules/outlet-card/outlet-card.tsx`, `outlet-card.test.tsx`, `outlet-card.stories.tsx`
- Modify: `packages/ui/src/index.ts`

**Dev reference:** `git show dev:packages/ui/src/molecules/outlet-card/outlet-card.{tsx,test.tsx,stories.tsx}`

**Dev parity:**

| Dev item                                                          | Ruling  | Where, or the spec clause                                                                                  |
| ----------------------------------------------------------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| Outlet name is a heading; city, address, hours printed            | ALREADY | tests "names the outlet…", "puts the address in an address element…"                                       |
| `nameAs` picks the name element                                   | ALREADY | `headingLevel`; ADD test "uses the heading level the page needs"                                           |
| Status in words for open / busy / closed; `statusLabel` overrides | ALREADY | `it.each` status test, "lets the page override the status words"                                           |
| `href` → one stretched link over the card (`after:inset-0`)       | ADD     | `href` + `linkAs` props (deviation 17; spec §9.2 row lists `href`, §8.2 `onClick` → `href`)                |
| Hover lift only when the card is a link                           | ADD     | `isInteractive={href !== undefined}`; test "becomes one stretched link that lifts only when given an href" |
| Secondary action stays clickable above the stretched link         | ADD     | `action` slot `relative z-raised`; test "keeps the action outside the stretched link…"                     |
| Labelled 16:9 placeholder; `hasImage={false}` drops it            | ALREADY | test "shows the labelled 16:9 placeholder…"                                                                |
| Photograph with its alt once supplied                             | ADD     | test "shows the outlet photograph once one is supplied"                                                    |
| Caller `className` replaces the card radius                       | ADD     | test "lets a caller className replace the card radius"                                                     |
| axe                                                               | ALREADY | last test (now with `href`)                                                                                |
| `h-full` so a locator row of cards shares one height              | ADD     | root `relative flex h-full flex-col`                                                                       |
| Header wraps so the status drops under a long name at 360         | ALREADY | `top` slot `flex-wrap`; story `Narrow` play                                                                |
| `StatusDot size="sm"`                                             | DROP    | D2 — the design-system `OutletCard.jsx` renders StatusDot at its default size                              |
| Stories `Default`, `WithImage`, `CompactWithAction`               | ALREADY | `Playground`, `WithImage`, `WithoutImage`                                                                  |
| Stories `StatusStates`, `CustomStatusLine`, `Narrow` (360)        | ADD     | stories `StatusStates`, `CustomStatusLine`, `Narrow`                                                       |

Implementer: copy this table into your report, extended with anything the plan missed.

**Interfaces:**

- Consumes: `Card` (`isInteractive`), `ImageSlot` (`ratio="16:9"`), `Icon`, `StatusDot` (`tone="open" | "busy" | "closed"`), `headingTag`, `type LinkAs`, `type MenuItemImage`.
- Produces: `OutletCard`, `type OutletCardProps` (contract §6 + deviation 17: `href`, `linkAs`). Documented defaults: `status = "open"`; status words "Open now" / "Busy" / "Closed" (`statusLabel` overrides); `imageLabel = "Outlet interior 16:9"`; `hasImage = true`.

- [ ] **Step 1: Tokens** — none new (`text-h4`, `text-overline`, `p-4.5`, `gap-2.5` are all on the scales).

- [ ] **Step 2: Write the failing test**

`packages/ui/src/molecules/outlet-card/outlet-card.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OutletCard } from "./outlet-card";

const ADDRESS = "Booth No. 67P, HSVP Market (MKM Market), Sector 57";

describe("OutletCard", () => {
  it("names the outlet as a heading under its city", () => {
    render(<OutletCard city="Gurgaon" name="Sector 57" />);
    expect(screen.getByRole("heading", { level: 3, name: "Sector 57" })).toBeInTheDocument();
    expect(screen.getByText("Gurgaon")).toBeInTheDocument();
  });

  it.each([
    ["open", "Open now"],
    ["busy", "Busy"],
    ["closed", "Closed"],
  ] as const)("says %s in words, never by colour alone", (status, word) => {
    render(<OutletCard name="Sector 57" status={status} />);
    expect(screen.getByText(word)).toBeInTheDocument();
  });

  it("lets the page override the status words", () => {
    render(<OutletCard name="Sector 57" status="closed" statusLabel="Opens at 8am" />);
    expect(screen.getByText("Opens at 8am")).toBeInTheDocument();
  });

  it("puts the address in an address element and shows the hours", () => {
    const { container } = render(
      <OutletCard name="Sector 57" address={ADDRESS} hours="8am – 11:30pm" />
    );
    expect(container.querySelector("address")).toHaveTextContent(ADDRESS);
    expect(screen.getByText("8am – 11:30pm")).toBeInTheDocument();
  });

  it("shows the labelled 16:9 placeholder by default and drops the image for the list form", () => {
    const { rerender } = render(<OutletCard name="Sector 57" />);
    expect(screen.getByText("Outlet interior 16:9")).toBeInTheDocument();
    rerender(<OutletCard name="Sector 57" hasImage={false} />);
    expect(screen.queryByText("Outlet interior 16:9")).not.toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(<OutletCard name="Sector 57" action={<a href="https://maps.example">Directions</a>} />);
    expect(screen.getByRole("link", { name: "Directions" })).toBeInTheDocument();
  });

  it("uses the heading level the page needs", () => {
    render(<OutletCard name="Sector 57" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Sector 57" })).toBeInTheDocument();
  });

  it("shows the outlet photograph once one is supplied", () => {
    render(
      <OutletCard
        name="Sector 57"
        image={{
          src: "/outlets/sector-57.avif",
          alt: "The dine-in room at Sector 57",
          width: 640,
          height: 360,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "The dine-in room at Sector 57" })).toHaveAttribute(
      "src",
      "/outlets/sector-57.avif"
    );
  });

  it("becomes one stretched link that lifts only when given an href", () => {
    const { rerender } = render(<OutletCard name="Sector 57" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).not.toHaveClass("hover:lift");
    rerender(<OutletCard name="Sector 57" href="/outlets/sector-57" />);
    const link = screen.getByRole("link", { name: "Sector 57" });
    expect(link).toHaveAttribute("href", "/outlets/sector-57");
    expect(link).toHaveClass("after:inset-0");
    expect(screen.getByRole("article")).toHaveClass("hover:lift");
  });

  it("keeps the action outside the stretched link, raised above its overlay", () => {
    render(
      <OutletCard
        name="Sector 57"
        href="/outlets/sector-57"
        action={<a href="https://maps.example">Directions</a>}
      />
    );
    const directions = screen.getByRole("link", { name: "Directions" });
    expect(screen.getByRole("link", { name: "Sector 57" })).not.toContainElement(directions);
    expect(directions.parentElement).toHaveClass("z-raised");
  });

  it("lets a caller className replace the card radius", () => {
    render(<OutletCard name="Sector 57" className="rounded-md" />);
    expect(screen.getByRole("article")).toHaveClass("rounded-md");
    expect(screen.getByRole("article")).not.toHaveClass("rounded-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OutletCard
        city="Gurgaon"
        name="Sector 57"
        address={ADDRESS}
        hours="8am – 11:30pm"
        href="/outlets/sector-57"
        action={<a href="https://maps.example">Directions</a>}
      />
    );
    await expectNoA11yViolations(container);
  });
});
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- outlet-card 2>&1 | tail -8`
Expected: FAIL — cannot resolve `./outlet-card`.

- [ ] **Step 4: Implement**

`packages/ui/src/molecules/outlet-card/outlet-card.tsx`:

```tsx
import type { ComponentProps, ReactNode } from "react";

import type { LinkAs } from "../../lib/link-as";
import type { MenuItemImage } from "../menu-item-row/menu-item-row";

import { Clock, MapPin } from "lucide-react";

import { Card } from "../../atoms/card/card";
import { Icon } from "../../atoms/icon/icon";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { StatusDot } from "../../atoms/status-dot/status-dot";
import { componentVariants } from "../../lib/component-variants";
import { type HeadingLevel, headingTag } from "../../lib/heading";

type OutletStatus = "open" | "busy" | "closed";

/** Status in plain words (design-system OutletCard); `statusLabel` overrides. */
const STATUS_WORD: Readonly<Record<OutletStatus, string>> = {
  open: "Open now",
  busy: "Busy",
  closed: "Closed",
};

const outletCard = componentVariants({
  slots: {
    // relative anchors the stretched link; h-full lets a locator row of cards share one height.
    root: "relative flex h-full flex-col",
    body: "grid gap-2.5 p-4.5",
    top: "flex flex-wrap items-start justify-between gap-3",
    titles: "min-w-0",
    city: "m-0 max-w-none font-display text-overline text-text-brand uppercase",
    name: "mt-1 font-display text-h4 text-text-heading",
    // Stretched link: the ::after covers the whole card, so the card clicks through to the outlet.
    link: "text-inherit no-underline after:absolute after:inset-0",
    detail: "m-0 flex max-w-none items-start gap-2 text-body-sm text-text-muted not-italic",
    detailIcon: "mt-0.5",
    // Above the stretched link's overlay, so Directions stays its own target.
    action: "relative z-raised mt-1",
  },
});

export interface OutletCardProps extends ComponentProps<"article"> {
  name: string;
  city?: string | undefined;
  address?: string | undefined;
  /** 12-hour lowercase with an en dash: "8am – 11:30pm". */
  hours?: string | undefined;
  status?: OutletStatus | undefined;
  /** Replaces the status word ("Open now" / "Busy" / "Closed"). */
  statusLabel?: string | undefined;
  image?: MenuItemImage | undefined;
  imageLabel?: string | undefined;
  /** `false` gives the compact list form without imagery. */
  hasImage?: boolean | undefined;
  action?: ReactNode | undefined;
  /** The outlet's page. The name becomes a link covering the card, which then lifts on hover. */
  href?: string | undefined;
  linkAs?: LinkAs | undefined;
  headingLevel?: HeadingLevel | undefined;
}

/** One café location — the website locator and the app outlet picker. Status is a StatusDot. */
export function OutletCard({
  name,
  city,
  address,
  hours,
  status = "open",
  statusLabel,
  image,
  imageLabel = "Outlet interior 16:9",
  hasImage = true,
  action,
  href,
  linkAs: LinkComponent = "a",
  headingLevel = 3,
  className,
  ...props
}: OutletCardProps) {
  const styles = outletCard();
  const Heading = headingTag(headingLevel);

  return (
    <Card
      asChild
      padding="none"
      isInteractive={href !== undefined}
      className={styles.root({ className })}
    >
      <article {...props}>
        {hasImage ? (
          <ImageSlot ratio="16:9" radius="none" {...(image ?? { label: imageLabel })} />
        ) : null}
        <div className={styles.body()}>
          <div className={styles.top()}>
            <div className={styles.titles()}>
              {city ? <p className={styles.city()}>{city}</p> : null}
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
            <StatusDot tone={status} label={statusLabel ?? STATUS_WORD[status]} />
          </div>
          {address ? (
            <address className={styles.detail()}>
              <Icon icon={MapPin} size="sm" className={styles.detailIcon()} />
              {address}
            </address>
          ) : null}
          {hours ? (
            <p className={styles.detail()}>
              <Icon icon={Clock} size="sm" className={styles.detailIcon()} />
              {hours}
            </p>
          ) : null}
          {action ? <div className={styles.action()}>{action}</div> : null}
        </div>
      </article>
    </Card>
  );
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache -- outlet-card 2>&1 | tail -8`
Expected: PASS (14 tests).

- [ ] **Step 6: Stories — `OutletCard.card.html` rows "with image" (open + closed) and `image={false}` (busy + Directions), with the real outlet facts (spec C6)**

`packages/ui/src/molecules/outlet-card/outlet-card.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowUpRight } from "lucide-react";
import { expect } from "storybook/test";

import { Button } from "../../atoms/button/button";
import { OutletCard } from "./outlet-card";

const ADDRESS = "Booth No. 67P, HSVP Market (MKM Market), Sector 57";
const HOURS = "8am – 11:30pm";

const meta = {
  title: "Molecules/OutletCard",
  component: OutletCard,
  args: { city: "Gurgaon", name: "Sector 57", address: ADDRESS, hours: HOURS },
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
          "One café location — the website locator and the app outlet picker. Pass `hasImage={false}` for the compact list variant. Status is a StatusDot with a word, never a coloured pill. Pass `href` and the whole card becomes one real link that lifts on hover; the `action` stays its own control above it.",
      },
    },
  },
} satisfies Meta<typeof OutletCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row "with image": open and closed side by side. */
export const WithImage: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-3.5">
      <OutletCard {...args} />
      <OutletCard {...args} status="closed" />
    </div>
  ),
};

/** Card row `hasImage={false}`: the list form, busy, with a Directions action. */
export const WithoutImage: Story = {
  args: {
    hasImage: false,
    status: "busy",
    action: (
      <Button asChild size="sm" variant="ghost" iconAfter={ArrowUpRight}>
        <a href="https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon">Directions</a>
      </Button>
    ),
  },
};

/** The three trading states, each in words — colour never carries it alone. */
export const StatusStates: Story = {
  render: (args) => (
    <div className="grid gap-3.5 md:grid-cols-3">
      <OutletCard {...args} hasImage={false} status="open" />
      <OutletCard {...args} hasImage={false} status="busy" />
      <OutletCard {...args} hasImage={false} status="closed" />
    </div>
  ),
};

/** `statusLabel` when "Open now" is not specific enough. */
export const CustomStatusLine: Story = {
  args: { hasImage: false, statusLabel: "Open till 11:30pm" },
};

/** 360px, linked: the status drops under a long name instead of squeezing it. */
export const Narrow: Story = {
  globals: { viewport: { value: "floor360" } },
  args: { href: "#sector-57", name: "Sector 57 · MKM Market", statusLabel: "Open till 11:30pm" },
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

```ts
export { OutletCard, type OutletCardProps } from "./molecules/outlet-card/outlet-card";
```

- [ ] **Step 8: Gate** — `<paths>` = `packages/ui/src/molecules/outlet-card packages/ui/src/index.ts`.

- [ ] **Step 9: Commit**

```bash
git add packages/ui/src/molecules/outlet-card packages/ui/src/index.ts
git commit -m "feat(ui): OutletCard molecule

A café location with its city, status in words, address (in an address
element), hours and an action slot; hasImage={false} gives the compact
list form.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

