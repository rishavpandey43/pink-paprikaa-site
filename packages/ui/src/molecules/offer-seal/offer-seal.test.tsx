import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OfferSeal } from "./offer-seal";

describe("OfferSeal", () => {
  it("prints the value, the label and the note", () => {
    render(<OfferSeal label="Off" note="till 11:30pm" value="50%" />);

    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getByText("Off")).toBeInTheDocument();
    expect(screen.getByText("till 11:30pm")).toBeInTheDocument();
  });

  it("renders the value alone when there is nothing else to say", () => {
    render(<OfferSeal value="1+1" />);

    expect(screen.getByText("1+1")).toBeInTheDocument();
    expect(screen.queryByText("till 11:30pm")).not.toBeInTheDocument();
  });

  it("prints a rupee value as written, with no space and no decimals", () => {
    render(<OfferSeal label="Only" value="₹99" />);
    expect(screen.getByText("₹99")).toBeInTheDocument();
  });

  it("rotates the diamond and counter-rotates its text so the number stays upright", () => {
    const { container } = render(<OfferSeal value="50%" />);
    const root = container.firstElementChild;

    expect(root).toHaveClass("rotate-45");
    expect(root?.firstElementChild).toHaveClass("-rotate-45");
  });

  it.each([
    ["light", "bg-surface-card"],
    ["brand", "bg-brand-primary"],
    ["turmeric", "bg-turmeric"],
  ] as const)("fills the %s tone flat, with no gradient", (tone, expected) => {
    const { container } = render(<OfferSeal tone={tone} value="50%" />);
    const root = container.firstElementChild;

    expect(root).toHaveClass(expected);
    expect(root?.className).not.toMatch(/gradient/);
  });

  it.each([
    ["sm", "size-32"],
    ["md", "size-48"],
    ["lg", "size-70"],
  ] as const)("renders the %s seal at its fixed diagonal", (size, expected) => {
    const { container } = render(<OfferSeal size={size} value="50%" />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("sits in the flow until a corner is asked for", () => {
    const { container } = render(<OfferSeal value="50%" />);
    expect(container.firstElementChild).not.toHaveClass("absolute");
  });

  it.each([
    ["topLeft", "-translate-x-[18%]"],
    ["topRight", "translate-x-[18%]"],
    ["bottomLeft", "translate-y-[18%]"],
    ["bottomRight", "translate-y-[18%]"],
  ] as const)("hangs off the %s corner by a clamped self offset", (position, expected) => {
    const { container } = render(<OfferSeal position={position} value="50%" />);
    const root = container.firstElementChild;

    expect(root).toHaveClass("absolute");
    expect(root).toHaveClass(expected);
  });

  it("merges a caller className", () => {
    const { container } = render(<OfferSeal className="rounded-1" value="50%" />);
    const node = container.firstElementChild;

    expect(node).toHaveClass("rounded-1");
    expect(node).not.toHaveClass("rounded-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <OfferSeal label="Off" note="till 11:30pm" value="50%" />
        <OfferSeal label="Only" tone="brand" value="₹99" />
        <OfferSeal label="Free" size="sm" tone="turmeric" value="1+1" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
