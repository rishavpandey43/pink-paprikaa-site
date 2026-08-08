import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OutletCard } from "./outlet-card";

describe("OutletCard", () => {
  it("renders the outlet as a heading", () => {
    render(<OutletCard name="Sector 57" />);

    expect(screen.getByRole("heading", { name: "Sector 57" })).toBeInTheDocument();
  });

  it("renders the outlet name at a caller-chosen level", () => {
    render(<OutletCard name="Sector 57" nameAs="h2" />);

    expect(screen.getByRole("heading", { level: 2, name: "Sector 57" })).toBeInTheDocument();
  });

  it("prints the city, address and hours", () => {
    render(
      <OutletCard
        address="MKM Market, Sector 57"
        city="Gurgaon"
        hours="8am – 11:30pm"
        name="Sector 57"
      />
    );

    expect(screen.getByText("Gurgaon")).toBeInTheDocument();
    expect(screen.getByText("MKM Market, Sector 57")).toBeInTheDocument();
    expect(screen.getByText("8am – 11:30pm")).toBeInTheDocument();
  });

  it.each([
    ["open", "Open now"],
    ["busy", "Busy"],
    ["closed", "Closed"],
  ] as const)("says out loud that the outlet is %s", (status, expected) => {
    render(<OutletCard name="Sector 57" status={status} />);

    expect(screen.getByText(expected)).toBeInTheDocument();
  });

  it("lets the caller write the state line itself", () => {
    render(<OutletCard name="Sector 57" status="open" statusLabel="Open till 11:30pm" />);

    expect(screen.getByText("Open till 11:30pm")).toBeInTheDocument();
    expect(screen.queryByText("Open now")).not.toBeInTheDocument();
  });

  it("stretches one real link over the whole card rather than hanging a click on it", () => {
    render(<OutletCard href="/outlets/sector-57" name="Sector 57" />);
    const link = screen.getByRole("link", { name: "Sector 57" });

    expect(link).toHaveAttribute("href", "/outlets/sector-57");
    expect(link).toHaveClass("after:inset-0");
  });

  it("adds the hover lift only when the card is a link", () => {
    const { container, rerender } = render(<OutletCard name="Sector 57" />);
    expect(container.firstElementChild).not.toHaveClass("hover:shadow-elevation3");

    rerender(<OutletCard href="/outlets/sector-57" name="Sector 57" />);
    expect(container.firstElementChild).toHaveClass("hover:shadow-elevation3");
  });

  it("renders the labelled placeholder until a photograph exists", () => {
    render(<OutletCard name="Sector 57" />);

    expect(screen.getByText("Outlet interior 16:9")).toBeInTheDocument();
  });

  it("drops the photograph entirely in the compact list variant", () => {
    render(<OutletCard hasImage={false} name="Sector 57" />);

    expect(screen.queryByText("Outlet interior 16:9")).not.toBeInTheDocument();
  });

  it("renders the photograph with its alt text once one is supplied", () => {
    render(
      <OutletCard
        image="/outlets/sector-57.jpg"
        imageAlt="The dine-in room at Sector 57"
        name="Sector 57"
      />
    );

    expect(screen.getByRole("img", { name: "The dine-in room at Sector 57" })).toBeInTheDocument();
  });

  it("keeps a secondary action clickable above the stretched link", async () => {
    const handleClick = vi.fn();
    render(
      <OutletCard
        action={
          <button onClick={handleClick} type="button">
            Directions
          </button>
        }
        href="/outlets/sector-57"
        name="Sector 57"
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Directions" }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("merges a caller className", () => {
    const { container } = render(<OutletCard className="rounded-1" name="Sector 57" />);

    expect(container.firstElementChild).toHaveClass("rounded-1");
    expect(container.firstElementChild).not.toHaveClass("rounded-4");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OutletCard
        action={<button type="button">Directions</button>}
        address="MKM Market, Sector 57"
        city="Gurgaon"
        hours="8am – 11:30pm"
        href="/outlets/sector-57"
        name="Sector 57"
        status="busy"
      />
    );
    await expectNoA11yViolations(container);
  });
});
