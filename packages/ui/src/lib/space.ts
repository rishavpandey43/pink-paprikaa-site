/**
 * The design system's spacing steps (readme §3.3). Step N is N × 4px — `6` is 24px, always — so a
 * layout takes a step number, never a length. Steps 1–12 run in ones, then 14, 16, 18, 20, 24 and
 * 32 (56–128px); the half steps 0.5 (2px) and 1.5 (6px) exist for optical nudges.
 */
export type SpaceStep =
  0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 14 | 16 | 18 | 20 | 24 | 32;

/**
 * The gap utility for each step. Every value is a complete literal class name, so Tailwind's
 * scanner (`@source "./"` in styles.css) emits it — never assemble these strings at runtime.
 * Layouts pass this map straight to `componentVariants` as their `space` variant.
 */
export const GAP_CLASS: Readonly<Record<SpaceStep, string>> = {
  0: "gap-0",
  0.5: "gap-0.5",
  1: "gap-1",
  1.5: "gap-1.5",
  2: "gap-2",
  3: "gap-3",
  4: "gap-4",
  5: "gap-5",
  6: "gap-6",
  7: "gap-7",
  8: "gap-8",
  9: "gap-9",
  10: "gap-10",
  11: "gap-11",
  12: "gap-12",
  14: "gap-14",
  16: "gap-16",
  18: "gap-18",
  20: "gap-20",
  24: "gap-24",
  32: "gap-32",
};
