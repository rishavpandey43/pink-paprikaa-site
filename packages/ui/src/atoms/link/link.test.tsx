import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArrowRight, MapPin } from "lucide-react";
import type { ComponentProps, MouseEvent } from "react";

import { expectNoA11yViolations } from "#vitest.setup";

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
    [{}, ["text-text-link", "underline", "decoration-link-underline", "text-link-md", "font-body"]],
    [{ variant: "link-sm" }, ["text-link-sm"]],
    [{ variant: "link-lg" }, ["text-link-lg"]],
    [
      { color: "muted", underline: "hover" },
      ["underline", "text-text-muted", "decoration-transparent", "hover:decoration-border-default"],
    ],
    [{ color: "inverse" }, ["text-ink-000", "decoration-white-alpha-40"]],
    [
      { color: "quiet", underline: "hover" },
      [
        "text-link-quiet",
        "decoration-transparent",
        "hover:text-text-link",
        "hover:decoration-link-underline",
      ],
    ],
    [{ underline: "none" }, ["no-underline"]],
  ] as const)("%o renders the old classes", (props, classes) => {
    render(
      <Link href="/menu" {...props}>
        Menu
      </Link>
    );
    expect(screen.getByRole("link", { name: "Menu" })).toHaveClass(...classes);
  });

  it.each([
    ["link", ["hover:text-text-link-hover", "hover:decoration-current"]],
    ["muted", ["hover:text-text-heading", "hover:decoration-border-default"]],
    ["inverse", ["hover:decoration-white-alpha-90"]],
    ["quiet", ["hover:text-text-link", "hover:decoration-link-underline"]],
  ] as const)("gives the %s colour its hover classes", (color, classes) => {
    render(
      <Link href="/menu" color={color} underline={color === "link" ? "always" : "hover"}>
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass(...classes);
  });

  it("gives an inverse link its resting underline", () => {
    render(
      <Link href="/menu" color="inverse">
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("underline", "hover:decoration-white-alpha-90");
  });

  it("paints any other Typography colour with its own text colour and a current underline", () => {
    render(
      <Link href="/menu" color="brand">
        Menu
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass("text-text-brand", "decoration-current");
  });

  it("inherits Typography props", () => {
    render(
      <Link href="/menu" weight="bold" align="center" sx={{ mt: 2 }} variant="inherit">
        Menu
      </Link>
    );
    const a = screen.getByRole("link", { name: "Menu" });
    expect(a).toHaveClass("font-bold", "text-center", "mt-2");
    expect(a.className).not.toMatch(/text-link-(sm|md|lg)/);
    expect(a.className).not.toMatch(/(^|\s)text-body(\s|$)/);
  });

  it("lets sx replace a Link default and className replace sx", () => {
    render(
      <Link href="/menu" sx={{ display: "block" }} className="gap-3">
        Menu
      </Link>
    );
    const a = screen.getByRole("link");
    expect(a).toHaveClass("block", "gap-3");
    expect(a).not.toHaveClass("inline-flex");
    expect(a).not.toHaveClass("gap-1.5");
  });

  it("renders through Typography: m-0 and the DM Sans link step on an anchor", () => {
    render(<Link href="/menu">Menu</Link>);
    const a = screen.getByRole("link");
    expect(a.tagName).toBe("A");
    expect(a).toHaveClass("m-0", "font-body");
  });

  it("isDisabled drops href, sets aria-disabled and is not in the tab order", () => {
    render(
      <Link href="/menu" isDisabled>
        Menu
      </Link>
    );
    const link = screen.getByText("Menu");
    expect(link).toHaveAttribute("aria-disabled", "true");
    expect(link).toHaveAttribute("tabindex", "-1");
    expect(link).not.toHaveAttribute("href");
    expect(link).toHaveClass("aria-disabled:text-ink-400", "no-underline");
  });

  it("applies the same classes through asChild", () => {
    render(
      <Link asChild color="muted" underline="hover" variant="link-lg">
        <RouterLink href="/outlets">Outlets</RouterLink>
      </Link>
    );
    expect(screen.getByRole("link")).toHaveClass(
      "text-text-muted",
      "text-link-lg",
      "decoration-transparent"
    );
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
