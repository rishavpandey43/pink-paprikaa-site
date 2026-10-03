import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  ArrowRight,
  CirclePause,
  MessageCircle,
  RefreshCw,
  ShoppingBag,
  Store,
  Truck,
  Utensils,
} from "lucide-react";

import { Badge } from "../../atoms/badge/badge";
import { Button } from "../../atoms/button/button";
import { DietMark } from "../../atoms/diet-mark/diet-mark";
import { Icon } from "../../atoms/icon/icon";
import { ImageSlot } from "../../atoms/image-slot/image-slot";
import { Typography } from "../../atoms/typography/typography";
import { OfferSeal } from "../../molecules/offer-seal/offer-seal";
import { BRAND, VIEWPORT_1280, VIEWPORT_360, VIEWPORT_768 } from "../story-fixtures";
import { HeroBanner } from "./hero-banner";

/**
 * A blank bitmap standing in for a photograph, so the scrim over it shows in review. A fixture,
 * not a design decision — no photography exists yet, which is what ImageSlot's placeholder is for.
 */
const BLANK_PHOTOGRAPH =
  "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='5'%3E%3Crect width='4' height='5' fill='white'/%3E%3C/svg%3E";

const VEG_BADGE = (
  <Badge color="success">
    <DietMark size="sm" />
    100% Pure Veg
  </Badge>
);

const meta = {
  title: "Organisms/HeroBanner",
  component: HeroBanner,
  args: {
    overline: "India’s First Desi Urban Café",
    title: "Desi at heart. Urban by nature.",
    body: "Pure veg lunch and dinner from our restaurant kitchen in MKM Market, Sector 57.",
    meta: ["Est. 2025", "Sector 57, Gurgaon", "Open till 11:30pm"],
    actions: (
      <>
        <Button asChild size="lg" icon={ShoppingBag}>
          <a href={BRAND.orderOnlineHref}>Order Now</a>
        </Button>
        <Button asChild variant="secondary" size="lg" iconAfter={ArrowRight}>
          <a href="#menu">See Full Menu</a>
        </Button>
      </>
    ),
    media: (
      <ImageSlot ratio="4:5" radius="xl" label="Hero food photography 4:5" className="shadow-4" />
    ),
  },
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          'The top of any marketing page. The headline is fluid display type, so it never overflows; `titleSize="display-2"` for long ones. Tones brand/ink/soft flood the field with the diamond; `alt` is the handoff\'s pink-50 tint with no pattern. Buttons inside take no colour props — the tone sets the surface. `media` holds an ImageSlot and any overlay (an OfferSeal positions itself on the media column).',
      },
    },
  },
} satisfies Meta<typeof HeroBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Card row: `tone="brand"` (default), split. */
export const BrandSplit: Story = { args: { tone: "brand" } };

/** Card row: `tone="soft"` + `layout="center"`. */
export const SoftCentred: Story = {
  args: {
    tone: "soft",
    layout: "center",
    overline: "Homely Meals",
    title: "Home-style food, delivered every day.",
    body: "One dal, one sabji, rice, roti and salad in every box.",
    meta: [],
    media: undefined,
    actions: (
      <Button asChild size="lg">
        <a href="#plans">See plans</a>
      </Button>
    ),
  },
};

/** The ink tone named on the card. */
export const InkSplit: Story = { args: { tone: "ink" } };

/** Handoff Home — pink-50 split hero with the launch OfferSeal on the photo. */
export const HandoffHome: Story = {
  args: {
    tone: "alt",
    overline: undefined,
    badges: (
      <>
        <Badge color="brand" variant="solid">
          Homely Meals by Pink Paprikaa
        </Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Pure veg homely meals, delivered every day.",
    body: (
      <>
        <span className="block font-display text-h2-fluid font-black text-text-brand">
          ₹130 a meal. Try 5 meals for ₹650.
        </span>
        <span className="mt-3 flex items-center gap-2 text-body-sm">
          <Icon icon={Store} size="sm" />
          From the Pink Paprikaa restaurant kitchen, MKM Market, Sector 57
        </span>
      </>
    ),
    actions: (
      <>
        <Button asChild size="lg" iconAfter={ArrowRight}>
          <a href="#trial">Start a trial, ₹650</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#plans">See plans</a>
        </Button>
      </>
    ),
    meta: [
      <span key="delivery" className="inline-flex items-center gap-1.5">
        <Icon icon={Truck} size="sm" />
        Free delivery within 3 km
      </span>,
      <span key="pause" className="inline-flex items-center gap-1.5">
        <Icon icon={CirclePause} size="sm" />
        Pause any day
      </span>,
      <span key="menu" className="inline-flex items-center gap-1.5">
        <Icon icon={RefreshCw} size="sm" />
        New menu daily
      </span>,
    ],
    media: (
      <>
        <ImageSlot
          ratio="4:3"
          radius="xl"
          label="PHOTO: Homely Meals box — dal, rice, sabji, tawa roti, salad, raita and chutney"
        />
        <OfferSeal
          value="₹130"
          label="Launch"
          size="md"
          color="brand"
          corner="top-right"
          bleed="none"
        />
      </>
    ),
  },
};

/** Handoff Catering — brand flood with the diamond and a display-2 headline. */
export const HandoffCatering: Story = {
  args: {
    tone: "brand",
    titleSize: "display-2",
    overline: undefined,
    badges: (
      <>
        <Badge color="neutral" variant="solid">
          Pink Paprikaa Catering
        </Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Feeding thirty people? It has to be right the first time.",
    body: (
      <>
        <span className="block">
          We cook it in our own restaurant kitchen in Sector 57 — the same tandoor, the same cooks,
          the same food our dine-in guests eat every day. Tell us the date and headcount. We take it
          from there.
        </span>
        <span className="mt-4 block font-display text-h2-fluid font-black text-text-heading">
          From ₹99 per person.
        </span>
      </>
    ),
    actions: (
      <>
        <Button asChild variant="inverse" size="lg" iconAfter={ArrowRight}>
          <a href="#dawat-builder">Build your Dawat</a>
        </Button>
        <Button asChild variant="secondary" size="lg" icon={Utensils}>
          <a href={BRAND.whatsappHref}>Taste it first</a>
        </Button>
      </>
    ),
    meta: [
      "One kitchen, no shared surfaces, pure vegetarian — ever. Jain and satvik menus on request.",
    ],
    media: (
      <ImageSlot
        ratio="4:3"
        radius="xl"
        fill="strong"
        label="PHOTO: Real Dawat spread from our kitchen — tandoori roti, paneer, dal"
      />
    ),
  },
};

/** Handoff Office & PG Lunch — pink-50 split hero. */
export const HandoffOffice: Story = {
  args: {
    tone: "alt",
    overline: undefined,
    badges: (
      <>
        <Badge color="brand" variant="solid">
          Office &amp; PG Lunch
        </Badge>
        {VEG_BADGE}
      </>
    ),
    title: "Team lunch from ₹99 a meal.",
    body: "For offices and PGs with 20+ people at one address. Fixed slot, one GST invoice a month, free tasting first.",
    actions: (
      <>
        <Button asChild size="lg" icon={MessageCircle}>
          <a href={BRAND.whatsappHref}>Get a free office tasting</a>
        </Button>
        <Button asChild variant="secondary" size="lg">
          <a href="#quote">See my cost</a>
        </Button>
      </>
    ),
    meta: [],
    media: (
      <ImageSlot
        ratio="4:3"
        radius="xl"
        label="PHOTO: Team eating Pink Paprikaa boxes at an office pantry"
      />
    ),
  },
};

/** The title alone — everything else on the hero is optional. */
export const HeadlineOnly: Story = {
  args: { overline: undefined, body: undefined, meta: [], actions: undefined, media: undefined },
};

/**
 * A real photograph with a line printed on it: the media slot layers the `scrim-bottom` gradient
 * under the caption so it stays legible whatever the picture does. Only over a photograph — over
 * a placeholder the scrim would dim the crop note.
 */
export const WithPhotograph: Story = {
  args: {
    media: (
      <div className="relative">
        <ImageSlot
          src={BLANK_PHOTOGRAPH}
          alt=""
          width={4}
          height={5}
          ratio="4:5"
          radius="xl"
          className="shadow-4"
        />
        <div aria-hidden className="absolute inset-0 rounded-xl scrim-bottom" />
        <Typography
          as="p"
          variant="body"
          weight="bold"
          color="inverse"
          className="absolute inset-x-6 bottom-6"
        >
          From our restaurant kitchen, MKM Market, Sector 57
        </Typography>
      </div>
    ),
  },
};

export const Mobile: Story = { ...HandoffHome, globals: VIEWPORT_360 };
export const Tablet: Story = { ...HandoffHome, globals: VIEWPORT_768 };
export const Desktop: Story = { ...HandoffHome, globals: VIEWPORT_1280 };
