const DATE_FORMAT = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * "Sat, 4 Oct 2026" — the local calendar date, en-IN. Assembled from the Intl parts rather than
 * the formatted string, so a runtime that punctuates en-IN differently ("4 Oct, 2026") cannot
 * change what the field shows.
 */
export function formatDate(date: Date): string {
  const parts = Object.fromEntries(
    DATE_FORMAT.formatToParts(date).map((part) => [part.type, part.value])
  ) as Partial<Record<Intl.DateTimeFormatPartTypes, string>>;
  return `${parts.weekday ?? ""}, ${parts.day ?? ""} ${parts.month ?? ""} ${parts.year ?? ""}`;
}

function pad(value: number, length: number): string {
  return String(value).padStart(length, "0");
}

/** "2026-10-04" from the local getters (never `toISOString`, which shifts to UTC): the value a date input submits. */
export function toIsoDate(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1, 2)}-${pad(date.getDate(), 2)}`;
}

/** Local `Date` from an ISO `yyyy-mm-dd` (never `Date.parse` — UTC shift). Empty → null. */
export function fromIsoDate(iso: string | null | undefined): Date | null {
  if (iso === null || iso === undefined || iso === "") return null;
  const [year, month, day] = iso.split("-").map(Number);
  if (
    year === undefined ||
    month === undefined ||
    day === undefined ||
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null;
  }
  return new Date(year, month - 1, day);
}
