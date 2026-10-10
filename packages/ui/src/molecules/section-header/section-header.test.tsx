import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "#vitest.setup";

import { SectionHeader } from "./section-header";

describe("SectionHeader", () => {
  it("titles a section with a fluid level-2 heading by default", () => {
    render(<SectionHeader title="Most ordered this week" />);
    expect(screen.getByRole("heading", { level: 2, name: "Most ordered this week" })).toHaveClass(
      "text-h2-fluid"
    );
  });

  it.each([1, 3, 4, 5, 6] as const)(
    "takes heading level %i when its page needs it, keeping the look",
    (level) => {
      render(<SectionHeader title="Starters, platters and snacks." headingLevel={level} />);
      expect(screen.getByRole("heading", { level })).toHaveClass("text-h2-fluid");
    }
  );

  it("omits the overline and the lede when they are not given", () => {
    const { container } = render(<SectionHeader title="Most ordered this week" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
    expect(screen.getByRole("heading")).not.toHaveClass("mt-2.5");
  });

  it("merges a caller className over its own gap", () => {
    const { container } = render(
      <SectionHeader title="Most ordered this week" className="gap-2" />
    );
    expect(container.firstElementChild).toHaveClass("gap-2");
    expect(container.firstElementChild).not.toHaveClass("gap-6");
  });

  it("sets the overline right above the title and the lede below it", () => {
    render(
      <SectionHeader
        overline="Our Story"
        title="A cafe that tastes like where it's from"
        lede="We started in one Gurgaon market with a chai counter and a grinder."
      />
    );
    const heading = screen.getByRole("heading");
    expect(screen.getByText("Our Story").nextElementSibling).toBe(heading);
    expect(heading.nextElementSibling).toHaveTextContent(/chai counter/);
    expect(screen.getByText("Our Story")).toHaveClass("uppercase", "text-text-brand");
  });

  it("renders its action beside the title when start-aligned", () => {
    render(<SectionHeader title="Most ordered this week" action={<a href="/menu">See All</a>} />);
    expect(screen.getByRole("link", { name: "See All" })).toBeInTheDocument();
  });

  it("drops the action when centred", () => {
    const { container } = render(
      <SectionHeader
        align="center"
        title="Find a Paprikaa"
        action={<a href="/outlets">See All</a>}
      />
    );
    expect(screen.queryByRole("link", { name: "See All" })).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveClass("text-center");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <SectionHeader
        overline="The Menu"
        title="Most ordered this week"
        lede="What Sector 57 ordered most."
        action={<a href="/menu">See All</a>}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <SectionHeader title="Our menu" sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
