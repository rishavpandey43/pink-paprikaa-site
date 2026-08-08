import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Bell, MapPin, Trash2 } from "lucide-react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { ListRow } from "./list-row";

describe("ListRow", () => {
  it("renders a plain row with no button semantics when it does nothing", () => {
    render(<ListRow title="Order updates" />);
    expect(screen.getByText("Order updates")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders a real button when it is clickable", () => {
    render(<ListRow onClick={vi.fn()} title="Default outlet" value="Sector 57" />);
    expect(screen.getByRole("button", { name: /Default outlet/ })).toHaveAttribute(
      "type",
      "button"
    );
  });

  it("calls onClick when pressed", async () => {
    const handleClick = vi.fn();
    render(<ListRow onClick={handleClick} title="Default outlet" />);

    await userEvent.click(screen.getByRole("button", { name: /Default outlet/ }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("is reachable and operable from the keyboard", async () => {
    const handleClick = vi.fn();
    render(<ListRow onClick={handleClick} title="Default outlet" />);

    await userEvent.tab();
    expect(screen.getByRole("button", { name: /Default outlet/ })).toHaveFocus();

    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");

    expect(handleClick).toHaveBeenCalledTimes(2);
  });

  it("renders the description, the value and the trailing element", () => {
    render(
      <ListRow
        description="UPI, cards and Paprikaa credit."
        title="Payment methods"
        trailing={<span>4 of 6</span>}
        value="Sector 57"
      />
    );
    expect(screen.getByText("UPI, cards and Paprikaa credit.")).toBeVisible();
    expect(screen.getByText("Sector 57")).toBeVisible();
    expect(screen.getByText("4 of 6")).toBeVisible();
  });

  it("clamps a long description to two lines", () => {
    render(<ListRow description="UPI, cards and Paprikaa credit." title="Payment methods" />);
    expect(screen.getByText("UPI, cards and Paprikaa credit.")).toHaveClass("line-clamp-2");
  });

  it("prefers a leading element over the icon", () => {
    const { container } = render(
      <ListRow icon={MapPin} leading={<span>PP</span>} title="Default outlet" />
    );
    expect(screen.getByText("PP")).toBeVisible();
    expect(container.querySelectorAll("svg")).toHaveLength(0);
  });

  it("renders the chevron only when asked", () => {
    const { container, rerender } = render(<ListRow icon={MapPin} title="Default outlet" />);
    expect(container.querySelectorAll("svg")).toHaveLength(1);

    rerender(<ListRow hasChevron icon={MapPin} title="Default outlet" />);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("colours a destructive row's title", () => {
    render(<ListRow icon={Trash2} isDanger title="Delete my account" />);
    expect(screen.getByText("Delete my account")).toHaveClass("text-status-danger");
  });

  it("drops the hairline when the row closes a group", () => {
    const { container, rerender } = render(<ListRow title="Order updates" />);
    expect(container.firstElementChild).toHaveClass("border-b");

    rerender(<ListRow hasDivider={false} title="Order updates" />);
    expect(container.firstElementChild).not.toHaveClass("border-b");
  });

  it("holds the 44px hit target", () => {
    const { container } = render(<ListRow onClick={vi.fn()} title="Default outlet" />);
    expect(container.firstElementChild).toHaveClass("min-h-(--layout-hit-min)");
  });

  it("merges a caller className", () => {
    const { container } = render(<ListRow className="rounded-4" title="Order updates" />);
    expect(container.firstElementChild).toHaveClass("rounded-4");
    expect(container.firstElementChild).not.toHaveClass("rounded-2");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <div>
        <ListRow
          hasChevron
          icon={MapPin}
          onClick={vi.fn()}
          title="Default outlet"
          value="Sector 57"
        />
        <ListRow
          description="Order updates and offers, at most twice a week."
          icon={Bell}
          title="Notifications"
        />
        <ListRow
          hasDivider={false}
          icon={Trash2}
          isDanger
          onClick={vi.fn()}
          title="Delete my account"
        />
      </div>
    );
    await expectNoA11yViolations(container);
  });
});
