import { fieldControlVariants } from "./field-control";

describe("fieldControlVariants", () => {
  it("strengthens the idle border on hover for the default status only", () => {
    const idle = fieldControlVariants({ status: "default", control: "input" });
    expect(idle.root()).toMatch(
      /not-focus-within:hover:not-has-\[>:is\(input,textarea,select\):disabled\]:border-border-strong/
    );
    expect(idle.icon()).toMatch(/group-focus-within\/field:text-pink-500/);

    const error = fieldControlVariants({ status: "error", control: "input" });
    expect(error.root()).not.toMatch(/not-focus-within:hover:.*border-border-strong/);

    const readOnly = fieldControlVariants({
      status: "default",
      control: "input",
      isReadOnly: true,
    });
    expect(readOnly.root()).toMatch(/not-focus-within:hover:border-border-default/);
  });
});
