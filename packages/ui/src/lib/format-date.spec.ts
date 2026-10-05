import { formatDate, fromIsoDate, toIsoDate } from "./format-date";

describe("formatDate", () => {
  it("formats en-IN with weekday", () => {
    expect(formatDate(new Date(2026, 9, 4))).toBe("Sun, 4 Oct 2026");
  });
  it("does not pad the day", () => {
    expect(formatDate(new Date(2026, 0, 5))).toBe("Mon, 5 Jan 2026");
  });
  it("reads the local date, not the UTC one", () => {
    expect(formatDate(new Date(2026, 9, 4, 23, 30))).toBe("Sun, 4 Oct 2026");
  });
});

describe("toIsoDate", () => {
  it("iso date is local, not UTC-shifted", () => {
    expect(toIsoDate(new Date(2026, 9, 4, 23, 30))).toBe("2026-10-04");
  });
  it("zero-pads month and day", () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
  it("pads a year below 1000", () => {
    const date = new Date(2000, 0, 1);
    date.setFullYear(999);
    expect(toIsoDate(date)).toBe("0999-01-01");
  });
});

describe("fromIsoDate", () => {
  it("parses a local calendar day", () => {
    expect(fromIsoDate("2026-10-04")).toEqual(new Date(2026, 9, 4));
  });
  it("returns null for empty", () => {
    expect(fromIsoDate("")).toBeNull();
    expect(fromIsoDate(null)).toBeNull();
  });
});
