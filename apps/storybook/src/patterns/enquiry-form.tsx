import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Controller, type FieldError, useForm } from "react-hook-form";
import { z } from "zod";

import {
  Alert,
  AutoGrid,
  Button,
  Card,
  Checkbox,
  CheckCard,
  ChipGroup,
  ChoiceCardGroup,
  type ChoiceOption,
  DatePicker,
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
  meal: z.string({ error: ENQUIRY_MESSAGES.meal }).min(1, ENQUIRY_MESSAGES.meal),
  spice: z.string({ error: ENQUIRY_MESSAGES.spice }).min(1, ENQUIRY_MESSAGES.spice),
  service: z.string({ error: ENQUIRY_MESSAGES.service }).min(1, ENQUIRY_MESSAGES.service),
  noOnionGarlic: z.boolean(),
  notes: z.string().max(500, ENQUIRY_MESSAGES.notes),
  consent: z.boolean().refine((isGiven) => isGiven, { error: ENQUIRY_MESSAGES.consent }),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type EnquiryValues = z.output<typeof enquirySchema>;

/**
 * Default guests is 10 so an empty submit fails the schema min of 15; KeyboardOnly then +1 five
 * times. Stepper min stays 1 so those presses can land on 15.
 */
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
    shouldFocusError: false,
  });

  return (
    <Card padding="lg" className="w-full max-w-article">
      <form
        noValidate
        onSubmit={(event) => {
          const form = event.currentTarget;
          void handleSubmit(
            (values) => {
              onSubmit(values);
            },
            () => {
              form.querySelector<HTMLInputElement>('[name="name"]')?.focus();
            }
          )(event);
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
                  placeholder="Pick one"
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
              {(dateField) => (
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker
                      id={dateField.id}
                      aria-label="Date"
                      aria-describedby={dateField["aria-describedby"]}
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Choose a day"
                      status={statusOf(errors.date)}
                    />
                  )}
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
            {(guestsField) => (
              <Controller
                control={control}
                name="guests"
                render={({ field }) => (
                  <QuantityStepper
                    // QuantityStepper is a group — do not spread aria-required onto it (axe).
                    id={guestsField.id}
                    aria-describedby={guestsField["aria-describedby"]}
                    aria-invalid={guestsField["aria-invalid"]}
                    label="Guests"
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    min={1}
                    max={MAX_GUESTS}
                  />
                )}
              />
            )}
          </Field>

          <ChoiceCardGroup
            legend="Dawat"
            options={DAWATS}
            status={statusOf(errors.meal)}
            message={errors.meal?.message}
            {...register("meal")}
            min="sm"
          />

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
                ref={field.ref}
                status={statusOf(errors.spice)}
                message={errors.spice?.message}
              />
            )}
          />

          <Field
            label="Service"
            isRequired
            status={statusOf(errors.service)}
            message={errors.service?.message}
          >
            {(field) => (
              <RadioGroup
                aria-describedby={field["aria-describedby"]}
                legend="Service"
                isLegendHidden
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
            <Alert color="success" title="Enquiry sent">
              We&apos;ll reply on WhatsApp.
            </Alert>
          ) : null}
        </Stack>
      </form>
    </Card>
  );
}
