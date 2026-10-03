import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { OutletCard } from "./outlet-card";

const ADDRESS = "Booth No. 67P, HSVP Market (MKM Market), Sector 57";

describe("OutletCard", () => {
  it("names the outlet as a heading under its city", () => {
    render(<OutletCard city="Gurgaon" name="Sector 57" />);
    expect(screen.getByRole("heading", { level: 3, name: "Sector 57" })).toBeInTheDocument();
    expect(screen.getByText("Gurgaon")).toBeInTheDocument();
  });

  it.each([
    ["open", "Open now"],
    ["busy", "Busy"],
    ["closed", "Closed"],
  ] as const)("says %s in words, never by colour alone", (status, word) => {
    render(<OutletCard name="Sector 57" status={status} />);
    expect(screen.getByText(word)).toBeInTheDocument();
  });

  it("lets the page override the status words", () => {
    render(<OutletCard name="Sector 57" status="closed" statusLabel="Opens at 8am" />);
    expect(screen.getByText("Opens at 8am")).toBeInTheDocument();
  });

  it("puts the address in an address element and shows the hours", () => {
    const { container } = render(
      <OutletCard name="Sector 57" address={ADDRESS} hours="8am – 11:30pm" />
    );
    expect(container.querySelector("address")).toHaveTextContent(ADDRESS);
    expect(screen.getByText("8am – 11:30pm")).toBeInTheDocument();
  });

  it("shows the labelled 16:9 placeholder by default and drops the image for the list form", () => {
    const { rerender } = render(<OutletCard name="Sector 57" />);
    expect(screen.getByText("Outlet interior 16:9")).toBeInTheDocument();
    rerender(<OutletCard name="Sector 57" hasImage={false} />);
    expect(screen.queryByText("Outlet interior 16:9")).not.toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(<OutletCard name="Sector 57" action={<a href="https://maps.example">Directions</a>} />);
    expect(screen.getByRole("link", { name: "Directions" })).toBeInTheDocument();
  });

  it("draws the action slot whenever React would render it — a 0 counts, false does not", () => {
    const { container, rerender } = render(<OutletCard name="Sector 57" action={0} />);
    expect(container.querySelector(".z-raised")).toHaveTextContent("0");
    rerender(<OutletCard name="Sector 57" action={false} />);
    expect(container.querySelector(".z-raised")).toBeNull();
  });

  it("uses the heading level the page needs", () => {
    render(<OutletCard name="Sector 57" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "Sector 57" })).toBeInTheDocument();
  });

  it("shows the outlet photograph once one is supplied", () => {
    render(
      <OutletCard
        name="Sector 57"
        image={{
          src: "/outlets/sector-57.avif",
          alt: "The dine-in room at Sector 57",
          width: 640,
          height: 360,
        }}
      />
    );
    expect(screen.getByRole("img", { name: "The dine-in room at Sector 57" })).toHaveAttribute(
      "src",
      "/outlets/sector-57.avif"
    );
  });

  it("becomes one stretched link that lifts only when given an href", () => {
    const { rerender } = render(<OutletCard name="Sector 57" />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("article")).not.toHaveClass("hover:lift");
    rerender(<OutletCard name="Sector 57" href="/outlets/sector-57" />);
    const link = screen.getByRole("link", { name: "Sector 57" });
    expect(link).toHaveAttribute("href", "/outlets/sector-57");
    expect(link).toHaveClass("after:inset-0");
    expect(screen.getByRole("article")).toHaveClass("hover:lift");
  });

  it("keeps the action outside the stretched link, raised above its overlay", () => {
    render(
      <OutletCard
        name="Sector 57"
        href="/outlets/sector-57"
        action={<a href="https://maps.example">Directions</a>}
      />
    );
    const directions = screen.getByRole("link", { name: "Directions" });
    expect(screen.getByRole("link", { name: "Sector 57" })).not.toContainElement(directions);
    expect(directions.parentElement).toHaveClass("z-raised");
  });

  it("lets a caller className replace the card radius", () => {
    render(<OutletCard name="Sector 57" className="rounded-md" />);
    expect(screen.getByRole("article")).toHaveClass("rounded-md");
    expect(screen.getByRole("article")).not.toHaveClass("rounded-lg");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <OutletCard
        city="Gurgaon"
        name="Sector 57"
        address={ADDRESS}
        hours="8am – 11:30pm"
        href="/outlets/sector-57"
        action={<a href="https://maps.example">Directions</a>}
      />
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <OutletCard name="MKM Market" sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
