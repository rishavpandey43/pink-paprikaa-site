import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bell, LogOut, MapPin } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ListRow } from "./list-row";

describe("ListRow", () => {
  it("shows its title, description and value", () => {
    render(
      <ListRow
        icon={MapPin}
        title="Default outlet"
        description="Where your pickups go."
        value="Sector 57"
      />
    );
    expect(screen.getByText("Default outlet")).toHaveClass("text-text-heading");
    expect(screen.getByText("Where your pickups go.")).toHaveClass("line-clamp-2");
    expect(screen.getByText("Sector 57")).toHaveClass("text-text-muted");
    // A static row is only text: no button or link semantics.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("draws its glyph and chevron decoratively, and the chevron only when asked", () => {
    const { container, rerender } = render(<ListRow icon={MapPin} title="Default outlet" />);
    expect(container.querySelector("svg.lucide-chevron-right")).not.toBeInTheDocument();
    rerender(<ListRow icon={MapPin} title="Default outlet" hasChevron />);
    for (const glyph of container.querySelectorAll("svg")) {
      expect(glyph.closest("[aria-hidden='true']")).not.toBeNull();
    }
    expect(container.querySelector("svg.lucide-chevron-right")).toBeInTheDocument();
  });

  it("puts a leading element in place of the glyph", () => {
    const { container } = render(
      <ListRow icon={MapPin} leading={<span data-leading="">SP</span>} title="Sector 57" />
    );
    expect(container.querySelector("[data-leading]")).toBeInTheDocument();
    expect(container.querySelector("svg.lucide-map-pin")).not.toBeInTheDocument();
  });

  it("renders a trailing control, such as a switch", () => {
    render(
      <ListRow
        icon={Bell}
        title="Order updates"
        trailing={<input type="checkbox" role="switch" aria-label="Order updates" />}
      />
    );
    expect(screen.getByRole("switch", { name: "Order updates" })).toBeInTheDocument();
  });

  it("separates rows with a hairline unless hasDivider is false", () => {
    const { container, rerender } = render(<ListRow title="Loyalty" />);
    expect(container.firstElementChild).toHaveClass("border-b");
    rerender(<ListRow title="Loyalty" hasDivider={false} />);
    expect(container.firstElementChild).not.toHaveClass("border-b");
  });

  it("paints a destructive row in the danger colour", () => {
    render(<ListRow icon={LogOut} title="Delete my account" isDanger />);
    expect(screen.getByText("Delete my account")).toHaveClass("text-text-danger");
  });

  it("renders into a link with asChild, keeping its layout and hover", () => {
    render(
      <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
        <a href="/account/outlet">{/* ListRow renders its content here */}</a>
      </ListRow>
    );
    const link = screen.getByRole("link", { name: /Default outlet/ });
    expect(link).toHaveAttribute("href", "/account/outlet");
    expect(link).toHaveClass("min-h-hit", "hover:bg-button-hover-tint");
    expect(link).toHaveTextContent("Default outletSector 57");
  });

  it("renders into a button with asChild, so an action row is keyboard-operable", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <ListRow asChild icon={LogOut} title="Sign out" isDanger hasDivider={false}>
        <button type="button" onClick={onClick} />
      </ListRow>
    );
    await user.tab();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(2);
    expect(screen.getByRole("button", { name: "Sign out" })).toHaveClass(
      "w-full",
      "text-start",
      "active:press-scale"
    );
  });

  it("merges a caller className over its own", () => {
    const { container } = render(<ListRow title="Loyalty" className="mx-0" />);
    expect(container.firstElementChild).toHaveClass("mx-0");
    expect(container.firstElementChild).not.toHaveClass("-mx-3");
  });

  it("has no accessibility violations as a static row and as a link", async () => {
    const { container } = render(
      <>
        <ListRow icon={Bell} title="Order updates" description="Texts when your food is ready." />
        <ListRow asChild icon={MapPin} title="Default outlet" value="Sector 57" hasChevron>
          <a href="/account/outlet">{/* ListRow renders its content here */}</a>
        </ListRow>
        <ListRow asChild icon={LogOut} title="Delete my account" isDanger hasDivider={false}>
          <button type="button" onClick={vi.fn()} />
        </ListRow>
      </>
    );
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(<ListRow title="Orders" sx={{ mt: 4 }} className="italic" />);
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
