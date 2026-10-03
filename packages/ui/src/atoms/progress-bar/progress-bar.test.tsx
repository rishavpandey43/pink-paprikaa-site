import { render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("shows loyalty stamps: one segment per stamp, the earned ones filled", () => {
    render(<ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />);
    const bar = screen.getByRole("progressbar", { name: "3 more visits and chai's on us" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "6");
    expect(bar).toHaveAttribute("aria-valuenow", "3");
    expect(bar).toHaveAttribute("aria-valuetext", "3 of 6");
    expect(bar.children).toHaveLength(6);
    expect([...bar.children].filter((segment) => segment.childElementCount > 0)).toHaveLength(3);
  });

  it("fills a continuous bar to the value's share of max", () => {
    render(<ProgressBar label="Checkout" value={70} />);
    const bar = screen.getByRole("progressbar", { name: "Checkout" });
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "70");
    expect(bar).not.toHaveAttribute("aria-valuetext");
    expect(bar.querySelector("[style]")).toHaveAttribute("style", "width: 70%;");
  });

  it.each([
    [140, "100", "width: 100%;"],
    [-20, "0", "width: 0%;"],
  ])("clamps %d into the track", (value, now, width) => {
    render(<ProgressBar label="Checkout" value={value} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", now);
    expect(bar.querySelector("[style]")).toHaveAttribute("style", width);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])(
    "rejects the value %d it cannot draw",
    (value) => {
      expect(() => renderToString(<ProgressBar label="Checkout" value={value} />)).toThrow(
        RangeError
      );
    }
  );

  it("rejects a max it cannot divide by", () => {
    expect(() => renderToString(<ProgressBar label="Checkout" value={0} max={0} />)).toThrow(
      RangeError
    );
  });

  it("rejects a segment count that is not a whole number", () => {
    expect(() => renderToString(<ProgressBar label="Visits" value={1} segments={2.5} />)).toThrow(
      RangeError
    );
  });

  it("fills by the real share of any max", () => {
    render(<ProgressBar label="Upload" value={50} max={200} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "200");
    expect(bar.querySelector("[style]")).toHaveAttribute("style", "width: 25%;");
  });

  it("makes the segment count the scale, ignoring max", () => {
    render(<ProgressBar label="Visits" max={100} segments={6} value={4} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemax", "6");
    expect(bar).toHaveAttribute("aria-valuenow", "4");
  });

  it("merges a caller className onto the root, replacing a conflicting class", () => {
    const { container } = render(<ProgressBar label="Upload" value={50} className="gap-6" />);
    expect(container.firstElementChild).toHaveClass("gap-6");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("sx lands on the root and beats its own gap", () => {
    const { container } = render(<ProgressBar label="Upload" value={50} sx={{ gap: 6, mt: 4 }} />);
    expect(container.firstElementChild).toHaveClass("gap-6", "mt-4");
    expect(container.firstElementChild).not.toHaveClass("gap-2");
  });

  it("can hide its label visually and keep the name", () => {
    render(<ProgressBar label="Upload" value={45} isLabelHidden />);
    expect(screen.getByText("Upload")).toHaveClass("sr-only");
    expect(screen.getByRole("progressbar", { name: "Upload" })).toBeInTheDocument();
  });

  it.each([
    ["brand", "bg-pink-200", "bg-pink-500"],
    ["success", "bg-pink-200", "bg-mint"],
    ["inverse", "bg-white-alpha-28", "bg-ink-000"],
  ] as const)("paints color %s: %s track, %s fill", (color, track, fill) => {
    render(<ProgressBar label="Visits" segments={2} value={1} color={color} />);
    const [earned] = screen.getByRole("progressbar").children;
    expect(earned).toHaveClass(track);
    expect(earned?.firstElementChild).toHaveClass(fill);
  });

  it.each([
    ["sm", "h-progress-sm"],
    ["md", "h-progress-md"],
  ] as const)("renders size %s at %s", (size, height) => {
    render(<ProgressBar label="Visits" value={1} size={size} />);
    expect(screen.getByRole("progressbar")).toHaveClass(height);
  });

  it("has no accessibility violations as stamps, continuous and a hidden-label mint bar", async () => {
    const { container } = render(
      <>
        <ProgressBar label="3 more visits and chai's on us" segments={6} value={3} />
        <ProgressBar label="Uploading your photo" value={70} />
        <ProgressBar label="Kitchen prep" value={45} color="success" isLabelHidden />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
