import type { TrackerStep } from "@pink-paprikaa-web/ui";

import { brand } from "@pink-paprikaa-web/content";

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
