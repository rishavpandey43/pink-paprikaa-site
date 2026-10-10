import { render, screen } from "@testing-library/react";

import type { LinkAs, LinkAsProps } from "./link-as";

function RouterLink({ children, ...props }: LinkAsProps) {
  return (
    <a data-router="" {...props}>
      {children}
    </a>
  );
}

function NavItem({ linkAs: Anchor }: { linkAs: LinkAs }) {
  return (
    <Anchor href="/menu" aria-current="page" className="font-body">
      Menu
    </Anchor>
  );
}

describe("LinkAs", () => {
  it("accepts the native anchor", () => {
    render(<NavItem linkAs="a" />);
    const link = screen.getByRole("link", { name: "Menu" });
    expect(link).toHaveAttribute("href", "/menu");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("accepts a router's link component, so an app can pass next/link", () => {
    render(<NavItem linkAs={RouterLink} />);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("data-router");
  });
});
