import { render } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Skeleton } from "./skeleton";

const WIDTHS = ["w-full", "w-11/12", "w-2/3", "w-5/6"];
const widthOf = (element: Element) => WIDTHS.find((width) => element.classList.contains(width));

describe("Skeleton", () => {
  it("is hidden from assistive tech — the container announces loading, not the placeholder", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("is a 16px light-pink block by default, pulsing only when motion is allowed", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveClass(
      "h-4",
      "w-full",
      "rounded-sm",
      "bg-pink-100",
      "motion-safe:animate-skeleton"
    );
  });

  it("is sized and shaped by className", () => {
    const { container } = render(<Skeleton className="h-18 rounded-lg" />);
    expect(container.firstElementChild).toHaveClass("h-18", "rounded-lg");
    expect(container.firstElementChild).not.toHaveClass("h-4", "rounded-sm");
  });

  it("draws a circle", () => {
    const { container } = render(<Skeleton variant="circle" className="size-8" />);
    expect(container.firstElementChild).toHaveClass("rounded-pill", "size-8");
  });

  it("draws three text lines by default", () => {
    const { container } = render(<Skeleton variant="text" />);
    expect(container.firstElementChild?.children).toHaveLength(3);
  });

  it("varies the line widths, cycling, so a paragraph never reads as a grid of bars", () => {
    const { container } = render(<Skeleton variant="text" lines={6} />);
    const lines = [...(container.firstElementChild?.children ?? [])];
    expect(lines.map(widthOf)).toEqual([
      "w-full",
      "w-11/12",
      "w-2/3",
      "w-5/6",
      "w-full",
      "w-11/12",
    ]);
  });

  it("spaces text lines by className too", () => {
    const { container } = render(<Skeleton variant="text" lines={2} className="gap-6" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("has no accessibility violations as block, lines and circle in a named loading region", async () => {
    const { container } = render(
      <div role="status" aria-label="Loading the menu" aria-busy="true">
        <Skeleton className="h-18 rounded-lg" />
        <Skeleton variant="text" lines={3} />
        <Skeleton variant="circle" />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
