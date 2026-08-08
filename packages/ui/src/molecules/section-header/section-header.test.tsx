import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("renders the title as a level-2 heading by default", () => {
    render(<SectionHeader title="Most ordered this week" />);
    expect(screen.getByRole("heading", { level: 2, name: "Most ordered this week" })).toBeVisible();
  });

  it.each([1, 3, 4, 5, 6] as const)("renders the title at level %i on request", (level) => {
    render(<SectionHeader headingLevel={level} title="Most ordered this week" />);
    expect(screen.getByRole("heading", { level, name: "Most ordered this week" })).toBeVisible();
  });

  it("keeps the heading at the fluid h2 step whatever the level", () => {
    render(<SectionHeader headingLevel={4} title="Most ordered this week" />);
    expect(screen.getByRole("heading", { level: 4 })).toHaveClass("text-h2-fluid");
  });

  it("renders the overline and the lede when given", () => {
    render(
      <SectionHeader
        lede="One kitchen, one grinder and a menu that changes with the season."
        overline="The Menu"
        title="Most ordered this week"
      />
    );
    expect(screen.getByText("The Menu")).toBeVisible();
    expect(
      screen.getByText("One kitchen, one grinder and a menu that changes with the season.")
    ).toBeVisible();
  });

  it("omits the overline and the lede when they are not given", () => {
    render(<SectionHeader title="Most ordered this week" />);
    expect(screen.queryByText("The Menu")).not.toBeInTheDocument();
  });

  it("renders a trailing action beside the heading", () => {
    render(
      <SectionHeader
        action={<button type="button">See Full Menu</button>}
        title="Most ordered this week"
      />
    );
    expect(screen.getByRole("button", { name: "See Full Menu" })).toBeVisible();
  });

  it("drops the action when the header is centred", () => {
    render(
      <SectionHeader
        action={<button type="button">See Full Menu</button>}
        align="center"
        title="Find a Paprikaa"
      />
    );
    expect(screen.queryByRole("button", { name: "See Full Menu" })).not.toBeInTheDocument();
  });

  it("centres its prose when aligned centre", () => {
    const { container } = render(<SectionHeader align="center" title="Find a Paprikaa" />);
    expect(container.firstElementChild).toHaveClass("text-center");
  });

  it("flips the ink tones to white on a flooded pink section", () => {
    render(<SectionHeader on="brand" overline="Franchise" title="Bring us to your city" />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveClass("text-text-on-brand");
  });

  it("sets the eyebrow in white straight onto the fill", () => {
    render(<SectionHeader on="brand" overline="Franchise" title="Bring us to your city" />);
    const overline = screen.getByText("Franchise");

    expect(overline).toHaveClass("text-text-on-brand");
    expect(overline).not.toHaveClass("bg-surface-card");
  });

  it("keeps the lede at the fluid body step and flips it to white on a flooded ground", () => {
    render(
      <SectionHeader
        lede="One kitchen, one grinder and a menu that changes with the season."
        on="brand"
        title="Bring us to your city"
      />
    );
    const lede = screen.getByText(
      "One kitchen, one grinder and a menu that changes with the season."
    );

    expect(lede).toHaveClass("text-body1-fluid");
    expect(lede).toHaveClass("text-text-on-brand");
  });

  it("merges a caller className", () => {
    const { container } = render(
      <SectionHeader className="gap-2" title="Most ordered this week" />
    );
    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SectionHeader
        action={<button type="button">See Full Menu</button>}
        lede="One kitchen, one grinder and a menu that changes with the season."
        overline="The Menu"
        title="Most ordered this week"
      />
    );
    await expectNoA11yViolations(container);
  });
});
