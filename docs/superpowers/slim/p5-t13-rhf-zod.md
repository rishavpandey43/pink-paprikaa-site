# P5 T13 — React Hook Form + Zod (spec D17)

**Files:** create `apps/storybook/src/patterns/{enquiry-form.tsx,forms.stories.tsx}`. `pnpm add -D react-hook-form @hookform/resolvers zod --filter @pink-paprikaa-web/storybook`.

**What it is:** a catering enquiry proving D17:

- Native-backed controls take `{...register()}` unmodified.
- Value controls take `<Controller>`.
- One Zod schema owns validation and the output types.
- Keyboard-only completion.

**Exports:** `EnquiryForm({ onSubmit })`, `enquirySchema`, `ENQUIRY_MESSAGES`, `ENQUIRY_DEFAULTS`, `EnquiryInput`, `EnquiryValues`.

**Fields**

- name — Input, trimmed
- phone — strip spaces and dashes; Indian mobile, `+91` optional
- occasion — Select, 4 options
- date — `type="date"`
- guests — QuantityStepper, default 10, min 15, max 500
- meal — ChoiceCardGroup: Classic ₹149 / Signature ₹199 / Maharaja ₹269
- spice — ChipGroup `single`
- service — RadioGroup: delivered / setup
- noOnionGarlic — CheckCard
- notes — multiline, ≤ 500 characters
- consent — Checkbox, must be true

The form sets `noValidate`. A successful submit shows the Alert "Enquiry sent".

**Story:** `Molecules/Field/React Hook Form + Zod` → `KeyboardOnly`, with `onSubmit: fn()`. The play runs two steps:

1. An empty submit shows all 9 messages, focuses Name, and does not call `onSubmit`.
2. A full keyboard fill submits the exact parsed object (`phone "9876543210"`, `guests 15`, …).

Probe: removing `noValidate` must fail step 1.

**Gotchas (the built code differs from the plan)**

- Stepper buttons are "Add one" / "Remove one"; the plan's `/^Increase/` fails.
- ChipGroup and ChoiceCardGroup own their `status` and `message`. Never wrap them in Field.
- ChipGroup `ref={field.ref}`; ChoiceCardGroup takes `register()` directly.
- Don't give the consent Checkbox Field's `id`: two labels fail axe.
- Verify RHF/resolver/Zod 4 APIs in `node_modules`.
- Commit `pnpm-lock.yaml`; `--frozen-lockfile` must pass.

**Commit:** `feat(storybook): React Hook Form + Zod pattern`
