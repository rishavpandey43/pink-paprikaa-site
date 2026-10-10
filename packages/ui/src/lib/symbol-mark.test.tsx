import { render } from "@testing-library/react";

import { SymbolMark } from "./symbol-mark";

describe("SymbolMark", () => {
  it("paints the shared symbol mask in currentColor, hidden from assistive tech", () => {
    const { container } = render(<SymbolMark className="size-4" />);
    const mark = container.firstElementChild;
    expect(mark?.tagName).toBe("SPAN");
    expect(mark).toHaveClass("mask-symbol", "size-4");
    expect(mark).toHaveAttribute("aria-hidden", "true");
  });

  it("carries no path data, so a page of marks ships the symbol once (R19)", () => {
    const { container } = render(<SymbolMark />);
    expect(container.innerHTML).not.toContain("<path");
    expect(container.innerHTML).not.toContain("<svg");
  });
});
