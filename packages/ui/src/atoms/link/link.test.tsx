import type { ComponentProps, MouseEvent } from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, MapPin } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Link } from "./link";

function RouterLink({ children, ...props }: ComponentProps<"a">) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

describe("Link", () => {
  it("is a link to its href, named by its text", () => {
    render(<Link href="/menu">See the full menu</Link>);
    expect(screen.getByRole("link", { name: "See the full menu" })).toHaveAttribute(
      "href",
      "/menu"
    );
  });

  it.each([
    ["default", "text-text-link", "decoration-link-underline"],
    ["subtle", "text-text-muted", "decoration-transparent"],
    ["inverse", "text-ink-000", "decoration-white-alpha-40"],
    ["quiet", "text-link-quiet", "decoration-transparent"],
  ] as const)("paints the %s variant with %s and a %s underline", (variant, colour, underline) => {
    render(
      <Link href="/outlets" variant={variant}>
        Outlets
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("underline", colour, underline);
  });

  it.each([
    ["default", "hover:text-text-link-hover", "hover:decoration-current"],
    ["subtle", "hover:text-text-heading", "hover:decoration-border-default"],
    ["inverse", "text-ink-000", "hover:decoration-white-alpha-90"],
    ["quiet", "hover:text-text-link", "decoration-transparent"],
  ] as const)(
    "gives the %s variant its hover colour and underline classes, or the resting one hover keeps (%s, %s)",
    (variant, hoverColour, hoverLine) => {
      render(
        <Link href="/outlets" variant={variant}>
          Outlets
        </Link>
      );
      expect(screen.getByRole("link")).toHaveClass(hoverColour, hoverLine);
    }
  );

  it.each([
    ["sm", "text-link-sm"],
    ["md", "text-link-md"],
    ["lg", "text-link-lg"],
  ] as const)("sets size %s with %s on DM Sans", (size, sizeClass) => {
    render(
      <Link href="/menu" size={size}>
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("font-body", sizeClass);
  });

  it("puts decorative glyphs before and after the label", () => {
    render(
      <Link href="/outlets" icon={MapPin} iconAfter={ArrowRight}>
        Find a Paprikaa
      </Link>
    );
    const link = screen.getByRole("link", { name: "Find a Paprikaa" });
    expect(link.querySelector(".lucide-map-pin")).not.toBeNull();
    expect(link.querySelector(".lucide-arrow-right")).not.toBeNull();
    expect(link.lastElementChild).toHaveClass("size-icon-sm");
  });

  it("opens an external link in a new tab with a safe rel and an announced outward arrow", () => {
    render(
      <Link href="https://www.zomato.com" isExternal>
        Zomato listing
      </Link>
    );
    const link = screen.getByRole("link", { name: /^Zomato listing/ });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer noopener");
    expect(link.querySelector(".lucide-arrow-up-right")).not.toBeNull();
    // The jump is spoken as well as drawn.
    expect(screen.getByRole("img", { name: "Opens in a new tab" })).toBeInTheDocument();
  });

  it("draws an explicit iconAfter instead of the external arrow and still announces the new tab", () => {
    render(
      <Link href="https://www.zomato.com" isExternal iconAfter={ArrowRight}>
        Zomato
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link.querySelector(".lucide-arrow-right")).not.toBeNull();
    expect(link.querySelector(".lucide-arrow-up-right")).toBeNull();
    expect(screen.getByRole("img", { name: "Opens in a new tab" })).toBeInTheDocument();
  });

  it("keeps an internal link in the same tab", () => {
    render(<Link href="/menu">See the full menu</Link>);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("calls onClick when followed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
    });
    render(
      <Link href="/menu" onClick={onClick}>
        See the full menu
      </Link>
    );
    await user.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("renders a router link through asChild with the link classes and glyphs", () => {
    render(
      <Link asChild icon={MapPin}>
        <RouterLink href="/outlets">Outlets</RouterLink>
      </Link>
    );
    const link = screen.getByRole("link", { name: "Outlets" });
    expect(link).toHaveAttribute("data-router");
    expect(link).toHaveAttribute("href", "/outlets");
    expect(link).toHaveClass("text-text-link");
    expect(link.querySelector(".lucide-map-pin")).not.toBeNull();
  });

  it("is reachable from the keyboard", async () => {
    const user = userEvent.setup();
    render(<Link href="/menu">See the full menu</Link>);
    await user.tab();
    expect(screen.getByRole("link")).toHaveFocus();
  });

  it("merges a consumer className", () => {
    render(
      <Link href="/menu" className="whitespace-nowrap">
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("whitespace-nowrap", "inline-flex");
  });

  it("lets a consumer className replace the variant colour", () => {
    render(
      <Link href="/menu" className="text-text-muted">
        See the full menu
      </Link>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("text-text-muted");
    expect(link).not.toHaveClass("text-text-link");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Link href="/outlets" icon={MapPin}>
          Find a Paprikaa
        </Link>
        <Link href="https://www.zomato.com" isExternal>
          Zomato listing
        </Link>
      </>
    );
    await expectNoA11yViolations(container);
  });
});
