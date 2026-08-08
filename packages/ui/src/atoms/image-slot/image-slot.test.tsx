import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ImageSlot } from "./image-slot";

describe("ImageSlot", () => {
  it("renders a labelled placeholder when no photograph exists yet", () => {
    render(<ImageSlot label="Hero 16:9, warm, close-cropped" />);
    expect(screen.getByText("Hero 16:9, warm, close-cropped")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders the photograph once one is supplied", () => {
    render(<ImageSlot alt="Chilli paneer" src="/paneer.jpg" />);
    const photo = screen.getByRole("img", { name: "Chilli paneer" });
    expect(photo).toHaveAttribute("src", "/paneer.jpg");
    expect(photo).toHaveClass("object-cover");
  });

  it("drops the placeholder caption once a photograph is supplied", () => {
    render(<ImageSlot label="Dish photo" src="/paneer.jpg" />);
    expect(screen.queryByText("Dish photo")).not.toBeInTheDocument();
  });

  it.each([
    ["square", "aspect-[1/1]"],
    ["4:3", "aspect-[4/3]"],
    ["3:4", "aspect-[3/4]"],
    ["4:5", "aspect-[4/5]"],
    ["16:9", "aspect-[16/9]"],
    ["16:10", "aspect-[16/10]"],
    ["wide", "aspect-[21/9]"],
  ] as const)("holds the %s crop open", (ratio, expected) => {
    const { container } = render(<ImageSlot label="Dish photo" ratio={ratio} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("cannot collapse when the photograph is missing", () => {
    const { container } = render(<ImageSlot />);
    expect(container.firstElementChild).toHaveClass("aspect-[4/3]", "w-full");
  });

  it.each([
    ["soft", "bg-pink-100", "text-pink-400"],
    ["strong", "bg-pink-200", "text-pink-700"],
    ["ink", "bg-ink-200", "text-ink-500"],
  ] as const)("tints the %s placeholder", (tone, ground, ink) => {
    const { container } = render(<ImageSlot label="Dish photo" tone={tone} />);
    expect(container.firstElementChild).toHaveClass(ground);
    expect(screen.getByText("Dish photo")).toHaveClass(ink);
  });

  it.each([
    ["none", "rounded-none"],
    ["thumb", "rounded-3"],
    ["card", "rounded-4"],
    ["sheet", "rounded-5"],
  ] as const)("rounds the %s corner", (radius, expected) => {
    const { container } = render(<ImageSlot radius={radius} />);
    expect(container.firstElementChild).toHaveClass(expected);
  });

  it("swaps the ratio for the parent's height when it fills a panel", () => {
    const { container } = render(<ImageSlot isFullHeight ratio="16:9" />);
    const node = container.firstElementChild;
    expect(node).toHaveClass("h-full");
    expect(node?.className).not.toMatch(/aspect-/);
  });

  it("merges a caller className", () => {
    const { container } = render(<ImageSlot className="rounded-6" />);
    expect(container.firstElementChild).toHaveClass("rounded-6");
    expect(container.firstElementChild).not.toHaveClass("rounded-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <ImageSlot label="Hero 4:5, warm, close-cropped" ratio="4:5" />
        <ImageSlot alt="Chilli paneer" src="/paneer.jpg" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
