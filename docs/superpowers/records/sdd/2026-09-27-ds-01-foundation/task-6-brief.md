### Task 6: Lint and format gates — layering, naming, token-only classes, class order

**Files:**

- Modify: `tools/eslint-config/atomic-layering.js`, `tools/eslint-config/base.js`, `tools/eslint-config/react.js`, `.prettierrc`, root `package.json` (devDep)

**Interfaces:**

- Produces LAWs later tasks must satisfy: layers `atoms → molecules → organisms → layouts`; atoms import only `../icon/*` among siblings; `@typescript-eslint/naming-convention` at `error`; `tailwindcss/no-arbitrary-value` and `tailwindcss/no-custom-classname` at `error` with `functions` including `componentVariants`; Prettier sorts classes (incl. inside `componentVariants({...})`).

- [ ] **Step 1: Atomic layering — `layouts` tier and the atom rule**

Replace `tools/eslint-config/atomic-layering.js` body (keep the long explanatory comment, update its layer list):

```js
const layerOrder = ["atoms", "molecules", "organisms", "layouts"];

const upperLayerPatterns = (layer) =>
  layerOrder.slice(layerOrder.indexOf(layer) + 1).map((upper) => ({
    group: [`**/${upper}/**`, `**/${upper}`],
    message: `Atomic layering: ${layer} cannot import from ${upper} (layers only go upward).`,
  }));

const atomicLayering = [
  {
    files: ["**/src/atoms/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...upperLayerPatterns("atoms"),
            {
              // Design system tier rule: "an atom imports nothing but Icon".
              group: ["../*", "!../icon", "../*/**", "!../icon/**"],
              message:
                "Atomic layering: an atom may import only the Icon atom (plus ../../lib and packages).",
            },
          ],
        },
      ],
    },
  },
  ...["molecules", "organisms"].map((layer) => ({
    files: [`**/src/${layer}/**/*`],
    rules: { "no-restricted-imports": ["error", { patterns: upperLayerPatterns(layer) }] },
  })),
];

export default atomicLayering;
```

- [ ] **Step 2: Naming convention to error**

In `tools/eslint-config/base.js` replace the naming line and its comment with:

```js
      // LAW since the design system rewrite (drift ledger P-08 closed).
      "@typescript-eslint/naming-convention": ["error", ...namingConvention],
```

- [ ] **Step 3: Token-only classes; Prettier owns order**

At the end of `tools/eslint-config/react.js`, replace `tailwindcss.configs.recommended,` with:

```js
  tailwindcss.configs.recommended,
  {
    files: ["**/*.tsx", "**/*.jsx", "**/*.ts"],
    settings: {
      tailwindcss: {
        // `componentVariants` is the design system's configured tailwind-variants instance.
        functions: ["componentVariants", "tv", "cn", "clsx"],
      },
    },
    rules: {
      // Prettier (prettier-plugin-tailwindcss) owns class order; two sorters would fight.
      "tailwindcss/classnames-order": "off",
      // Only token-backed utilities: a missing value becomes a token, never an arbitrary value.
      "tailwindcss/no-arbitrary-value": "error",
      "tailwindcss/no-custom-classname": "error",
    },
  },
```

(Before relying on the setting, confirm the key name `functions` in the installed plugin README: `node_modules/.pnpm/eslint-plugin-tailwindcss@*/node_modules/eslint-plugin-tailwindcss/README.md`.)

- [ ] **Step 4: Prettier class sorting**

Run: `pnpm add -D -w prettier-plugin-tailwindcss`
Replace `.prettierrc`:

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "singleQuote": false,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./packages/ui/tailwind.css",
  "tailwindFunctions": ["componentVariants"]
}
```

- [ ] **Step 5: Probes — each new LAW must fail on a deliberate violation**

For each probe: create the file, run the command, confirm the expected error text, delete the file. Paste each output in the report.

1. Atom imports a sibling atom — create `packages/ui/src/atoms/probe/probe.tsx`:
   ```tsx
   import { Probe2 } from "../probe2/probe2";
   export function Probe() {
     return <Probe2 />;
   }
   ```
   Run `pnpm nx lint @pink-paprikaa-web/ui --skip-nx-cache` → expect `an atom may import only the Icon atom`.
2. Arbitrary value — `packages/ui/src/atoms/probe/probe.tsx`: `export function Probe() { return <div className="h-[13px]" />; }` → expect `tailwindcss/no-arbitrary-value`.
3. Unknown class — `className="rounded-lgg"` → expect `tailwindcss/no-custom-classname`.
4. Stock Tailwind colour — `className="bg-red-500"` → expect `tailwindcss/no-custom-classname` (the namespace is cleared).
5. Boolean naming — `packages/utils/src/probe.ts`: `export const open = true;` → `pnpm nx lint @pink-paprikaa-web/utils --skip-nx-cache` → expect `@typescript-eslint/naming-convention`.
6. Class order — in the probe TSX write `className="text-text-muted p-4 flex"` and run `pnpm exec prettier --check packages/ui/src/atoms/probe/probe.tsx` → expect a formatting difference; `--write` then shows `flex p-4 text-text-muted`.

Remove all probe files (`git status` must show none).

- [ ] **Step 6: Workspace-wide format pass (its own commit) and lint sweep**

Run: `pnpm nx format:write && pnpm nx run-many -t lint --skip-nx-cache --outputStyle=static 2>&1 | tail -20`
Expected: lint green across all projects. If the naming rule now errors in existing code (apps/web, tools), rename the symbol (never disable the rule) and include those renames in the Step 7 commit.

- [ ] **Step 7: Commit (two commits)**

```bash
git add -A -- ':!*.md'   # formatting changes from prettier-plugin-tailwindcss only
git commit -m "style: sort Tailwind classes with prettier-plugin-tailwindcss

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>" || true
git add -A tools/eslint-config .prettierrc package.json pnpm-lock.yaml
git commit -m "feat(tools): token-only classes, strict naming and the layouts tier

no-arbitrary-value and no-custom-classname make token-backed utilities the only
classes that lint; naming-convention is an error; the atomic layering rule
knows the design system's layouts tier and that an atom imports only Icon.
Each rule was probed with a deliberate violation (outputs below).

<paste the six probe outputs, one line each>

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(If Step 6 produced no formatting changes, the first commit is skipped — that is what `|| true` allows.)

---

