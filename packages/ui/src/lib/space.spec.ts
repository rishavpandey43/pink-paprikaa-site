import { GAP_CLASS, type SpaceStep } from "./space";

/** The design system's spacing steps (readme §3.3): 0, the half steps, 1–12, then 14 … 32. */
const STEPS: SpaceStep[] = [
  0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 32,
];

describe("GAP_CLASS", () => {
  it("covers exactly the design system's steps — no more, no fewer", () => {
    const keys = Object.keys(GAP_CLASS)
      .map(Number)
      .sort((a, b) => a - b);
    expect(keys).toEqual(STEPS);
  });

  it.each(STEPS)("maps step %s to its literal gap class, so Tailwind scans it", (step) => {
    expect(GAP_CLASS[step]).toBe(`gap-${String(step)}`);
  });
});
