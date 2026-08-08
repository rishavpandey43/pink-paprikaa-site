import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Switch } from "./switch";

const LABEL = "Jain preferences";

describe("Switch", () => {
  it("renders an off switch named by its label", () => {
    render(<Switch label={LABEL} />);
    expect(screen.getByRole("switch", { name: LABEL })).not.toBeChecked();
  });

  it("turns on when clicked and reports the new state", async () => {
    const handleCheckedChange = vi.fn();
    render(<Switch label={LABEL} onCheckedChange={handleCheckedChange} />);

    await userEvent.click(screen.getByRole("switch", { name: LABEL }));

    expect(handleCheckedChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("switch", { name: LABEL })).toBeChecked();
  });

  it("toggles from the space bar", async () => {
    render(<Switch label={LABEL} />);

    await userEvent.tab();
    await userEvent.keyboard(" ");

    expect(screen.getByRole("switch", { name: LABEL })).toBeChecked();
  });

  it("does nothing while disabled", async () => {
    const handleCheckedChange = vi.fn();
    render(<Switch disabled label={LABEL} onCheckedChange={handleCheckedChange} />);

    await userEvent.click(screen.getByRole("switch", { name: LABEL }));

    expect(handleCheckedChange).not.toHaveBeenCalled();
  });

  it("describes itself with its second line", () => {
    render(<Switch description="Hides onion and garlic." label={LABEL} />);
    expect(screen.getByRole("switch", { name: LABEL })).toHaveAccessibleDescription(
      "Hides onion and garlic."
    );
  });

  it("floods the track with the brand pink and slides the knob once on", () => {
    render(<Switch defaultChecked label={LABEL} />);
    const track = screen.getByRole("switch", { name: LABEL });
    expect(track).toHaveClass("data-[state=checked]:bg-brand-primary");
    expect(track.firstElementChild).toHaveClass("data-[state=checked]:translate-x-4.5");
  });

  it("keeps a real grey track when disabled rather than fading out", () => {
    const { container } = render(<Switch disabled label="Delivery updates" />);
    expect(screen.getByRole("switch")).toHaveClass("bg-border-subtle");
    expect(container.innerHTML).not.toMatch(/opacity-/);
  });

  it("merges a caller className onto the row", () => {
    const { container } = render(<Switch className="gap-8" label={LABEL} />);
    expect(container.firstElementChild).toHaveClass("gap-8");
    expect(container.firstElementChild).not.toHaveClass("gap-3.5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <>
        <Switch label="Order updates" />
        <Switch defaultChecked description="Hides onion and garlic." label={LABEL} />
        <Switch description="Delivery starts later." disabled label="Delivery updates" />
      </>
    );
    await expectNoA11yViolations(container);
  });
});
