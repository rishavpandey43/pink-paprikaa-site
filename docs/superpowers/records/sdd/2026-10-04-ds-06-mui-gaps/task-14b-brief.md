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

