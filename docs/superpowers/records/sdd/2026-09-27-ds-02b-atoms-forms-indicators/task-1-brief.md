### Task 1: Shared form status and a register() double

**Files:**

- Create: `packages/ui/src/lib/field-status.ts`, `packages/ui/src/lib/field-status.spec.ts`
- Modify: `packages/ui/vitest.setup.ts`, `packages/ui/src/index.ts`

**Interfaces:**

- Consumes: `IconComponent` (`atoms/icon/icon`), Vitest's `vi`.
- Produces: `type FieldStatus = "default" | "error" | "success" | "warning"` and `FIELD_STATUS_ICON: Readonly<Record<"error" | "success" | "warning", IconComponent>>` (contract §1); `fakeRegister(name: string): { name; onChange; onBlur; ref }` (all `vi.fn()`); `export type { FieldStatus }` from the barrel.

- [ ] **Step 1: Tokens**

None — this task adds no visual value, so no token, list or contrast pair.

- [ ] **Step 2: Write the failing test**

`packages/ui/src/lib/field-status.spec.ts`:

```ts
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
```

- [ ] **Step 3: Run it to verify it fails**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: FAIL — `Cannot find module './field-status'`.

- [ ] **Step 4: Implement**

`packages/ui/src/lib/field-status.ts`:

```ts
import { CircleAlert, CircleCheck, TriangleAlert } from "lucide-react";

import type { IconComponent } from "../atoms/icon/icon";

/**
 * The one form status system (design system readme §3.8). Every field, choice group and Field
 * speaks it. A status is never shown by colour alone: it always comes with its glyph and a
 * message (spec §5.5).
 */
export type FieldStatus = "default" | "error" | "success" | "warning";

/** The glyph each status draws — the design system's Field.jsx: circle-alert, circle-check, triangle-alert. */
export const FIELD_STATUS_ICON: Readonly<Record<Exclude<FieldStatus, "default">, IconComponent>> = {
  error: CircleAlert,
  success: CircleCheck,
  warning: TriangleAlert,
};
```

In `packages/ui/vitest.setup.ts`, change `import { expect } from "vitest";` to `import { expect, vi } from "vitest";` and add after `expectNoA11yViolations`:

```ts
/**
 * What react-hook-form's `register(name)` returns — `{ name, onChange, onBlur, ref }` — as spies.
 * Spread it onto a native-backed control to prove `{...register("field")}` works (spec D17)
 * without making react-hook-form a dependency of the library.
 */
export function fakeRegister(name: string) {
  return { name, onChange: vi.fn(), onBlur: vi.fn(), ref: vi.fn() };
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `pnpm nx test @pink-paprikaa-web/ui --skip-nx-cache 2>&1 | tail -8`
Expected: PASS.

- [ ] **Step 6: Stories**

None — no component.

- [ ] **Step 7: Export**

Add to `packages/ui/src/index.ts`:

```ts
export type { FieldStatus } from "./lib/field-status";
```

- [ ] **Step 8: Format and gate**

```bash
pnpm exec prettier --write packages/ui/src/lib/field-status.ts packages/ui/src/lib/field-status.spec.ts packages/ui/vitest.setup.ts packages/ui/src/index.ts
```

Then run the gate. Expected: green.

- [ ] **Step 9: Commit**

```bash
git add -A packages/ui
git commit -m "feat(ui): add the shared form status and a register() test double

FIELD_STATUS_ICON is the one status glyph map every field, group and Field
uses (circle-alert, circle-check, triangle-alert, as the design system's
Field.jsx draws them). fakeRegister mirrors what react-hook-form's
register() returns, so control tests prove RHF compatibility without the
library depending on it.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

