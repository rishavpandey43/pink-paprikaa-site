import { render, screen } from "@testing-library/react";
import { Store } from "lucide-react";

import { expectNoA11yViolations } from "#vitest.setup";

import { FeatureItem } from "./feature-item";

const WHY = {
  icon: Store,
  title: "We are a restaurant, not a contractor",
  description:
    "Come and eat here before you book. What you taste at our table is exactly what reaches yours.",
} as const;

describe("FeatureItem", () => {
  it("titles the feature as a level-3 heading beside its description", () => {
    render(<FeatureItem {...WHY} />);
    expect(screen.getByRole("heading", { level: 3, name: WHY.title })).toBeInTheDocument();
    expect(screen.getByText(WHY.description)).toBeInTheDocument();
  });

  it("puts the icon in a surface-aware tile, hidden from assistive tech", () => {
    const { container } = render(<FeatureItem {...WHY} />);
    const tile = container.querySelector("svg")?.closest(".rounded-md");
    expect(tile).toHaveClass("bg-feature-item-tile", "text-feature-item-icon");
    expect(container.querySelector('[aria-hidden="true"] svg')).not.toBeNull();
  });

  it.each([
    ["md", "size-11", "text-feature-item-title-md", "text-body"],
    ["sm", "size-10", "text-feature-item-title-sm", "text-body-sm"],
  ] as const)("at size %s uses a %s tile", (size, tileClass, titleClass, descriptionClass) => {
    const { container } = render(<FeatureItem {...WHY} size={size} />);
    expect(container.querySelector("svg")?.closest(".rounded-md")).toHaveClass(tileClass);
    expect(screen.getByRole("heading")).toHaveClass(titleClass);
    expect(screen.getByText(WHY.description)).toHaveClass(descriptionClass);
  });

  it("uses the heading level the page needs", () => {
    render(<FeatureItem {...WHY} headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<FeatureItem {...WHY} />);
    await expectNoA11yViolations(container);
  });

  it("takes sx on its root, merged with className", () => {
    const { container } = render(
      <FeatureItem icon={Store} title="Why us" sx={{ mt: 4 }} className="italic" />
    );
    expect(container.firstElementChild).toHaveClass("mt-4", "italic");
  });
});
