### Task 8: ActionMenu (new), Combobox and DatePicker parity

**Source:** audit-molecules §ActionMenu, §Combobox, §DatePicker + Calendar, X3, X4, X7.
- **ActionMenu (R134):**
  - `items: { label; icon?; meta?; color?: "default"|"danger"; disabled?; onSelect?; href? }[]` plus the design's other props;
  - the trigger is IconButton `MoreHorizontal`/ellipsis per `D/ActionMenu.jsx:7-23`, label "More actions", ghost, size sm;
  - opens bottom-end; sheet on phones;
  - built on the Menu atom;
  - stories per card row, including the 3-dot story moved from the Menu stories.
- **Combobox:** all 15 lines in the audit, including:
  - a leading search icon, chevron and `size`;
  - option `icon` and `meta` (price);
  - the brand-diamond selected mark;
  - match highlight in pink-700 bold;
  - keyboard rules from the audit: typing auto-highlights the first match, Tab closes without committing, Esc on a closed list clears only the typed text, clicking the box opens the list;
  - the clear button shows whenever there is text and clears only the text.

  Reuse `lib/use-listbox.ts` and `lib/menu-panel`.
- **DatePicker + Calendar:** all 15 lines, including:
  - the selected day as the pink diamond, and a small diamond marker on today;
  - weekday header and caption sizes (20px caption);
  - day hover/press, and the disabled colour;
  - props `min`, `max`, `weekStart`, `format`, `size`, `readOnly`, `inline`;
  - ArrowDown opens;
  - the ≤640 sheet;
  - ISO strings (R133).
- [ ] Step loop per component (tests RED → implement → plays → card comparison → commit). **Batch gate 3.**

