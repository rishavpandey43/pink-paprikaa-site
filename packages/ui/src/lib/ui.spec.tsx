import { render } from "@testing-library/react";

import PinkPaprikaaWebUi from "./ui";

describe("PinkPaprikaaWebUi", () => {
  it("should render successfully", () => {
    const { baseElement } = render(<PinkPaprikaaWebUi />);
    expect(baseElement).toBeTruthy();
  });
});
