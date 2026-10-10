import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import { FIELD_STATUS_ICON } from "./field-status";

describe("FIELD_STATUS_ICON", () => {
  it("draws each status with the design system's Field glyph", () => {
    expect(FIELD_STATUS_ICON).toEqual({
      error: CircleAlert,
      success: CircleCheck,
      warning: TriangleAlert,
    });
  });
});
