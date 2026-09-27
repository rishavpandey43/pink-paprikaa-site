import { render, screen } from "@testing-library/react";
import { MessageCircle } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { InstagramGlyph, LinkedinGlyph, YoutubeGlyph } from "./brand-glyphs";
import { Icon } from "./icon";

describe("Icon", () => {
  it("is hidden from assistive tech when it has no label", () => {
    const { container } = render(<Icon icon={MessageCircle} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("is announced as an image with its label when given one", () => {
    render(<Icon icon={MessageCircle} label="WhatsApp" />);
    expect(screen.getByRole("img", { name: "WhatsApp" })).toBeInTheDocument();
  });

  it.each([
    ["xs", "size-icon-xs", "2"],
    ["sm", "size-icon-sm", "2"],
    ["md", "size-icon-md", "1.75"],
    ["lg", "size-icon-lg", "1.75"],
    ["xl", "size-icon-xl", "1.75"],
  ] as const)("renders size %s with the %s box and stroke %s", (size, sizeClass, stroke) => {
    const { container } = render(<Icon icon={MessageCircle} size={size} />);
    expect(container.firstElementChild).toHaveClass(sizeClass);
    expect(container.querySelector("svg")).toHaveAttribute("stroke-width", stroke);
  });

  it.each([InstagramGlyph, YoutubeGlyph, LinkedinGlyph])(
    "renders the brand glyph %o like any icon",
    (glyph) => {
      const { container } = render(<Icon icon={glyph} label="Social" />);
      expect(container.querySelector("svg")).toHaveAttribute("stroke", "currentColor");
    }
  );

  it("has no accessibility violations", async () => {
    const { container } = render(<Icon icon={MessageCircle} label="WhatsApp" />);
    await expectNoA11yViolations(container);
  });
});
