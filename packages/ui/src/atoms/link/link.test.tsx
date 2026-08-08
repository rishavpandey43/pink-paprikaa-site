import type { MouseEvent } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MapPin } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Link } from "./link";

describe("Link", () => {
  it("renders an anchor pointing at its destination", () => {
    render(<Link href="/menu">See the full menu</Link>);
    expect(screen.getByRole("link", { name: "See the full menu" })).toHaveAttribute(
      "href",
      "/menu"
    );
  });

  it("carries the brand link colour by default", () => {
    render(<Link href="/menu">See the full menu</Link>);
    expect(screen.getByRole("link")).toHaveClass("text-text-link");
  });

  it.each([
    ["default", "text-text-link"],
    ["subtle", "text-text-muted"],
    ["inverse", "text-text-on-brand"],
    ["quiet", "text-text-body"],
  ] as const)("renders the %s variant", (variant, expected) => {
    render(
      <Link href="/menu" variant={variant}>
        See the full menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass(expected);
  });

  it.each([
    ["sm", "text-body2"],
    ["md", "text-body1"],
    ["lg", "text-subtitle2"],
  ] as const)("renders the %s size on the type ramp", (size, expected) => {
    render(
      <Link href="/menu" size={size}>
        See the full menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass(expected);
  });

  it("keeps the underline slot in every variant so hover never shifts the baseline", () => {
    render(
      <Link href="/menu" variant="quiet">
        Outlets
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("underline");
  });

  it("opens an external destination in a new tab with the safe rel", () => {
    render(
      <Link href="https://www.fssai.gov.in" isExternal>
        FSSAI licence
      </Link>
    );
    const node = screen.getByRole("link", { name: /FSSAI licence/ });
    expect(node).toHaveAttribute("target", "_blank");
    expect(node).toHaveAttribute("rel", "noreferrer noopener");
    // The arrow carries the announcement, so the jump is spoken as well as drawn.
    expect(screen.getByRole("img", { name: "Opens in a new tab" })).toBeInTheDocument();
  });

  it("leaves an internal link in the same tab", () => {
    render(<Link href="/menu">See the full menu</Link>);
    const node = screen.getByRole("link");
    expect(node).not.toHaveAttribute("target");
    expect(node).not.toHaveAttribute("rel");
  });

  it("renders a leading glyph without announcing it twice", () => {
    const { container } = render(
      <Link href="/outlets" icon={MapPin}>
        Find a Paprikaa
      </Link>
    );
    expect(screen.getByRole("link", { name: "Find a Paprikaa" })).toBeInTheDocument();
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("calls onClick when followed", async () => {
    const handleClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    render(
      <Link href="/menu" onClick={handleClick}>
        See the full menu
      </Link>
    );

    await userEvent.click(screen.getByRole("link"));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("merges a caller className", () => {
    render(
      <Link className="text-text-muted" href="/menu">
        See the full menu
      </Link>
    );
    const node = screen.getByRole("link");
    expect(node).toHaveClass("text-text-muted");
    expect(node).not.toHaveClass("text-text-link");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Link href="/menu">See the full menu</Link>
        <Link href="/outlets" icon={MapPin} variant="quiet">
          Outlets
        </Link>
        <Link href="https://www.fssai.gov.in" isExternal variant="subtle">
          FSSAI licence
        </Link>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
