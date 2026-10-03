import { type ReactNode, useId } from "react";

import { brand, toBrandLines } from "@pink-paprikaa-web/content";
import { Badge, Card, type KeyValueItem, KeyValueList, Typography } from "@pink-paprikaa-web/ui";

import { BUILD_YEAR } from "../../kits/fixtures";

export const OWNER_TO_SUPPLY = "Owner to supply";

/** Every fact the owner has not supplied yet, by path (`billing.upi`, `outlets[0].hours`). */
export function pendingFacts(value: unknown, path = ""): string[] {
  if (value === null) return [path];
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => pendingFacts(item, `${path}[${String(index)}]`));
  }
  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      pendingFacts(child, path === "" ? key : `${path}.${key}`)
    );
  }
  return [];
}

function fact(value: string | number | null): ReactNode {
  return value ?? <Badge color="danger">{OWNER_TO_SUPPLY}</Badge>;
}

function percent(rate: number): string {
  return `${String(Math.round(rate * 1000) / 10)}%`;
}

/** The fact sheet sets its keys in mono, as the design system's Company details card does. */
function monoKeys(items: KeyValueItem[]): KeyValueItem[] {
  return items.map((item) => ({
    ...item,
    key: <span className="font-mono text-mono">{item.key}</span>,
  }));
}

interface FactBox {
  heading: string;
  items: KeyValueItem[];
}

/** The brand facts as the design system's Company details card shows them, bound to the real data. */
export function CompanyDetails() {
  const pendingId = useId();
  const lines = toBrandLines(brand, BUILD_YEAR);
  const { billing, contact, legal } = brand;
  const pending = pendingFacts(brand);
  const boxes: FactBox[] = [
    {
      heading: "Identity",
      items: [
        { key: "name", value: `${brand.name} · ${brand.nameDevanagari}` },
        { key: "tagline", value: brand.tagline },
        { key: "statement", value: brand.statement },
        { key: "veg", value: brand.vegStatement },
        { key: "established", value: brand.established },
      ],
    },
    {
      heading: "Legal",
      items: [
        { key: "entity", value: legal.entity },
        { key: "cin", value: legal.cin },
        { key: "gstin", value: legal.gstin },
        { key: "fssai", value: legal.fssai },
        { key: "pan", value: legal.pan },
        { key: "registered", value: legal.registeredAddress },
      ],
    },
    {
      heading: "Contact",
      items: [
        { key: "web", value: contact.website },
        { key: "phone", value: contact.phoneDisplay },
        { key: "whatsapp", value: contact.whatsapp },
        { key: "email", value: contact.email },
        { key: "orders", value: contact.ordersEmail },
        { key: "franchise", value: contact.franchiseEmail },
        { key: "careers", value: contact.careersEmail },
      ],
    },
    {
      heading: "Billing",
      items: [
        {
          key: "gst",
          value: `${percent(billing.gstRate)} (CGST ${percent(billing.gstSplit.cgst)} + SGST ${percent(billing.gstSplit.sgst)})`,
        },
        { key: "tax note", value: billing.taxNote },
        { key: "invoice", value: `${billing.invoicePrefix}-0000` },
        { key: "account", value: billing.accountName },
        { key: "bank", value: fact(billing.bankName) },
        { key: "account no.", value: fact(billing.accountNumber) },
        { key: "ifsc", value: fact(billing.ifsc) },
        { key: "upi", value: fact(billing.upi) },
      ],
    },
    {
      heading: "Social",
      items: brand.social.map((profile) => ({ key: profile.network, value: profile.handle })),
    },
    {
      heading: `Outlets · ${lines.cities}`,
      items: brand.outlets.flatMap((outlet) => [
        { key: outlet.city, value: `${outlet.name} — ${outlet.address}` },
        { key: "hours", value: fact(outlet.hours) },
        { key: "maps", value: fact(outlet.mapsUrl) },
      ]),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {boxes.map((box) => (
          <Card key={box.heading} padding="sm" className="flex min-w-0 flex-col gap-3">
            <Typography variant="overline" color="brand" as="h2">
              {box.heading}
            </Typography>
            {/* wrap-break-word inherits to the values: an email or URL never widens the card. */}
            <KeyValueList
              items={monoKeys(box.items)}
              density="compact"
              keyWidth="sm"
              className="wrap-break-word"
            />
          </Card>
        ))}
      </div>
      <Card variant="quiet" padding="sm" className="flex flex-col gap-3">
        <Typography variant="overline" color="brand" as="h2">
          Derived lines — toBrandLines(brand, year)
        </Typography>
        <KeyValueList
          density="compact"
          keyWidth="md"
          className="wrap-break-word"
          items={monoKeys([
            { key: "copyright", value: lines.copyright },
            { key: "fssai", value: lines.fssai },
            { key: "gstin", value: lines.gstin },
            { key: "cin", value: lines.cin },
            { key: "contactShort", value: lines.contactShort },
            { key: "footerPolicies", value: lines.footerPolicies.join(" · ") },
          ])}
        />
      </Card>
      <div className="flex flex-col gap-2">
        <Typography variant="h4" as="h2" id={pendingId}>
          {pending.length} facts pending from the owner
        </Typography>
        <ul aria-labelledby={pendingId} className="flex flex-col gap-1">
          {pending.map((path) => (
            <li key={path} className="font-mono text-mono text-text-muted">
              {path}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
