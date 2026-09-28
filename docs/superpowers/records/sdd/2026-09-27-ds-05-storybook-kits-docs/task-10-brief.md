### Task 10: Kit fixtures and the Website kit

Sources: `ui_kits/website/{index.html,Sections.jsx,README.md}`; handoff `design/rates.js` (`google.reviews`, `catering.faqs`, `links.directions`); the design system's organism defaults (`components/organisms/*.jsx` — MenuList, TestimonialWall, FaqSection, SiteHeader, SiteFooter, OrderTracker), passed explicitly because this system's components carry no copy (D9).

**Facts rule for every kit:** layouts and sample copy come from the design system; every _fact_ — year, address, hours, legal lines, contact, outlet — comes from `@pink-paprikaa-web/content`. The kit's invented testimonials (three named guests) are replaced by the four verified Google reviews; its invented "4.6 average guest rating" and "18 spices" stats are replaced by brand facts; its FAQ line about egg-containing bakes is replaced (the kitchen is egg-free); its "chilli paneer at midnight" is replaced by the real hours.

**Files:**

- Replace: `apps/storybook/src/kits/fixtures.ts`
- Create: `apps/storybook/src/kits/{kit-notice.tsx,expect-no-overflow.ts}`, `apps/storybook/src/kits/website/{website-kit.tsx,website.stories.tsx}`

**Dev reference:** none (dev has no reference kits). Dev's landmark findings for the components this kit composes are Task 0 A21.

**Interfaces:**

- Consumes: `brand`, `toBrandLines` (content); ui organisms/molecules per the imports below.
- Produces: fixtures `OUTLET`, `BUILD_YEAR`, `ORDER_STEPS` (unchanged from Task 2), `GOOGLE_REVIEWS`, `MENU_ITEMS`, `MENU_CATEGORIES`, `FEATURED_DISH`, `SAMPLE_CART`, `NAV_LINKS`, `FOOTER_COLUMNS`, `SOCIAL_LINKS`, `FAQS`, `GUEST_OPTIONS`, `BOOKING_SLOTS`, `DIRECTIONS_URL`; `KitNotice`, `KIT_NOTICE`; `expectNoHorizontalOverflow(canvasElement, width)`; `WebsiteKit`; stories `Website/Homepage` → `Homepage`, `Homepage360`.

- [ ] **Step 1: The fixtures**

Replace `apps/storybook/src/kits/fixtures.ts`:

```ts
import { brand } from "@pink-paprikaa-web/content";

import type {
  AccordionItem,
  CartLine,
  FooterColumn,
  MenuListItem,
  NavLink,
  ReviewCardProps,
  SelectOption,
  SlotOption,
  TrackerStep,
} from "@pink-paprikaa-web/ui";

/**
 * Reference-kit fixtures. Layouts and sample copy come from the design system's ui_kits; every
 * fact — year, address, hours, legal lines, contact, outlet — comes from @pink-paprikaa-web/content,
 * and the only reviews are the four verified Google reviews from the handoff (design/rates.js →
 * google.reviews). Nothing here is non-veg, not even egg.
 */

const [flagship] = brand.outlets;
if (flagship === undefined) {
  throw new Error("storybook: the brand facts list no outlet (packages/content)");
}

/** The outlet every specimen, kit and pattern names. */
export const OUTLET = flagship;

/** The year the legal lines print — read once when Storybook is built, as an app does at build. */
export const BUILD_YEAR = new Date().getFullYear();

/** Order steps from the design system's OrderTracker. */
export const ORDER_STEPS: TrackerStep[] = [
  { label: "Order in", note: "Kitchen's on it." },
  { label: "On the tandoor", note: "Chilli paneer is charring." },
  { label: "Ready for pickup", note: "Counter 2, ask for Paprikaa." },
];

/** Google Maps directions to the outlet — the handoff's links.directions. */
export const DIRECTIONS_URL = "https://maps.google.com/?q=Pink+Paprikaa+Sector+57+Gurgaon";

/**
 * The four verified Google reviews, as the guests wrote them — spelling and emoji included. Never
 * edit a review. One elision ("[…]") removes a guest's one-a spelling of the brand name, because
 * the two-a spelling is a hard rule in this repository; nothing else is changed.
 */
export const GOOGLE_REVIEWS: ReviewCardProps[] = [
  {
    name: "Raj Chrome",
    meta: "Restaurant · Google review",
    rating: 5,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/uGhWvzmZW7To5etbA" },
    quote:
      "I ordered Mahararaja Thali, steamed Momos and other few extras for the first time. The experience and taste was great😋 A1. Restaurant customer support over phone were well spoken. I will recommend this to my friends. Looking forward to order more […]. Packing was great👌Hatts of Team",
  },
  {
    name: "Vikas Kumar",
    meta: "Restaurant · Google review",
    rating: 5,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/32n6SYDUMejsa3NeA" },
    quote: "Very nice and economical food or very tasty food as home",
  },
  {
    name: "Abhishek Aggarwal",
    meta: "Restaurant · Google review",
    rating: 4,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/GB38hi9T2G2UfQdG9" },
    quote: "Good place for indian main course at reasonable price in gurgaon sector 57",
  },
  {
    name: "Shrideep Chatterjee",
    meta: "Restaurant · Google review",
    rating: 4,
    isVerified: true,
    hasAvatar: false,
    source: { label: "View on Google", href: "https://maps.app.goo.gl/s1ghZv4qg3f773Gn8" },
    quote: "Had Honey chili potato and it was good 👍",
  },
];

/** The design system's sample dishes (ui_kits) — every one vegetarian, not even egg. */
export const MENU_ITEMS: MenuListItem[] = [
  {
    id: "paprikaa-chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    spice: 3,
    category: "Small Plates",
    badge: "Bestseller",
    description: "Amritsari paneer, burnt chilli mayo, potato brioche.",
  },
  {
    id: "mushroom-keema-pav",
    name: "Mushroom Keema Pav",
    price: 340,
    was: 380,
    spice: 2,
    category: "Small Plates",
    description: "Slow-cooked mushroom keema, buttered pav, pickled onion.",
  },
  {
    id: "masala-cold-brew",
    name: "Masala Cold Brew",
    price: 220,
    spice: 1,
    category: "Chai & Coffee",
    badge: "New",
    description: "Cold brew, jaggery, cardamom.",
  },
  {
    id: "kulhad-chai",
    name: "Kulhad Chai",
    price: 90,
    spice: 1,
    category: "Chai & Coffee",
    description: "Assam leaf, ginger, clay cup.",
  },
  {
    id: "bombay-toastie",
    name: "Bombay Toastie",
    price: 240,
    spice: 2,
    category: "All Day",
    description: "Green chutney, potato, amul butter, coal-grilled.",
  },
  {
    id: "tandoori-paneer-bowl",
    name: "Tandoori Paneer Bowl",
    price: 420,
    spice: 3,
    category: "All Day",
    description: "Charred paneer, burnt garlic rice, pickled slaw.",
  },
  {
    id: "gulkand-kulfi",
    name: "Gulkand Kulfi",
    price: 180,
    spice: 1,
    category: "Sweets",
    description: "Rose petal preserve, pistachio, saffron.",
  },
  {
    id: "masala-fries",
    name: "Masala Fries",
    price: 190,
    spice: 4,
    category: "Small Plates",
    description: "Masala fries, amchur, curry-leaf salt.",
  },
];

export const MENU_CATEGORIES = [...new Set(MENU_ITEMS.map((item) => item.category))];

const [featured] = MENU_ITEMS;
if (featured === undefined) throw new Error("kits: MENU_ITEMS is empty");

/** The dish the app kit opens first. */
export const FEATURED_DISH = featured;

export const SAMPLE_CART: CartLine[] = [
  {
    id: "paprikaa-chilli-paneer",
    name: "Paprikaa Chilli Paneer",
    price: 280,
    quantity: 1,
    note: "Regular · Hot",
  },
  { id: "kulhad-chai", name: "Kulhad Chai", price: 90, quantity: 2, note: "Regular · Mild" },
];

export const NAV_LINKS: NavLink[] = [
  { label: "Menu", href: "#menu" },
  { label: "Our Story", href: "#story" },
  { label: "Outlets", href: "#outlets" },
  { label: "Franchise", href: "#franchise" },
  { label: "Careers", href: `mailto:${brand.contact.careersEmail}` },
];

const WHATSAPP_URL = `https://wa.me/${brand.contact.whatsapp.replace("+", "")}`;

/** The design system's footer columns, trimmed to links that exist, plus the real contact lines. */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: "Eat",
    items: [
      { label: "Full Menu", href: "#menu" },
      { label: "Small Plates", href: "#menu" },
      { label: "Chai & Coffee", href: "#menu" },
      { label: "Sweets", href: "#menu" },
    ],
  },
  {
    heading: "Visit",
    items: [
      { label: "Outlets", href: "#outlets" },
      { label: "Book a Table", href: "#book" },
      { label: "Directions", href: DIRECTIONS_URL },
    ],
  },
  {
    heading: "Company",
    items: [
      { label: "Our Story", href: "#story" },
      { label: "Franchise", href: `mailto:${brand.contact.franchiseEmail}` },
      { label: "Careers", href: `mailto:${brand.contact.careersEmail}` },
    ],
  },
  {
    heading: "Contact",
    items: [
      { label: brand.contact.phoneDisplay, href: `tel:${brand.contact.phone}` },
      { label: "WhatsApp", href: WHATSAPP_URL },
      { label: brand.contact.email, href: `mailto:${brand.contact.email}` },
    ],
  },
];

export const SOCIAL_LINKS = brand.social.map((profile) => ({
  network: profile.network,
  href: profile.url,
  label: profile.handle,
}));

/** Real answers only: the brand facts, and the handoff's catering FAQ on Jain food. */
export const FAQS: AccordionItem[] = [
  {
    value: "veg",
    question: "Is everything vegetarian?",
    answer: `Yes. ${brand.vegStatement} Nothing non-veg, not even egg.`,
  },
  { value: "hours", question: "When are you open?", answer: `${brand.hours.display}.` },
  { value: "where", question: "Where are you?", answer: `${OUTLET.address}.` },
  {
    value: "jain",
    question: "Can you make Jain or satvik food?",
    answer:
      "Yes. No onion, no garlic, and no root vegetables if you need. Tell us when you book, not on the day — it changes how we shop.",
  },
];

export const GUEST_OPTIONS: SelectOption[] = [
  { value: "2", label: "2 guests" },
  { value: "3", label: "3 guests" },
  { value: "4", label: "4 guests" },
  { value: "6", label: "6 guests" },
];

export const BOOKING_SLOTS: SlotOption[] = [
  { value: "7:30pm", label: "7:30pm" },
  { value: "8:00pm", label: "8:00pm" },
  { value: "8:30pm", label: "8:30pm" },
  { value: "9:00pm", label: "9:00pm", isDisabled: true },
];
```

- [ ] **Step 2: The notice and the 360px assertion**

Create `apps/storybook/src/kits/kit-notice.tsx`:

```tsx
import { Badge } from "@pink-paprikaa-web/ui";

export const KIT_NOTICE = "Reference kit — not production copy";

export interface KitNoticeProps {
  /** The design-system kit this page reproduces, e.g. `ui_kits/website`. */
  source: string;
}

/** The badge every kit page carries: a layout reference with real facts, not shippable copy. */
export function KitNotice({ source }: KitNoticeProps) {
  return (
    <div
      role="note"
      className="flex w-full flex-wrap items-center gap-3 border-b border-border-subtle bg-surface-sunken px-gutter py-2"
    >
      <Badge tone="warning">{KIT_NOTICE}</Badge>
      <span className="font-mono text-mono text-text-muted">
        {source} · facts from @pink-paprikaa-web/content · reviews verbatim from Google
      </span>
    </div>
  );
}
```

Create `apps/storybook/src/kits/expect-no-overflow.ts`:

```ts
import { expect } from "storybook/test";

/**
 * Every design must survive the 360px floor (readme §3.10): the story really ran at `width`, and
 * nothing on the page scrolls sideways.
 */
export async function expectNoHorizontalOverflow(
  canvasElement: HTMLElement,
  width: number
): Promise<void> {
  const page = canvasElement.ownerDocument.documentElement;
  await expect(canvasElement.ownerDocument.defaultView?.innerWidth).toBe(width);
  await expect(
    page.scrollWidth,
    `the page is ${String(page.scrollWidth)}px wide at a ${String(page.clientWidth)}px viewport`
  ).toBeLessThanOrEqual(page.clientWidth);
}
```

- [ ] **Step 3: Write the failing Website stories (Review Focus 3)**

Create `apps/storybook/src/kits/website/website.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, screen, within } from "storybook/test";

import { expectNoHorizontalOverflow } from "../expect-no-overflow";
import { FEATURED_DISH } from "../fixtures";
import { KIT_NOTICE } from "../kit-notice";
import { WebsiteKit } from "./website-kit";

const meta = {
  title: "Website/Homepage",
  component: WebsiteKit,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "The design system's website kit (ui_kits/website), composed only from @pink-paprikaa-web/ui. Layouts and sample copy are the design system's; every fact is from @pink-paprikaa-web/content, and the reviews are the four verified Google reviews. Interactions: add a dish (header count + pop toast), book a table (two-step dialog), the header turns to glass on scroll. Reference kit — not production copy.",
      },
    },
  },
} satisfies Meta<typeof WebsiteKit>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Homepage: Story = {
  play: async ({ canvas, userEvent }) => {
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();

    await userEvent.click(canvas.getByRole("button", { name: `Add ${FEATURED_DISH.name}` }));
    await expect(
      await screen.findByText(`${FEATURED_DISH.name} added to your order.`)
    ).toBeVisible();

    await userEvent.click(
      within(canvas.getByRole("banner")).getByRole("button", { name: "Book a Table" })
    );
    const booking = await screen.findByRole("dialog", { name: "Book a table" });
    await userEvent.click(within(booking).getByRole("button", { name: "Hold My Table" }));
    await expect(
      await screen.findByRole("dialog", { name: "Table held for 10 minutes" })
    ).toBeVisible();
  },
};

export const Homepage360: Story = {
  name: "Homepage at 360px",
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas, canvasElement }) => {
    await expectNoHorizontalOverflow(canvasElement, 360);
    await expect(canvas.getByText(KIT_NOTICE)).toBeVisible();
    await expect(canvas.getByRole("button", { name: "Menu" })).toBeVisible();
  },
};
```

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- website.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./website-kit"`.

- [ ] **Step 4: The Website kit**

Create `apps/storybook/src/kits/website/website-kit.tsx`:

```tsx
import { ArrowRight, ArrowUpRight, Phone, Plus, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import {
  AutoGrid,
  Badge,
  Button,
  Card,
  Cluster,
  CtaBand,
  Dialog,
  FaqSection,
  Field,
  HeroBanner,
  IconButton,
  ImageSlot,
  Input,
  Logo,
  MenuList,
  type MenuListItem,
  OutletCard,
  Section,
  SectionHeader,
  Select,
  SiteFooter,
  SiteHeader,
  SlotPicker,
  SpiceLevel,
  Stack,
  Stat,
  StatBand,
  TestimonialWall,
  Text,
  Toast,
  ToastProvider,
} from "@pink-paprikaa-web/ui";

import {
  BOOKING_SLOTS,
  BUILD_YEAR,
  DIRECTIONS_URL,
  FAQS,
  FOOTER_COLUMNS,
  GOOGLE_REVIEWS,
  GUEST_OPTIONS,
  MENU_CATEGORIES,
  MENU_ITEMS,
  NAV_LINKS,
  OUTLET,
  SOCIAL_LINKS,
} from "../fixtures";
import { KitNotice } from "../kit-notice";

const LINES = toBrandLines(brand, BUILD_YEAR);
const OUTLET_OPTIONS = brand.outlets.map((outlet) => ({
  value: outlet.id,
  label: `${outlet.name}, ${outlet.city}`,
}));

/** The design system's marketing homepage (ui_kits/website), composed from the library. */
export function WebsiteKit() {
  const [cartCount, setCartCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isBooked, setIsBooked] = useState(false);
  const [slot, setSlot] = useState("8:00pm");

  function addToOrder(item: MenuListItem) {
    setCartCount((count) => count + 1);
    setToast(`${item.name} added to your order.`);
  }

  function openBooking() {
    setIsBooked(false);
    setIsBooking(true);
  }

  const bookButton = (
    <Button variant="secondary" size="sm" onClick={openBooking}>
      Book a Table
    </Button>
  );
  const orderButton = (
    <Button size="sm" icon={ShoppingBag} asChild>
      <a href="#menu">Order Now</a>
    </Button>
  );

  return (
    <ToastProvider duration={2600} label="Notifications">
      <KitNotice source="ui_kits/website" />
      <SiteHeader
        homeHref="#top"
        links={NAV_LINKS}
        badge={<Badge tone="success">Pure veg</Badge>}
        actions={
          <>
            <IconButton icon={Search} label="Search the menu" variant="ghost" />
            <IconButton icon={ShoppingBag} label="Your order" variant="ghost" count={cartCount} />
            {bookButton}
            {orderButton}
          </>
        }
        drawerActions={
          <>
            {bookButton}
            {orderButton}
          </>
        }
      />

      <main id="main">
        <HeroBanner
          overline={brand.tagline}
          title={brand.statement}
          body={`We roast our own masala every morning, then build the rest of the day around it. Open ${brand.hours.display}.`}
          meta={[
            `Est. ${String(brand.established)}`,
            `${OUTLET.name}, ${OUTLET.city}`,
            brand.hours.weekday,
          ]}
          media={
            <ImageSlot
              ratio="4:5"
              radius="xl"
              label="Hero food photography 4:5 — warm, close-cropped"
            />
          }
          actions={
            <>
              <Button size="lg" icon={ShoppingBag} asChild>
                <a href="#menu">Order Now</a>
              </Button>
              <Button size="lg" variant="secondary" iconAfter={ArrowRight} asChild>
                <a href="#menu">See Full Menu</a>
              </Button>
            </>
          }
        />

        <MenuList
          id="menu"
          items={MENU_ITEMS}
          categories={MENU_CATEGORIES}
          overline="The Menu"
          title="Most ordered this week"
          note="100% Vegetarian"
          variant="grid"
          gridCount={4}
          action={
            <Button variant="ghost" iconAfter={ArrowRight} asChild>
              <a href="#menu">See Full Menu</a>
            </Button>
          }
          renderItemAction={(item) => (
            <IconButton
              icon={Plus}
              label={`Add ${item.name}`}
              size="sm"
              onClick={() => {
                addToOrder(item);
              }}
            />
          )}
        />

        <Section id="story" tone="alt">
          <AutoGrid min="lg" className="items-center">
            <div className="grid grid-cols-2 gap-4">
              <ImageSlot ratio="3:4" tone="strong" radius="lg" label="Kitchen portrait 3:4" />
              <ImageSlot ratio="3:4" radius="lg" label="Masala grinding 3:4" className="mt-10" />
            </div>
            <Stack space={4}>
              <SectionHeader overline="Our Story" title="A café that tastes like where it's from" />
              <Text variant="body-lg">
                We started in one Gurgaon market with a chai counter and a grinder. The idea was
                simple: a café that runs on Indian flavour instead of borrowing someone else&apos;s.
              </Text>
              <Text variant="body-lg">
                Every masala is roasted in-house each morning. Every dish is built to be shared,
                argued over, and ordered again.
              </Text>
              <Cluster space={4}>
                <Card variant="feature" className="min-w-50 flex-1">
                  <Stat
                    value={String(brand.outlets.length)}
                    label={`kitchen, ${OUTLET.name} ${OUTLET.city}`}
                    tone="brand"
                  />
                </Card>
                <Card variant="feature" className="flex min-w-50 flex-1 flex-col gap-1.5">
                  <SpiceLevel level={4} hasLabel />
                  <Text variant="body-sm">the heat scale we cook to</Text>
                </Card>
              </Cluster>
              <Button variant="secondary" iconAfter={ArrowRight} className="self-start" asChild>
                <a href="#story">Read Our Story</a>
              </Button>
            </Stack>
          </AutoGrid>
        </Section>

        <StatBand
          stats={[
            { value: String(brand.established), label: `established in ${OUTLET.city}` },
            { value: "100%", label: "vegetarian kitchen" },
            { value: brand.hours.weekday, label: "every day" },
          ]}
        />

        <TestimonialWall
          overline="Guests"
          title="What people actually say"
          reviews={GOOGLE_REVIEWS}
        />

        <Section id="outlets">
          <Stack space={8}>
            <SectionHeader overline="Outlets" title="Find a Paprikaa" />
            <AutoGrid min="lg">
              {brand.outlets.map((outlet) => (
                <OutletCard
                  key={outlet.id}
                  name={outlet.name}
                  city={outlet.city}
                  address={outlet.address}
                  hours={outlet.hours ?? brand.hours.display}
                  imageLabel="Outlet interior 16:9"
                  action={
                    <Button size="sm" variant="ghost" iconAfter={ArrowUpRight} asChild>
                      <a href={outlet.mapsUrl ?? DIRECTIONS_URL} target="_blank" rel="noreferrer">
                        Directions
                      </a>
                    </Button>
                  }
                />
              ))}
            </AutoGrid>
          </Stack>
        </Section>

        <FaqSection
          overline="Questions"
          title="The things people ask"
          lede="Everything guests ask us at the counter."
          items={FAQS}
        />

        <CtaBand
          id="franchise"
          overline="Franchise"
          title="Bring Pink Paprikaa to your city"
          body="One kitchen, one playbook. Franchise applications are open."
          action={
            <Button size="lg" iconAfter={ArrowRight} asChild>
              <a href={`mailto:${brand.contact.franchiseEmail}`}>Apply to Franchise</a>
            </Button>
          }
        />
      </main>

      <SiteFooter
        tone="brand"
        brand={
          <Stack space={3}>
            <Logo tone="white" className="w-50" />
            <Text variant="body-sm">{`${brand.statement} ${brand.hours.display}.`}</Text>
            <Badge tone="soft" className="self-start">
              {brand.vegStatement}
            </Badge>
            <Text variant="caption">{LINES.fssai}</Text>
          </Stack>
        }
        columns={FOOTER_COLUMNS}
        social={SOCIAL_LINKS}
        legal={
          <>
            <span>{LINES.copyright}</span>
            <span>{LINES.gstin}</span>
            <span>{LINES.cin}</span>
          </>
        }
        policies={brand.policies.map((policy) => ({
          label: policy,
          href: `#${policy.toLowerCase()}`,
        }))}
      />

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
          },
        }}
      >
        {toast ?? ""}
      </Toast>

      <Dialog
        open={isBooking}
        onOpenChange={setIsBooking}
        variant="modal"
        size="sm"
        title={isBooked ? "Table held for 10 minutes" : "Book a table"}
        footer={
          isBooked ? (
            <Button
              onClick={() => {
                setIsBooking(false);
              }}
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsBooking(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsBooked(true);
                }}
              >
                Hold My Table
              </Button>
            </>
          )
        }
      >
        {isBooked ? (
          <Text>{`We'll text you the confirmation. See you at ${OUTLET.name}.`}</Text>
        ) : (
          <Stack space={4}>
            <Field label="Outlet">
              {(control) => <Select {...control} options={OUTLET_OPTIONS} />}
            </Field>
            <Field label="Guests">
              {(control) => <Select {...control} options={GUEST_OPTIONS} defaultValue="2" />}
            </Field>
            <SlotPicker
              name="time"
              legend="Time"
              slots={BOOKING_SLOTS}
              value={slot}
              onValueChange={setSlot}
              columns={4}
            />
            <Field label="Mobile number" isRequired>
              {(control) => (
                <Input
                  {...control}
                  type="tel"
                  icon={Phone}
                  placeholder="98765 43210"
                  autoComplete="tel"
                />
              )}
            </Field>
          </Stack>
        )}
      </Dialog>
    </ToastProvider>
  );
}
```

Run the Step 3 command → PASS (both stories; axe included).

- [ ] **Step 5: Probe the 360px test (Review Focus 3)**

Temporarily add `<div className="w-200" />` (800px) as the first child of `<main>`; rerun; expect `Homepage360` FAIL with `the page is 8…px wide at a 360px viewport`. Remove; rerun green. Paste both.

- [ ] **Step 6: Visual parity check, gate and commit**

Serve the source kit and Storybook side by side and compare at 1280 and 360 (layout, rhythm, surfaces; differences expected only in copy that became real facts, and font rasterisation):

```bash
pnpm exec serve "zip-files/Pink Paprikaa Design System" -l 6008   # open /ui_kits/website/index.html
pnpm nx run @pink-paprikaa-web/storybook:serve                      # Website → Homepage
```

List any layout difference with its reason in the report.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- website.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check
git add apps/storybook/src/kits
git commit -m "feat(storybook): the Website reference kit

The design system's homepage composed only from the library: header, hero,
menu, story, stats, reviews, outlets, FAQ, franchise band, footer, the pop
toast and the two-step booking dialog. Facts come from the brand module; the
invented testimonials, rating and spice count are replaced by the four
verified Google reviews and real brand facts. Tested at the 360px floor.

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

