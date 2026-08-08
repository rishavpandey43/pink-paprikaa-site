import { render, screen } from "@testing-library/react";

import { expectNoA11yViolations } from "../../../vitest.setup";
import { Button } from "../../atoms/button/button";
import { HeroBanner } from "./hero-banner";

const TITLE = "Desi at heart. Urban by nature.";

describe("HeroBanner", () => {
  it("renders the headline as the page's h1", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1, name: TITLE })).toBeInTheDocument();
  });

  it("sets the headline in the fluid display step so it never overflows", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-display1-fluid");
  });

  it("renders the overline, the body and the actions", () => {
    render(
      <HeroBanner
        actions={<Button on="brand">Order Now</Button>}
        body="We roast our own masala every morning."
        overline="Sector 57, Gurgaon"
        title={TITLE}
      />
    );
    expect(screen.getByText("Sector 57, Gurgaon")).toBeInTheDocument();
    expect(screen.getByText("We roast our own masala every morning.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Order Now" })).toBeInTheDocument();
  });

  it("renders every meta fact", () => {
    render(<HeroBanner meta={["Est. 2019", "Open till 11:30pm"]} title={TITLE} />);
    expect(screen.getByText("Est. 2019")).toBeInTheDocument();
    expect(screen.getByText("Open till 11:30pm")).toBeInTheDocument();
  });

  it.each([
    ["brand", "text-text-on-brand"],
    ["ink", "text-text-on-inverse"],
    ["soft", "text-text-heading"],
  ] as const)("sets the %s tone's headline ink", (tone, expected) => {
    render(<HeroBanner title={TITLE} tone={tone} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(expected);
  });

  it("holds the photograph's space with a labelled placeholder in the split layout", () => {
    render(<HeroBanner title={TITLE} />);
    expect(screen.getByText("Hero food photography 4:5")).toBeInTheDocument();
  });

  it("drops the image entirely in the centred layout", () => {
    render(<HeroBanner title={TITLE} variant="center" />);
    expect(screen.queryByText("Hero food photography 4:5")).not.toBeInTheDocument();
  });

  it("renders a real photograph with its alt text and prints the caption on the scrim", () => {
    render(
      <HeroBanner
        image="/hero.jpg"
        imageAlt="A plate of chilli paneer"
        imageCaption="Chilli Paneer · ₹280"
        title={TITLE}
      />
    );
    expect(screen.getByRole("img", { name: "A plate of chilli paneer" })).toHaveAttribute(
      "src",
      "/hero.jpg"
    );
    expect(screen.getByText("Chilli Paneer · ₹280")).toBeInTheDocument();
  });

  it("paints no scrim over the placeholder, which would dim the photography note", () => {
    const { container } = render(<HeroBanner imageCaption="Chilli Paneer · ₹280" title={TITLE} />);
    expect(screen.queryByText("Chilli Paneer · ₹280")).not.toBeInTheDocument();
    expect(container.querySelector("[class*='effect-scrim-bottom']")).toBeNull();
  });

  it("merges a caller className", () => {
    const { container } = render(<HeroBanner className="rounded-5" title={TITLE} />);
    expect(container.firstElementChild).toHaveClass("rounded-5");
  });

  it("has no accessibility violations", async () => {
    const { container } = render(
      <HeroBanner
        actions={
          <>
            <Button on="brand">Order Now</Button>
            <Button on="brand" variant="secondary">
              See Full Menu
            </Button>
          </>
        }
        body="We roast our own masala every morning."
        meta={["Est. 2019", "Open till 11:30pm"]}
        overline="Sector 57, Gurgaon"
        title={TITLE}
      />
    );
    await expectNoA11yViolations(container);
  });
});
