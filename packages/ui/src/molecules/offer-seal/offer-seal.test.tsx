import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OfferSeal } from "./offer-seal";

const CORNERS = ["top-right", "top-left", "bottom-right", "bottom-left"] as const;

/** The seal's outward offset per axis, read from its `translate-{x,y}-a/b` classes. */
function bleedFractions(seal: Element | null): number[] {
  const classes = seal?.getAttribute("class") ?? "";
  return [...classes.matchAll(/translate-[xy]-(\d+)\/(\d+)/g)].map(
    (match) => Number(match[1]) / Number(match[2])
  );
}

describe("OfferSeal", () => {
  it("reads as the value, the label and the note", () => {
    render(<OfferSeal value="50%" label="Off" note="till 11:30pm" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.getByText("till 11:30pm")).toBeInTheDocument();
  });

  it("renders the value alone when there is nothing else to say", () => {
    const { container } = render(<OfferSeal value="1+1" />);
    expect(container.firstElementChild).toHaveTextContent(/^1\+1$/);
  });

  it("is a rotated diamond, never a circle, with the text counter-rotated upright", () => {
    const { container } = render(<OfferSeal value="1+1" label="Free" />);
    expect(container.firstElementChild).toHaveClass("rotate-45", "rounded-offer-seal");
    expect(screen.getByText("1+1").parentElement).toHaveClass("-rotate-45");
  });

  it.each([
    ["sm", "text-offer-seal-sm"],
    ["md", "text-offer-seal-md"],
    ["lg", "text-offer-seal-lg"],
    ["xl", "text-offer-seal-xl"],
  ] as const)("scales the whole seal from one size step (%s)", (size, sizeClass) => {
    const { container } = render(<OfferSeal value="50%" size={size} />);
    expect(container.firstElementChild).toHaveClass(sizeClass, "size-offer-seal");
  });

  it.each([
    ["light", "bg-ink-000", "text-pink-600"],
    ["brand", "bg-pink-500", "text-ink-000"],
    ["turmeric", "bg-turmeric", "text-ink-900"],
  ] as const)("paints the %s tone", (tone, background, text) => {
    const { container } = render(<OfferSeal value="50%" tone={tone} />);
    expect(container.firstElementChild).toHaveClass(background, text);
    // One flat fill — never a gradient, never a starburst.
    expect(container.firstElementChild?.getAttribute("class")).not.toMatch(/gradient/);
  });

  it("sits in flow when it does not bleed", () => {
    const { container } = render(<OfferSeal value="50%" />);
    expect(container.firstElementChild).not.toHaveClass("absolute");
    expect(bleedFractions(container.firstElementChild)).toEqual([]);
  });

  it("reserves room for its rotated tips in flow, but not when it bleeds", () => {
    // A rotated square's tips overhang its layout box by ~0.15 × side; rotate-45 is not layout.
    const { container, rerender } = render(<OfferSeal value="50%" />);
    expect(container.firstElementChild).toHaveClass("m-offer-seal-clear");
    rerender(<OfferSeal value="50%" bleed="md" />);
    expect(container.firstElementChild).not.toHaveClass("m-offer-seal-clear");
  });

  it("drops the note at sm, where it would print below a legible size", () => {
    render(<OfferSeal value="50%" label="Off" note="till 11:30pm" size="sm" />);
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.queryByText("till 11:30pm")).not.toBeInTheDocument();
  });

  it.each(CORNERS)(
    "never bleeds a corner further than 0.18 × its side (%s) — the value reaches 0.32 × side from the centre",
    (corner) => {
      for (const bleed of ["sm", "md"] as const) {
        const { container, unmount } = render(
          <OfferSeal value="50%" label="Off" corner={corner} bleed={bleed} />
        );
        const fractions = bleedFractions(container.firstElementChild);
        expect(container.firstElementChild).toHaveClass("absolute");
        expect(fractions).toHaveLength(2);
        for (const fraction of fractions) expect(fraction).toBeLessThanOrEqual(0.18);
        unmount();
      }
    }
  );

  it("lets a caller className replace its own shadow", () => {
    const { container } = render(<OfferSeal value="50%" className="shadow-2" />);
    expect(container.firstElementChild).toHaveClass("shadow-2");
    expect(container.firstElementChild).not.toHaveClass("shadow-3");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <OfferSeal value="₹130" label="Launch" tone="brand" size="md" />
        <OfferSeal value="50%" label="Off" note="till 11:30pm" tone="light" size="lg" />
        <OfferSeal value="1+1" label="Free" tone="turmeric" size="sm" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
