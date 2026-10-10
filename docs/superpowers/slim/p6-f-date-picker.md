# P6-F — DatePicker (molecule)

**Files:** `packages/ui/src/molecules/date-picker/date-picker.{tsx,test.tsx,stories.tsx}` (+ `calendar.tsx` in the same folder if it helps). Dependency: `pnpm add react-day-picker --filter @pink-paprikaa-web/ui` (an accessible, keyboard-complete grid; no hand-built calendar). Style it only with token classes through its `classNames` prop; no imported CSS from the package, no raw values.

Two exports:

- `Calendar`: inline month grid. `mode` single | range, `selected?/defaultSelected?/onSelect?`, `disabled?` (dates or matcher: past days, closed Mondays), `fromDate?/toDate?`, `numberOfMonths?` 1 | 2, `weekStartsOn` 1 (Monday, India). Today marked; selected = brand fill; range middle = soft.
- `DatePicker`: Field-ready trigger (looks like Select/Input, calendar icon) + Popover (P6-C) holding the Calendar. `value?/defaultValue?/onValueChange?` (Date), `placeholder?` ("Pick a date"), `name` (hidden input `yyyy-mm-dd`), `status?/message?`, `disabled`, `portalContainer?`. Display format en-IN ("Sat, 4 Oct 2026") via `Intl.DateTimeFormat`; add a formatter to `lib` if none exists.

Stories: CalendarSingle, CalendarRange, CalendarDisabledDays (past + Mondays), TwoMonths, DatePickerPlayground, InFieldWithError, Mobile360. Plays: open picker, arrow keys move days, Enter selects, the trigger shows the formatted date, Escape returns focus.
Tests: selection callbacks, disabled days not selectable, hidden input value, format, keyboard (react-day-picker grid roles), axe.
