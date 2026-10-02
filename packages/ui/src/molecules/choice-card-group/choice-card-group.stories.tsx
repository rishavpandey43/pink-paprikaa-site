import type { Meta, StoryObj } from "@storybook/react-vite";

import { Star } from "lucide-react";
import { expect } from "storybook/test";

import { formatRupees } from "@pink-paprikaa-web/utils";

import { Badge } from "../../atoms/badge/badge";
import { ChoiceCardGroup, type ChoiceOption } from "./choice-card-group";

/** PlanCalculator "1. Your plate" — Classic at its launch price. */
const PLATES: ChoiceOption[] = [
  {
    value: "everyday",
    title: "Everyday",
    price: formatRupees(120),
    description: "Home-style basics, kept simple.",
  },
  {
    value: "classic",
    title: "Classic",
    price: formatRupees(130),
    was: formatRupees(140),
    badge: <Badge tone="brand">Pick</Badge>,
    description: "The full Pink Paprikaa menu. Our recommendation.",
  },
  {
    value: "signature",
    title: "Signature",
    price: formatRupees(200),
    description: "A different plate, every single day.",
  },
];

const meta = {
  title: "Molecules/ChoiceCardGroup",
  component: ChoiceCardGroup,
  args: { name: "plate", legend: "1. Your plate", options: PLATES, defaultValue: "classic" },
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
          'Card-style single choice from the handoff calculators: native radios in a fieldset, so arrow keys, forms and react-hook-form\'s `register()` work unmodified (`ref`, `onChange`, `onBlur` reach every radio). `layout="tile"` stacks cards in an AutoGrid (`min`); `layout="row"` gives full-width rows with the price at the end. `tone="on-brand"` is the Home trial selector: white cards with a visible radio on a pink field. Prices arrive formatted (`formatRupees`) or as words.',
      },
    },
  },
} satisfies Meta<typeof ChoiceCardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** PlanCalculator — plate cards. */
export const Plates: Story = {
  play: async ({ canvas, userEvent }) => {
    // Real layout: the struck price reads "was", lower-case like PriceTag (R94).
    await expect(canvas.getByRole("radio", { name: "Classic ₹130 was ₹140" })).toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: /Signature/ }));
    await expect(canvas.getByRole("radio", { name: /Signature/ })).toBeChecked();
    await userEvent.keyboard("{ArrowLeft}");
    await expect(canvas.getByRole("radio", { name: /Classic/ })).toBeChecked();
  },
};

/** A status always comes with words: the error is announced and describes the group. */
export const WithError: Story = {
  args: { defaultValue: undefined, status: "error", message: "Choose a plate to see your total." },
  play: async ({ canvas, canvasElement, userEvent }) => {
    await expect(canvas.getByRole("group", { name: "1. Your plate" })).toHaveAccessibleDescription(
      "Choose a plate to see your total."
    );
    // Real layout: every card's border is the danger red, the checked one too.
    const probe = document.createElement("span");
    probe.style.color = "var(--color-status-danger)";
    canvasElement.append(probe);
    const danger = getComputedStyle(probe).color;
    probe.remove();
    await userEvent.click(canvas.getByRole("radio", { name: /Classic/ }));
    const cardOf = (name: RegExp) =>
      canvas.getByRole("radio", { name }).closest("label") ?? canvasElement;
    // Let transition-control finish, or the checked card still reads its old colour mid-fade.
    await Promise.all(
      cardOf(/Classic/)
        .getAnimations()
        .map(async (animation) => animation.finished)
    );
    const borderOf = (name: RegExp) => getComputedStyle(cardOf(name)).borderTopColor;
    await expect(borderOf(/Classic/)).toBe(danger);
    // …and loses the pink `selected` inset: every layer of its shadow is transparent.
    await expect(getComputedStyle(cardOf(/Classic/)).boxShadow).not.toMatch(/rgb\(/);
    await expect(borderOf(/Everyday/)).toBe(danger);
  },
};

/** PlanCalculator "3. How many meals" — the free-meal offer as meta. */
export const PlanLengths: Story = {
  args: {
    name: "length",
    legend: "3. How many meals",
    defaultValue: "weekday",
    options: [
      { value: "trial", title: "Trial", description: "5 meals · any days within a week" },
      {
        value: "weekday",
        title: "Weekday plan",
        description: "24 meals · Mon–Sat",
        meta: <Badge tone="success">Offer: +1 free / month</Badge>,
      },
      {
        value: "full",
        title: "Full month",
        description: "30 meals · every day",
        meta: <Badge tone="success">Offer: +1 free / month</Badge>,
      },
    ],
  },
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    // At 360 the uppercase offer Badge is wider than its tile: it truncates inside the card.
    for (const card of canvas.getAllByRole("radio").map((radio) => radio.closest("label"))) {
      await expect(card?.scrollWidth).toBeLessThanOrEqual(card?.clientWidth ?? 0);
    }
  },
};

/** DawatCalculator "2. Dawat". */
export const Dawats: Story = {
  args: {
    name: "dawat",
    legend: "2. Dawat",
    defaultValue: "signature",
    options: [
      { value: "classic", title: "Classic", price: formatRupees(149), description: "a head" },
      {
        value: "signature",
        title: "Signature",
        price: formatRupees(199),
        description: "a head · most ordered",
      },
      { value: "maharaja", title: "Maharaja", price: formatRupees(269), description: "a head" },
      {
        value: "royal",
        title: "Royal",
        price: formatRupees(549),
        description: "a head · 50+ guests",
      },
    ],
  },
};

/** DawatCalculator "4. Platter" — 200px tiles. */
export const Platters: Story = {
  args: {
    name: "platter",
    legend: "4. Platter",
    min: "sm",
    defaultValue: "",
    options: [
      { value: "", title: "No platter" },
      {
        value: "snClassic",
        title: "Classic Snacks Platter",
        price: formatRupees(99),
        description: "2 Samosa · 1 Dal Kachori · 1 Bread Pakoda · Jal Jeera or Chaas",
      },
      {
        value: "snChaat",
        title: "Chaat Snacks Platter",
        price: formatRupees(119),
        description: "Samosa Chole · Masala Papad · Pyaaz Kachori · Jal Jeera or Chaas",
      },
      {
        value: "snSandwich",
        title: "Sandwich Snacks Platter",
        price: formatRupees(129),
        description: "Veg Grilled Sandwich · Bread Pakoda · Jal Jeera or Chaas",
      },
      {
        value: "moVeg",
        title: "Veg Momos Platter",
        price: formatRupees(149),
        description: "6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure",
      },
      {
        value: "moPaneer",
        title: "Paneer Momos Platter",
        price: formatRupees(179),
        description: "6 a head: 2 Steamed + 2 Pan-Fried + 2 Kurkure",
      },
    ],
  },
};

/** DawatCalculator "7. How you want it served" — rows. */
export const Service: Story = {
  args: {
    name: "service",
    legend: "7. How you want it served",
    layout: "row",
    defaultValue: "delivered",
    options: [
      {
        value: "delivered",
        title: "Delivered",
        price: "Included",
        description: "Sealed insulated trays. Free up to 8 km, beyond billed at actual.",
      },
      {
        value: "disposables",
        title: "Delivered with disposables",
        price: `+${formatRupees(25)} a head`,
        description: "Plus plates, spoons, napkins and serving spoons.",
      },
      {
        value: "setup",
        title: "Full setup and service",
        price: "Quoted · 25+ guests",
        description:
          "Buffet tables, chafing dishes, serving staff, cleanup. Quoted for your venue.",
      },
    ],
  },
};

/** 360px: a long row price wraps under the words instead of squeezing them into a sliver. */
export const ServiceAt360: Story = {
  ...Service,
  globals: { viewport: { value: "floor360", isRotated: false } },
  play: async ({ canvas }) => {
    for (const radio of canvas.getAllByRole("radio")) {
      const card = radio.closest("label");
      const body = radio.nextElementSibling;
      await expect(card).toBeInstanceOf(HTMLElement);
      await expect(body).toBeInstanceOf(HTMLElement);
      if (card === null || body === null) return;
      await expect(body.getBoundingClientRect().width).toBeGreaterThanOrEqual(card.clientWidth / 2);
    }
  },
};

/** Home "Taste it first." — the trial selector on the brand field, 5-meal totals at the end. */
export const TrialOnBrand: Story = {
  args: {
    name: "trial",
    legend: "Trial plate",
    isLegendHidden: true,
    layout: "row",
    tone: "on-brand",
    defaultValue: "classic",
    options: [
      {
        value: "everyday",
        title: "Everyday",
        description: `${formatRupees(120)} a meal`,
        price: formatRupees(600),
      },
      {
        value: "classic",
        title: "Classic",
        badge: (
          <Badge tone="brand" icon={Star}>
            Recommended
          </Badge>
        ),
        description: `${formatRupees(130)} a meal · launch price (was ${formatRupees(140)})`,
        price: formatRupees(650),
      },
      {
        value: "signature",
        title: "Signature",
        description: `${formatRupees(200)} a meal`,
        price: formatRupees(1000),
      },
    ],
  },
  render: (args) => (
    <div data-surface="brand" className="rounded-xl bg-surface-brand p-7">
      <ChoiceCardGroup {...args} />
    </div>
  ),
};

/** HomelyMeals "30 seconds to decide" — question rows. */
export const DecideList: Story = {
  args: {
    name: "decide",
    legend: "Not sure which one?",
    isLegendHidden: true,
    layout: "row",
    defaultValue: "full",
    options: [
      { value: "taste", title: "“I want to taste it first”" },
      { value: "full", title: "“I want the full Pink Paprikaa experience”" },
      { value: "basics", title: "“I just want the basics, kept simple”" },
      { value: "spoiled", title: "“I want to feel a little spoiled every day”" },
      { value: "both", title: "“I don’t want to think about lunch or dinner”" },
      { value: "household", title: "“Two or more of us live together”" },
      { value: "group", title: "“I’m ordering for a PG, hostel or office”" },
    ],
  },
};
