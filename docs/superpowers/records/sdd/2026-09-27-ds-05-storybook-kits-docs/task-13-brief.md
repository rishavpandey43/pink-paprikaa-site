### Task 13: The React Hook Form + Zod pattern (spec D17)

A realistic catering enquiry — the handoff's real dawats, services and guest minimum (`design/rates.js` → `catering`) — built on the library's controls with one Zod schema driving validation and types. It proves the D17 contract: native-backed controls take `{...register()}` unmodified, value-based controls take `<Controller>`, `Field` renders the message, and the whole form can be completed from the keyboard.

**Files:**

- Create: `apps/storybook/src/patterns/{enquiry-form.tsx,forms.stories.tsx}`
- Modify: `apps/storybook/package.json` (devDependencies via `pnpm add`)

**Dev reference:** none (new in the rewrite, spec D17 — dev has no form-library story)

**Interfaces:**

- Consumes: `Alert`, `AutoGrid`, `Button`, `Card`, `CheckCard`, `Checkbox`, `ChipGroup`, `ChoiceCardGroup`, `ChoiceOption`, `Field`, `FieldProps`, `Input`, `QuantityStepper`, `Radio`, `RadioGroup`, `Select`, `SelectOption`, `Stack` (ui); `formatRupees` (utils).
- Produces: `enquirySchema`, `ENQUIRY_MESSAGES`, `ENQUIRY_DEFAULTS`, types `EnquiryInput`/`EnquiryValues`, `EnquiryForm`; story `Molecules/Field/React Hook Form + Zod` → `KeyboardOnly`.

- [ ] **Step 1: Install and verify the installed APIs**

```bash
pnpm add -D react-hook-form @hookform/resolvers zod --filter @pink-paprikaa-web/storybook
node -p "['react-hook-form','@hookform/resolvers','zod'].map((p) => p + ' ' + require(require.resolve(p + '/package.json', { paths: ['apps/storybook'] })).version).join('\n')"
```

Expected: react-hook-form 7.x (or later), `@hookform/resolvers` 5.x, zod 4.x. Then confirm, by reading the installed type definitions (never memory):

- `apps/storybook/node_modules/react-hook-form/dist/types/form.d.ts` — `UseFormProps<TFieldValues, TContext, TTransformedValues>` and `handleSubmit` passing `TTransformedValues` to the valid callback.
- `apps/storybook/node_modules/@hookform/resolvers/zod/dist/zod.d.ts` — `zodResolver` accepts a Zod 4 schema and returns `Resolver<Input, Context, Output>`.
- `apps/storybook/node_modules/zod` — `z.string().trim()`, `.transform().pipe()`, `.refine(fn, { error })`, `z.string({ error })` exist in the installed major.

If a name differs, adapt Step 3 to the installed API and note it in the report.

- [ ] **Step 2: Write the failing keyboard-only story (Review Focus 5)**

Create `apps/storybook/src/patterns/forms.stories.tsx`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";

import { expect, fn, type UserEventObject, waitFor } from "storybook/test";

import { ENQUIRY_MESSAGES, EnquiryForm } from "./enquiry-form";

/** The messages an empty submit must show — every required field. */
const REQUIRED_MESSAGES = [
  ENQUIRY_MESSAGES.name,
  ENQUIRY_MESSAGES.phone,
  ENQUIRY_MESSAGES.occasion,
  ENQUIRY_MESSAGES.guestsMin,
  ENQUIRY_MESSAGES.date,
  ENQUIRY_MESSAGES.meal,
  ENQUIRY_MESSAGES.spice,
  ENQUIRY_MESSAGES.service,
  ENQUIRY_MESSAGES.consent,
];

const MAX_TABS = 80;

/** Press Tab until `target` has focus — proves it is reachable by keyboard, in document order. */
async function tabTo(user: UserEventObject, target: HTMLElement): Promise<void> {
  for (
    let presses = 0;
    presses < MAX_TABS && target.ownerDocument.activeElement !== target;
    presses += 1
  ) {
    await user.tab();
  }
  await expect(target).toHaveFocus();
}

const meta = {
  title: "Molecules/Field/React Hook Form + Zod",
  component: EnquiryForm,
  args: { onSubmit: fn() },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "The design system is form-library-agnostic and RHF-compatible by contract (spec D17). Native-backed controls — Input, Select, Checkbox, Radio, ChoiceCardGroup, CheckCard — take `{...register(\"field\")}` unmodified; value-based controls — QuantityStepper, ChipGroup — take `<Controller>` (`value`, `onValueChange`, `onBlur`, `name`); Field renders the message from `formState.errors` through `status` and `message`. One Zod schema drives validation and the submitted types. The form sets `noValidate` so validation is the schema's, not the browser's. react-hook-form, @hookform/resolvers and zod are devDependencies of this Storybook only — never of packages/ui.",
      },
    },
  },
} satisfies Meta<typeof EnquiryForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const KeyboardOnly: Story = {
  name: "Enquiry form — keyboard only",
  play: async ({ args, canvas, step, userEvent }) => {
    const submit = canvas.getByRole("button", { name: "Send enquiry" });

    await step(
      "an empty submit shows every message and focuses the first invalid field",
      async () => {
        await tabTo(userEvent, submit);
        await userEvent.keyboard("{Enter}");
        for (const message of REQUIRED_MESSAGES) {
          await expect(await canvas.findByText(message)).toBeVisible();
        }
        await expect(canvas.getByRole("textbox", { name: /^Name/ })).toHaveFocus();
        await expect(args.onSubmit).not.toHaveBeenCalled();
      }
    );

    await step("every field completed from the keyboard submits the parsed values", async () => {
      await userEvent.keyboard("Kavya Menon");

      await tabTo(userEvent, canvas.getByRole("textbox", { name: /^Mobile number/ }));
      await userEvent.keyboard("98765 43210");

      const occasion = canvas.getByRole("combobox", { name: /^Occasion/ });
      await tabTo(userEvent, occasion);
      // A native <select> is operated by the browser itself; user-event cannot drive its
      // keyboard UI, so the value is chosen directly once the control has keyboard focus.
      await userEvent.selectOptions(occasion, "birthday");

      await tabTo(userEvent, canvas.getByLabelText(/^Date/));
      await userEvent.keyboard("2026-10-24");

      const increase = canvas.getByRole("button", { name: /^Increase/ });
      await tabTo(userEvent, increase);
      for (let press = 0; press < 5; press += 1) {
        await userEvent.keyboard("{Enter}");
      }

      await tabTo(userEvent, canvas.getByRole("radio", { name: /^Classic Dawat/ }));
      await userEvent.keyboard("{ArrowDown}");
      await expect(canvas.getByRole("radio", { name: /^Signature Dawat/ })).toBeChecked();

      await tabTo(userEvent, canvas.getByRole("radio", { name: "Mild" }));
      await userEvent.keyboard("{ArrowRight}");
      await expect(canvas.getByRole("radio", { name: "Medium" })).toHaveFocus();
      await userEvent.keyboard(" ");
      await expect(canvas.getByRole("radio", { name: "Medium" })).toBeChecked();

      const delivered = canvas.getByRole("radio", { name: /^Delivered/ });
      await tabTo(userEvent, delivered);
      await userEvent.keyboard(" ");
      await expect(delivered).toBeChecked();

      await tabTo(userEvent, canvas.getByRole("checkbox", { name: /^No onion, no garlic/ }));
      await userEvent.keyboard(" ");

      await tabTo(userEvent, canvas.getByRole("textbox", { name: /^Notes/ }));
      await userEvent.keyboard("Jain thali for four of the guests.");

      await tabTo(userEvent, canvas.getByRole("checkbox", { name: "Reply to me on WhatsApp" }));
      await userEvent.keyboard(" ");

      await tabTo(userEvent, submit);
      await userEvent.keyboard("{Enter}");

      await waitFor(() => expect(args.onSubmit).toHaveBeenCalledOnce());
      await expect(args.onSubmit).toHaveBeenCalledWith({
        name: "Kavya Menon",
        phone: "9876543210",
        occasion: "birthday",
        guests: 15,
        date: "2026-10-24",
        meal: "signature",
        spice: "medium",
        service: "delivered",
        noOnionGarlic: true,
        notes: "Jain thali for four of the guests.",
        consent: true,
      });
      for (const message of REQUIRED_MESSAGES) {
        await expect(canvas.queryByText(message)).toBeNull();
      }
      await expect(await canvas.findByText("Enquiry sent")).toBeVisible();
    });
  },
};
```

(The increase button's name, the stepper's starting value of 10 and five presses to reach the 15-guest minimum come from Task 0 A2; adjust the regex, not the count, if the built name differs.)

Run: `pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- forms.stories 2>&1 | tail -8`
Expected: FAIL — `Failed to resolve import "./enquiry-form"`.

- [ ] **Step 3: The schema and the form**

Create `apps/storybook/src/patterns/enquiry-form.tsx`:

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Controller, type FieldError, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Alert,
  AutoGrid,
  Button,
  Card,
  CheckCard,
  Checkbox,
  ChipGroup,
  ChoiceCardGroup,
  type ChoiceOption,
  Field,
  type FieldProps,
  Input,
  QuantityStepper,
  Radio,
  RadioGroup,
  Select,
  type SelectOption,
  Stack,
} from "@pink-paprikaa-web/ui";
import { formatRupees } from "@pink-paprikaa-web/utils";

type FieldStatus = NonNullable<FieldProps["status"]>;

/** Catering minimum — the handoff's rates.js `catering.minGuests`. */
const MIN_GUESTS = 15;
const MAX_GUESTS = 500;
/** An Indian mobile: optional +91, then ten digits starting 6–9. */
const INDIAN_MOBILE = /^(?:\+91)?[6-9]\d{9}$/;

/** Every message the form can show — one source for the schema and its tests. */
export const ENQUIRY_MESSAGES = {
  name: "Tell us your name",
  phone: "Enter a 10-digit Indian mobile number",
  occasion: "Choose an occasion",
  guestsMin: `Catering starts at ${String(MIN_GUESTS)} guests`,
  guestsMax: `For more than ${String(MAX_GUESTS)} guests, call us`,
  date: "Pick a date",
  meal: "Choose a dawat",
  spice: "Pick a spice level",
  service: "Choose how it arrives",
  notes: "Keep notes under 500 characters",
  consent: "We need your OK to reply on WhatsApp",
} as const;

const OCCASIONS: SelectOption[] = [
  { value: "birthday", label: "Birthday" },
  { value: "office-lunch", label: "Office lunch" },
  { value: "pooja", label: "Pooja or prasad" },
  { value: "family-function", label: "Family function" },
];

/** The handoff's three dawats (rates.js `catering.dawats`), per head. */
const DAWATS: ChoiceOption[] = [
  {
    value: "classic",
    title: "Classic Dawat",
    price: `${formatRupees(149)} a head`,
    description: "Honest, homely food, and plenty of it.",
  },
  {
    value: "signature",
    title: "Signature Dawat",
    price: `${formatRupees(199)} a head`,
    badge: "Most ordered",
    description: "The one we would put in front of our own family.",
  },
  {
    value: "maharaja",
    title: "Maharaja Dawat",
    price: `${formatRupees(269)} a head`,
    description: "For the days that deserve a proper table.",
  },
];

const SPICE_LEVELS = [
  { value: "mild", label: "Mild" },
  { value: "medium", label: "Medium" },
  { value: "hot", label: "Hot" },
  { value: "extra-hot", label: "Extra Hot" },
];

/** The handoff's service options (rates.js `catering.service`). */
const SERVICES = [
  { value: "delivered", label: "Delivered", description: "Sealed insulated trays." },
  {
    value: "setup",
    label: "Full setup and service",
    description: "Buffet tables, chafing dishes, serving staff and cleanup.",
  },
];

export const enquirySchema = z.object({
  name: z.string().trim().min(1, ENQUIRY_MESSAGES.name),
  phone: z
    .string()
    .transform((value) => value.replace(/[\s-]/g, ""))
    .pipe(z.string().regex(INDIAN_MOBILE, ENQUIRY_MESSAGES.phone)),
  occasion: z.string().min(1, ENQUIRY_MESSAGES.occasion),
  guests: z
    .number()
    .int()
    .min(MIN_GUESTS, ENQUIRY_MESSAGES.guestsMin)
    .max(MAX_GUESTS, ENQUIRY_MESSAGES.guestsMax),
  date: z.string().min(1, ENQUIRY_MESSAGES.date),
  // An unchosen radio group reaches the resolver as null, so the type error carries the message too.
  meal: z.string({ error: ENQUIRY_MESSAGES.meal }).min(1, ENQUIRY_MESSAGES.meal),
  spice: z.string({ error: ENQUIRY_MESSAGES.spice }).min(1, ENQUIRY_MESSAGES.spice),
  service: z.string({ error: ENQUIRY_MESSAGES.service }).min(1, ENQUIRY_MESSAGES.service),
  noOnionGarlic: z.boolean(),
  notes: z.string().max(500, ENQUIRY_MESSAGES.notes),
  consent: z.boolean().refine((isGiven) => isGiven, { error: ENQUIRY_MESSAGES.consent }),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;

export const ENQUIRY_DEFAULTS: EnquiryInput = {
  name: "",
  phone: "",
  occasion: "",
  guests: 10,
  date: "",
  meal: "",
  spice: "",
  service: "",
  noOnionGarlic: false,
  notes: "",
  consent: false,
};

function statusOf(error: FieldError | undefined): FieldStatus {
  return error === undefined ? "default" : "error";
}

export interface EnquiryFormProps {
  onSubmit: (values: EnquiryValues) => void;
}

/** A catering enquiry on the design system's controls, validated by one Zod schema. */
export function EnquiryForm({ onSubmit }: EnquiryFormProps) {
  const {
    control,
    formState: { errors, isSubmitSuccessful },
    handleSubmit,
    register,
  } = useForm<EnquiryInput, unknown, EnquiryValues>({
    defaultValues: ENQUIRY_DEFAULTS,
    resolver: zodResolver(enquirySchema),
  });

  return (
    <Card padding="lg" className="w-full max-w-article">
      <form
        noValidate
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
      >
        <Stack space={6}>
          <AutoGrid min="sm">
            <Field
              label="Name"
              isRequired
              status={statusOf(errors.name)}
              message={errors.name?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  {...register("name")}
                  autoComplete="name"
                  status={statusOf(errors.name)}
                />
              )}
            </Field>
            <Field
              label="Mobile number"
              hint="We reply on WhatsApp."
              isRequired
              status={statusOf(errors.phone)}
              message={errors.phone?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  {...register("phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  icon={Phone}
                  placeholder="98765 43210"
                  status={statusOf(errors.phone)}
                />
              )}
            </Field>
          </AutoGrid>

          <AutoGrid min="sm">
            <Field
              label="Occasion"
              isRequired
              status={statusOf(errors.occasion)}
              message={errors.occasion?.message}
            >
              {(field) => (
                <Select
                  {...field}
                  {...register("occasion")}
                  options={OCCASIONS}
                  placeholder="Choose an occasion"
                  status={statusOf(errors.occasion)}
                />
              )}
            </Field>
            <Field
              label="Date"
              isRequired
              status={statusOf(errors.date)}
              message={errors.date?.message}
            >
              {(field) => (
                <Input
                  {...field}
                  {...register("date")}
                  type="date"
                  status={statusOf(errors.date)}
                />
              )}
            </Field>
          </AutoGrid>

          <Field
            label="Guests"
            hint={`Catering starts at ${String(MIN_GUESTS)} guests.`}
            isRequired
            status={statusOf(errors.guests)}
            message={errors.guests?.message}
          >
            {() => (
              <Controller
                control={control}
                name="guests"
                render={({ field }) => (
                  <QuantityStepper
                    label="Guests"
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    min={1}
                    max={MAX_GUESTS}
                  />
                )}
              />
            )}
          </Field>

          <Field
            label="Dawat"
            isRequired
            status={statusOf(errors.meal)}
            message={errors.meal?.message}
          >
            {(field) => (
              <ChoiceCardGroup
                id={field.id}
                aria-describedby={field["aria-describedby"]}
                legend="Dawat"
                isLegendHidden
                options={DAWATS}
                min="sm"
                {...register("meal")}
              />
            )}
          </Field>

          <Field
            label="Spice level"
            isRequired
            status={statusOf(errors.spice)}
            message={errors.spice?.message}
          >
            {() => (
              <Controller
                control={control}
                name="spice"
                render={({ field }) => (
                  <ChipGroup
                    type="single"
                    label="Spice level"
                    name={field.name}
                    options={SPICE_LEVELS}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            )}
          </Field>

          <Field
            label="Service"
            isRequired
            status={statusOf(errors.service)}
            message={errors.service?.message}
          >
            {(field) => (
              <RadioGroup
                id={field.id}
                aria-describedby={field["aria-describedby"]}
                legend="Service"
                isLegendHidden
                status={statusOf(errors.service)}
              >
                {SERVICES.map((service) => (
                  <Radio
                    key={service.value}
                    value={service.value}
                    label={service.label}
                    description={service.description}
                    isInvalid={errors.service !== undefined}
                    {...register("service")}
                  />
                ))}
              </RadioGroup>
            )}
          </Field>

          <CheckCard
            title="No onion, no garlic"
            description="Cooked without onion and garlic for the whole order."
            {...register("noOnionGarlic")}
          />

          <Field
            label="Notes"
            isOptional
            status={statusOf(errors.notes)}
            message={errors.notes?.message}
          >
            {(field) => (
              <Input
                {...field}
                {...register("notes")}
                isMultiline
                rows={3}
                placeholder="Allergies, timings, anything we should know"
                status={statusOf(errors.notes)}
              />
            )}
          </Field>

          <Field
            label="Replies"
            isRequired
            status={statusOf(errors.consent)}
            message={errors.consent?.message}
          >
            {({ id: _labelTarget, ...field }) => (
              <Checkbox
                {...field}
                {...register("consent")}
                label="Reply to me on WhatsApp"
                isInvalid={errors.consent !== undefined}
              />
            )}
          </Field>

          <Button type="submit" size="lg" className="self-start">
            Send enquiry
          </Button>
          {isSubmitSuccessful ? (
            <Alert tone="success" title="Enquiry sent">
              We&apos;ll reply on WhatsApp.
            </Alert>
          ) : null}
        </Stack>
      </form>
    </Card>
  );
}
```

Two deliberate wiring choices, both for accessible names: group controls (ChoiceCardGroup, RadioGroup, ChipGroup, QuantityStepper) name themselves (legend or `label`), so `Field` supplies the visible label and the message and only `aria-describedby` is passed down; the consent checkbox has its own label, so `Field`'s `id` is not given to it (two labels on one input fail axe's `form-field-multiple-labels`).

- [ ] **Step 4: Run to green, probe, gate and commit**

Run the Step 2 command → PASS (one story, two steps, axe included).

Probe (Review Focus 5): remove `noValidate` from the `<form>`; rerun; expect FAIL in step 1 (the browser's own validation blocks the submit, so the schema's messages never appear). Restore; rerun green. Paste both.

```bash
pnpm nx lint @pink-paprikaa-web/storybook --fix 2>&1 | tail -5
pnpm nx run-many -t typecheck lint -p @pink-paprikaa-web/storybook --skip-nx-cache --outputStyle=static 2>&1 | tail -8
pnpm nx run @pink-paprikaa-web/storybook:test --skip-nx-cache -- forms.stories 2>&1 | tail -10
pnpm nx run @pink-paprikaa-web/storybook:build --skip-nx-cache 2>&1 | tail -4
pnpm nx format:check && pnpm install --frozen-lockfile 2>&1 | tail -2
git add apps/storybook package.json pnpm-lock.yaml
git commit -m "feat(storybook): React Hook Form + Zod pattern on the design system's controls

A catering enquiry with one Zod schema: native-backed controls take
register() unmodified, value-based controls take Controller, Field renders
every message. The story's play submits empty (every message, focus on the
first invalid field), then completes the form from the keyboard and asserts
the parsed values. RHF, the resolvers and Zod are Storybook devDependencies
only (spec D17).

Co-Authored-By: Claude <model> <noreply@anthropic.com>"
```

---

