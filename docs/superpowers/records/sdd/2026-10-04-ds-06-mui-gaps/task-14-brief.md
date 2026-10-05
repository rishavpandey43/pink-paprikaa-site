### Task 14: Drawer, Popover and Menu (MUI Menu, incl. the 3-dot menu)

**Files:**
- Modify: `packages/ui/src/organisms/dialog/dialog.{tsx,test.tsx,stories.tsx}`, `packages/design-tokens/tokens/component/dialog.json`, `packages/ui/src/styles.css` (drawer keyframes), `lib/component-variants.ts` (new token names)
- Create: `packages/ui/src/molecules/popover/popover.{tsx,test.tsx,stories.tsx}`, `packages/design-tokens/tokens/component/popover.json`
- Create: `packages/ui/src/molecules/menu/menu.{tsx,test.tsx,stories.tsx}` (named `Menu` as in MUI; built on Radix DropdownMenu)

**Interfaces:**
```ts
// Dialog (extended)
variant?: "modal" | "sheet" | "drawer" | undefined;
side?: "start" | "end" | undefined; // drawer only, default "end"
export type DrawerProps = Omit<DialogProps, "variant">;
export function Drawer(props: DrawerProps): JSX.Element; // <Dialog variant="drawer" {...props} />

// Popover
export interface PopoverProps extends SxProp {
  trigger: ReactNode;                 // rendered via Radix Trigger asChild
  children: ReactNode;
  title?: ReactNode | undefined; headingLevel?: HeadingLevel | undefined;  // default 2
  side?: "top" | "right" | "bottom" | "left" | undefined;                 // default "bottom"
  align?: "start" | "center" | "end" | undefined;                         // default "center"
  hasArrow?: boolean | undefined; hasCloseButton?: boolean | undefined; closeLabel?: string | undefined; // "Close"
  open?: boolean | undefined; defaultOpen?: boolean | undefined; onOpenChange?: ((open: boolean) => void) | undefined;
  portalContainer?: HTMLElement | null | undefined;
}

// Menu: MUI's Menu/MenuItem names and behaviour, built on Radix DropdownMenu (focus, typeahead, aria).
// MUI drives Menu with `anchorEl` + `open` + `onClose`. Radix's trigger pattern does the same job with
// correct aria wiring, so the trigger is a part. Controlled `open`/`onOpenChange` still exists.
export function Menu(props: { open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; modal?: boolean; children: ReactNode }): JSX.Element;
export function MenuTrigger(props: { children: ReactElement; asChild?: true }): JSX.Element; // wraps an IconButton (3-dot) or Button
export interface MenuContentProps extends SxProp {
  side?: "top" | "right" | "bottom" | "left"; align?: "start" | "center" | "end"; // MUI anchorOrigin/transformOrigin
  sideOffset?: number; isDense?: boolean;     // MUI `dense`: 36px rows instead of 44px
  maxHeight?: "sm" | "md" | "lg";             // MUI "long menu": scrolls inside (token heights 216/320/400px)
  portalContainer?: HTMLElement | null; children: ReactNode; "aria-label"?: string;
}
export interface MenuItemProps extends SxProp {
  icon?: IconComponent;                       // MUI ListItemIcon
  shortcut?: ReactNode;                        // MUI trailing Typography (e.g. "⌘P")
  description?: ReactNode;                     // MUI ListItemText secondary
  isSelected?: boolean;                        // MUI `selected` (brand-soft row, aria-current-like)
  hasDivider?: boolean;                        // MUI `divider` (hairline under the item)
  color?: "default" | "danger";
  disabled?: boolean; onSelect?: (event: Event) => void; // MUI onClick; menu closes after select (MUI default)
  asChild?: boolean;                           // render a Link/<a> as the item (MUI component={Link})
  children: ReactNode;
}
export function MenuItem(props: MenuItemProps): JSX.Element;
export function MenuDivider(): JSX.Element;    // MUI <Divider /> inside a Menu
export function MenuLabel(props: { children: ReactNode }): JSX.Element; // MUI ListSubheader
export function MenuCheckboxItem(props: Omit<MenuItemProps, "isSelected"> & { checked: boolean; onCheckedChange: (checked: boolean) => void }): JSX.Element;
export function MenuRadioGroup(props: { value: string; onValueChange: (value: string) => void; children: ReactNode }): JSX.Element;
export function MenuRadioItem(props: Omit<MenuItemProps, "isSelected"> & { value: string }): JSX.Element;
export function SubMenu(props: { children: ReactNode }): JSX.Element;
export function SubMenuTrigger(props: Omit<MenuItemProps, "onSelect">): JSX.Element; // ChevronRight at the end
export function SubMenuContent(props: MenuContentProps): JSX.Element;
```
Tokens: `dialog-drawer-sm/md/lg` = 320/400/480px (spacing namespace, `utility` marker per R61). `popover.json`: `popover-pad` = 16px, `popover-max-w` = 320px. Panel look = `bg-surface-card border-default border-border-subtle rounded-lg shadow-3`, `z-overlay`. Menu item min height = 44px (tap target), `px-3 py-2.5`, `text-body-sm`; dense = 36px, `py-1.5`. Selected = `bg-surface-brand-soft font-semibold`. Danger item = `text-text-danger`. Menu max-height tokens `menu-max-sm/md/lg` = 216/320/400px.

- [ ] **Step 1: Drawer tests (RED):**

```tsx
it.each(["start", "end"] as const)("drawer on the %s side is a full-height dialog on that edge", async (side) => {
  render(<Drawer open title="Filters" side={side}>Jain only</Drawer>);
  const dialog = screen.getByRole("dialog", { name: "Filters" });
  expect(dialog).toHaveClass("h-full", side === "start" ? "start-0" : "end-0");
});
it("closes on Escape and returns focus to its trigger", async () => {
  const user = userEvent.setup();
  render(<DrawerHarness />); // a Button "Filters" toggling <Drawer title="Filters">
  await user.click(screen.getByRole("button", { name: "Filters" }));
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: "Filters" })).toHaveFocus();
});
it.each([["sm", "max-w-dialog-drawer-sm"], ["md", "max-w-dialog-drawer-md"], ["lg", "max-w-dialog-drawer-lg"]] as const)(
  "size %s", (size, cls) => {
    render(<Drawer open title="Cart" size={size}>x</Drawer>);
    expect(screen.getByRole("dialog")).toHaveClass(cls, "w-full");
  });
```
Run `pnpm nx test ui -- dialog` → FAIL.

- [ ] **Step 2: Implement Drawer.** Add the `drawer` variant: overlay `justify-end` (end) or `justify-start` (start); content `h-full w-full rounded-none` plus the size max-width tokens. Add `animate-drawer-in-start`/`-end` keyframes in styles.css next to `animate-sheet-in` (translateX from ∓100% to 0, `duration-base`, `ease-entrance`, inside `motion-safe`). The `side` → `start-0`/`end-0` classes are logical (RTL-safe). Export `Drawer`/`DrawerProps` from index.ts. → PASS.

- [ ] **Step 3: Drawer stories** (in `dialog.stories.tsx`): `DrawerEnd`, `DrawerStart`, `DrawerSizes`, `DrawerWithFooter` (menu filters: veg categories as Checkboxes + Reset/Apply buttons), `DrawerLongContent` (body scrolls, header and footer fixed; play: `body.scrollHeight > body.clientHeight`), `Drawer360`. Plays open via the trigger, press Escape, and assert focus return. Commit `feat(ui): add the drawer variant of dialog`.

- [ ] **Step 4: Popover tests (RED):**

```tsx
it("opens from its trigger, is named by its title, and Escape returns focus", async () => {
  const user = userEvent.setup();
  render(<Popover trigger={<Button>What's in the thali?</Button>} title="Thali">Dal, sabzi, 3 rotis, rice, raita.</Popover>);
  await user.click(screen.getByRole("button", { name: "What's in the thali?" }));
  expect(screen.getByRole("dialog", { name: "Thali" })).toBeVisible();
  await user.keyboard("{Escape}");
  expect(screen.getByRole("button", { name: "What's in the thali?" })).toHaveFocus();
});
it("close button closes it", async () => { /* hasCloseButton, click "Close" → dialog gone */ });
it("passes side and align to the content", async () => { /* open, expect data-side="top", data-align="start" */ });
it("is accessible open", async () => { /* open, then await expectNoA11yViolations(document.body) */ });
```
Write the three stubbed tests out fully, following the first. Run → FAIL.

- [ ] **Step 5: Implement Popover** with `Popover as RadixPopover` from `radix-ui`: Root (open state), Trigger asChild, Portal (container), Content (`side`, `align`, `sideOffset={8}`, `collisionPadding={16}`, `aria-labelledby` the title id when there is a title), Arrow when `hasArrow`, and a Close IconButton when `hasCloseButton`. Title via `createElement(headingTag(headingLevel ?? 2))`. `withSx` on Content. → PASS. Stories: Playground, Sides (four), WithTitle, InfoPopover (Info icon IconButton), Controlled, OnSurfaces, Mobile360 (the play asserts the content's rect stays inside the viewport). Commit `feat(ui): add the popover molecule`.

- [ ] **Step 6: Menu tests (RED).** The MUI behaviours, one test each:

```tsx
function OutletMenu({ onSelect = vi.fn() }: { onSelect?: () => void }) {
  return (
    <Menu>
      <MenuTrigger asChild><IconButton icon={MoreVertical} label="More options" /></MenuTrigger>
      <MenuContent aria-label="Outlet actions">
        <MenuItem icon={Share2} onSelect={onSelect}>Share outlet</MenuItem>
        <MenuItem icon={Phone} shortcut="Call">Call Sector 57</MenuItem>
        <MenuItem icon={MapPin} disabled>Directions (opening soon)</MenuItem>
        <MenuDivider />
        <MenuItem icon={Flag} color="danger">Report a problem</MenuItem>
      </MenuContent>
    </Menu>
  );
}
it("the 3-dot IconButton opens the menu with aria wiring (MUI basic menu)", async () => {
  const user = userEvent.setup();
  render(<OutletMenu />);
  const trigger = screen.getByRole("button", { name: "More options" });
  expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  await user.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("menu", { name: "Outlet actions" })).toBeVisible();
  expect(screen.getAllByRole("menuitem")).toHaveLength(4);
});
it("selecting an item fires onSelect, closes the menu and returns focus to the trigger (MUI onClose)", async () => {
  const user = userEvent.setup(); const onSelect = vi.fn();
  render(<OutletMenu onSelect={onSelect} />);
  await user.click(screen.getByRole("button", { name: "More options" }));
  await user.click(screen.getByRole("menuitem", { name: "Share outlet" }));
  expect(onSelect).toHaveBeenCalledTimes(1);
  expect(screen.queryByRole("menu")).toBeNull();
  expect(screen.getByRole("button", { name: "More options" })).toHaveFocus();
});
it("keyboard: Enter opens on the first item, arrows skip disabled, Home/End, typeahead, Escape closes", async () => {
  const user = userEvent.setup();
  render(<OutletMenu />);
  screen.getByRole("button", { name: "More options" }).focus();
  await user.keyboard("{Enter}");
  expect(screen.getByRole("menuitem", { name: "Share outlet" })).toHaveFocus();
  await user.keyboard("{ArrowDown}{ArrowDown}");
  expect(screen.getByRole("menuitem", { name: "Report a problem" })).toHaveFocus(); // skipped the disabled one
  await user.keyboard("{Home}");
  expect(screen.getByRole("menuitem", { name: "Share outlet" })).toHaveFocus();
  await user.keyboard("c");
  expect(screen.getByRole("menuitem", { name: /Call Sector 57/ })).toHaveFocus();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).toBeNull();
  expect(screen.getByRole("button", { name: "More options" })).toHaveFocus();
});
it("clicking outside closes it (MUI backdrop click)", async () => { /* open, user.click(document.body) → no menu */ });
it("disabled items are aria-disabled and do not fire onSelect", async () => {});
it("isSelected marks the row (MUI selected menu) and danger colours the text", async () => {
  /* <MenuItem isSelected> → toHaveClass("bg-surface-brand-soft") and data-selected; color="danger" → "text-text-danger" */
});
it("isDense uses 36px rows; maxHeight makes a long menu scroll (MUI long menu)", async () => {
  /* 20 items, maxHeight="sm" → content toHaveClass("max-h-menu-max-sm","overflow-y-auto") */
});
it("radio and checkbox items expose menuitemradio/menuitemcheckbox with aria-checked", async () => {});
it("a submenu opens with ArrowRight and closes with ArrowLeft", async () => {});
it("asChild renders a link item", async () => { /* <MenuItem asChild><a href="/menu">Full menu</a></MenuItem> → role menuitem, href */ });
it("is accessible open", async () => { /* open → expectNoA11yViolations(document.body) */ });
```
Write every stubbed test out fully in the same style. Run `pnpm nx test ui -- menu.test` → FAIL.

- [ ] **Step 7: Implement Menu** with `DropdownMenu as RadixMenu` from `radix-ui`. Each exported part is a thin styled wrapper around the matching Radix part: `Menu`=Root, `MenuTrigger`=Trigger, `MenuContent`=Portal+Content (the shared panel classes + `withSx`, `isDense` and `maxHeight` variants, `loop` on), `MenuItem`=Item, `MenuDivider`=Separator, `MenuLabel`=Label, `MenuCheckboxItem`/`MenuRadioGroup`/`MenuRadioItem`, `SubMenu`=Sub, `SubMenuTrigger`=SubTrigger (with a ChevronRight), `SubMenuContent`=Portal+SubContent. `MenuItem` lays out: Icon atom 18px (`text-text-muted`, danger → inherits) · label (+ `description` below in `text-caption text-text-muted`) · `shortcut` (`ms-auto text-caption text-text-muted`). `isSelected` sets `data-selected` + the selected classes. `hasDivider` adds `border-b border-border-subtle`. Checkbox/radio indicators use the Icon atom (Check / a filled brand diamond via `lib/brand-diamond` at 12px). Highlight = `data-highlighted:bg-surface-sunken`. → PASS.

- [ ] **Step 8: Stories (`Molecules/Menu`)**, mirroring MUI's demo list:
  - `ThreeDotMenu` (IconButton `MoreVertical`, label "More options": Share / Call / Directions / divider / Report). Play: click → menu → choose Share → focus back on the 3-dot button.
  - `BasicMenu` (a Button "Account": My orders, Saved addresses, Sign out).
  - `IconMenu` (icons + shortcuts).
  - `DenseMenu` (`isDense`).
  - `SelectedMenu` ("Sort by" with the current option `isSelected`).
  - `PositionedMenu` (side/align: top-end, bottom-start).
  - `LongMenu` (3-dot with 20 veg dishes, `maxHeight="sm"`; play: content scrolls).
  - `AccountMenu` (avatar trigger, labels, dividers, danger Sign out).
  - `RadioMenu` (Sort: Popular / Price low to high / Newest).
  - `CheckboxMenu` (Jain, No onion-garlic, Gluten-free).
  - `NestedMenu` (Outlet → Sector 57 / MKM Market).
  - `OnSurfaces` and `Mobile360` (the 3-dot menu at the right edge stays inside the viewport).

  Run `pnpm nx run storybook:test -- menu.stories` → PASS. Export every part from index.ts. Commit `feat(ui): add the menu molecule (mui menu, incl. the 3-dot menu)`.

### Task 14b: ToggleButton and ToggleButtonGroup (MUI ToggleButton)

**Files:**
- Create: `packages/ui/src/atoms/toggle-button/toggle-button.{tsx,test.tsx,stories.tsx}`
- Create: `packages/ui/src/molecules/toggle-button-group/toggle-button-group.{tsx,test.tsx,stories.tsx}`
- Create: `packages/design-tokens/tokens/component/toggle-button.json` (heights 32/40/48 = sm/md/lg, matching Button) + `lib/component-variants.ts` registration

**Interfaces (MUI names; `exclusive` and `value` work exactly as in MUI):**
```ts
// Atom: one pressable toggle (MUI <ToggleButton value selected onChange>). Radix `Toggle` when standalone.
export interface ToggleButtonProps extends BasePropsWithColor<"button"> {
  value: string;                                    // required, as in MUI
  selected?: boolean; defaultSelected?: boolean;    // standalone use (aria-pressed)
  onSelectedChange?: (selected: boolean) => void;   // standalone use
  icon?: IconComponent;                             // icon-only needs aria-label (enforced by a test + JSDoc)
  size?: "sm" | "md" | "lg";                        // MUI small/medium/large
  color?: "brand" | "neutral";                      // MUI standard/primary → neutral/brand
  isFullWidth?: boolean; disabled?: boolean; children?: ReactNode;
}
// Molecule: MUI <ToggleButtonGroup value exclusive onChange orientation size color fullWidth>
export type ToggleButtonGroupProps = BaseProps<"div"> & {
  orientation?: "horizontal" | "vertical"; size?: "sm" | "md" | "lg"; color?: "brand" | "neutral";
  isFullWidth?: boolean; disabled?: boolean; "aria-label": string;
  /** MUI's "enforce value set": exclusive groups can't be emptied by clicking the selected button. */
  isValueRequired?: boolean;
  children: ReactNode; // ToggleButton children
} & (
  | { exclusive: true; value?: string | null; defaultValue?: string | null; onValueChange?: (value: string | null) => void }
  | { exclusive?: false; value?: string[]; defaultValue?: string[]; onValueChange?: (value: string[]) => void }
);
```
**Behaviour (MUI parity):**
- Exclusive: one value or `null`. Clicking the selected button deselects it (→ `null`) unless `isValueRequired`.
- Multiple: an array, each button toggles independently.
- Buttons join into one segmented control with shared borders and the outer corners rounded. `orientation="vertical"` stacks them.
- Selected = `bg-surface-brand-soft text-text-brand border-border-brand` (brand) or `bg-surface-sunken text-text-heading` (neutral).
- Keyboard: the group is ONE tab stop (roving focus, arrows move, Home/End). Space/Enter toggles. Built on `ToggleGroup as RadixToggleGroup` from `radix-ui` (`type="single"` for exclusive, `"multiple"` otherwise).
- Inside a group, each ToggleButton renders `RadixToggleGroup.Item`; standalone it renders `Toggle as RadixToggle`. Use a React context to tell which.
- Not the same as ChipGroup: ChipGroup is a form value control for chips (with name/status/message). ToggleButtonGroup is a toolbar control (view switcher, alignment, quick filters). The AUTHORING Shared API section gets one line saying when to use which.

- [ ] **Step 1: Failing tests:**

```tsx
it("standalone: aria-pressed toggles and onSelectedChange fires", async () => {
  const user = userEvent.setup(); const onSelectedChange = vi.fn();
  render(<ToggleButton value="veg" onSelectedChange={onSelectedChange}>Veg only</ToggleButton>);
  const b = screen.getByRole("button", { name: "Veg only" });
  expect(b).toHaveAttribute("aria-pressed", "false");
  await user.click(b);
  expect(b).toHaveAttribute("aria-pressed", "true");
  expect(onSelectedChange).toHaveBeenCalledWith(true);
});
it("exclusive group: one value, re-click deselects to null (MUI default)", async () => {
  const user = userEvent.setup(); const onValueChange = vi.fn();
  render(
    <ToggleButtonGroup exclusive aria-label="View" defaultValue="grid" onValueChange={onValueChange}>
      <ToggleButton value="grid" icon={LayoutGrid} aria-label="Grid view" />
      <ToggleButton value="list" icon={List} aria-label="List view" />
    </ToggleButtonGroup>
  );
  await user.click(screen.getByRole("radio", { name: "List view" }));
  expect(onValueChange).toHaveBeenLastCalledWith("list");
  await user.click(screen.getByRole("radio", { name: "List view" }));
  expect(onValueChange).toHaveBeenLastCalledWith(null);
});
it("isValueRequired keeps one selected (MUI enforce value set)", async () => { /* re-click selected → no change, still checked */ });
it("multiple group: toggles independently and reports an array", async () => {
  /* Jain / No onion-garlic / Gluten-free → click two → onValueChange(["jain","no-onion-garlic"]); roles: button + aria-pressed */
});
it("one tab stop; arrows move focus; Space toggles", async () => {});
it("vertical orientation, sizes, isFullWidth and disabled map to their classes/attributes", () => {});
it("icon-only buttons are named by aria-label", () => {});
it("takes sx, native props and ref on the group root", () => {});
it("is accessible", async () => {});
```
(Radix gives exclusive items `role="radio"` inside a `radiogroup`, and multiple items `role="button"` + `aria-pressed`. The assertions follow that.) Write the stubs out fully. Run → FAIL.

- [ ] **Step 2: Implement** both per the interfaces and behaviour above. Exclusive `null` handling: Radix single emits `""` on deselect, so map `""` → `null` out and `null` → `""` in. `isValueRequired` ignores the `""` emission. → PASS.

- [ ] **Step 3: Stories:**
  - `Atoms/ToggleButton`: `Standalone`, `Sizes`, `Colors`, `IconOnly`, `Disabled`.
  - `Molecules/ToggleButtonGroup` (MUI demo list):
    - `Exclusive` (text alignment start/center/end icons).
    - `Multiple` (diet: Jain / No onion-garlic / Gluten-free).
    - `EnforceValueSet` (`isValueRequired`).
    - `ViewSwitcher` (Grid / List icons, the menu page use).
    - `Vertical`, `Sizes`, `Colors`, `FullWidth`, `Disabled`, `OnSurfaces`.
    - `Mobile360` (a full-width 3-button group fits).
  - Plays cover click, keyboard and the null deselect.

  Run `pnpm nx run storybook:test -- toggle-button` → PASS. Export both from index.ts. Commit `feat(ui): add the toggle button and toggle button group`.

---

