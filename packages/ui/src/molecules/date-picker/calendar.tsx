"use client";

import type { Matcher } from "react-day-picker";

import { type DateRange, DayPicker } from "react-day-picker";
import { enIN } from "react-day-picker/locale";

import type { SxProp } from "../../lib/common-props";

import { componentVariants } from "../../lib/component-variants";
import { withSx } from "../../lib/sx";

export type { DateRange, Matcher };

export interface CalendarProps extends SxProp {
  /** "single" (default) selects one day, "range" a start and an end. */
  mode?: "single" | "range" | undefined;
  /** A `Date` in single mode, a `{ from, to }` range in range mode. */
  selected?: Date | DateRange | undefined;
  onSelect?: ((value: Date | DateRange | undefined) => void) | undefined;
  /** Days that cannot be chosen: a date, `{ before }`, `{ dayOfWeek: [1] }`, a predicate, or a list of them. */
  disabled?: Matcher | Matcher[] | undefined;
  /** The first day that can be chosen; earlier days are disabled and earlier months are not reachable. */
  fromDate?: Date | undefined;
  /** The last day that can be chosen; later days are disabled and later months are not reachable. */
  toDate?: Date | undefined;
  /** Default 1. Two months sit side by side from `sm` up and stack below it. */
  numberOfMonths?: 1 | 2 | undefined;
  /** The month shown first; default the selected day's month, else this month. */
  defaultMonth?: Date | undefined;
  /** Moves focus to the selected day (or today) on mount: for a calendar that just opened in a popover. */
  shouldFocusDay?: boolean | undefined;
}

/**
 * The calendar's classes, keyed by react-day-picker's parts. react-day-picker puts the state
 * classes (`selected`, `today`, `disabled`, `range_*`) on the day's `<td>` and the press target is
 * the `<button>` inside it, so a state paints its button with `*:`. Only token utilities: the
 * library's own stylesheet is never imported.
 */
const calendar = componentVariants({
  slots: {
    root: "w-fit font-body text-body-sm text-text-body",
    months: "relative flex flex-col gap-4 sm:flex-row sm:gap-6",
    month: "grid gap-2",
    // Centred between the nav buttons, which sit over its two ends.
    monthCaption: "flex h-icon-button-sm items-center justify-center",
    captionLabel: "font-display text-h4 text-text-heading",
    nav: "absolute inset-x-0 top-0 z-raised flex items-center justify-between",
    navButton:
      "grid size-icon-button-sm place-items-center rounded-pill text-ink-700 transition-control hover:bg-button-hover-tint aria-disabled:pointer-events-none aria-disabled:text-ink-400",
    chevron: "size-icon-sm fill-current rtl:rotate-180",
    monthGrid: "border-collapse",
    weekday: "size-10 p-0 text-center text-caption font-medium text-text-muted",
    day: "size-10 p-0 text-center",
    dayButton:
      "grid size-10 place-items-center rounded-md text-body-sm transition-control hover:bg-surface-sunken disabled:cursor-not-allowed",
    selected: "*:bg-pink-500! *:text-ink-000!",
    rangeMiddle: "*:rounded-none *:bg-surface-brand-soft! *:text-text-body!",
    today: "*:font-bold not-data-[selected=true]:*:text-text-brand",
    disabled: "*:text-ink-400 *:line-through",
    hidden: "invisible",
  },
});

function listOf(matcher: Matcher | Matcher[] | undefined): Matcher[] {
  if (matcher === undefined) return [];
  return Array.isArray(matcher) ? matcher : [matcher];
}

function isRange(value: Date | DateRange | undefined): value is DateRange {
  return value !== undefined && !(value instanceof Date);
}

/**
 * A month grid for picking a day or a range (react-day-picker v10 under token classes). The week
 * starts on Monday, labels are en-IN, and arrow keys, Home/End and PageUp/PageDown move focus
 * across days and months. For a date field use DatePicker; this is the grid on its own, for an
 * always-visible calendar or a date-range filter.
 */
export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  fromDate,
  toDate,
  numberOfMonths = 1,
  defaultMonth,
  shouldFocusDay = false,
  sx,
}: CalendarProps) {
  const slots = calendar();
  const matchers: Matcher[] = [
    ...listOf(disabled),
    ...(fromDate === undefined ? [] : [{ before: fromDate }]),
    ...(toDate === undefined ? [] : [{ after: toDate }]),
  ];
  const className = withSx(sx, undefined);
  const firstMonth = defaultMonth ?? (selected instanceof Date ? selected : undefined);
  const shared = {
    weekStartsOn: 1,
    locale: enIN,
    numberOfMonths,
    autoFocus: shouldFocusDay,
    // Conditional spreads: react-day-picker types its optionals without `| undefined`.
    ...(className === undefined ? {} : { className }),
    ...(matchers.length === 0 ? {} : { disabled: matchers }),
    ...(fromDate === undefined ? {} : { startMonth: fromDate }),
    ...(toDate === undefined ? {} : { endMonth: toDate }),
    ...(firstMonth === undefined ? {} : { defaultMonth: firstMonth }),
    classNames: {
      root: slots.root(),
      months: slots.months(),
      month: slots.month(),
      month_caption: slots.monthCaption(),
      caption_label: slots.captionLabel(),
      nav: slots.nav(),
      button_previous: slots.navButton(),
      button_next: slots.navButton(),
      chevron: slots.chevron(),
      month_grid: slots.monthGrid(),
      weekdays: "",
      weekday: slots.weekday(),
      weeks: "",
      week: "",
      day: slots.day(),
      day_button: slots.dayButton(),
      today: slots.today(),
      disabled: slots.disabled(),
      hidden: slots.hidden(),
      outside: "",
      focused: "",
    },
  } as const;

  if (mode === "range") {
    const range = isRange(selected) ? selected : undefined;
    return (
      <DayPicker
        {...shared}
        mode="range"
        selected={range}
        onSelect={(next) => {
          onSelect?.(next);
        }}
        classNames={{
          ...shared.classNames,
          // The range's own states paint the ends and the stretch between; `selected` is on all
          // of them, so it must stay empty here or it would flood the middle.
          selected: "",
          range_start: slots.selected(),
          range_end: slots.selected(),
          range_middle: slots.rangeMiddle(),
        }}
      />
    );
  }
  return (
    <DayPicker
      {...shared}
      mode="single"
      selected={selected instanceof Date ? selected : undefined}
      onSelect={(next) => {
        onSelect?.(next);
      }}
      classNames={{ ...shared.classNames, selected: slots.selected() }}
    />
  );
}
