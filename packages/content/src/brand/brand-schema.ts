import { z } from "zod";

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[\dA-Z]$/;
const FSSAI = /^\d{14}$/;
const CIN = /^[LU]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}$/;
const PAN = /^[A-Z]{5}\d{4}[A-Z]$/;
const INDIAN_PHONE = /^\+91\d{10}$/;

const text = z.string().min(1);
/** A fact the owner has not supplied yet: null until they do (spec C16). */
const pending = text.nullable();

export const socialNetworkSchema = z.enum(["instagram", "youtube", "linkedin"]);
export type SocialNetwork = z.infer<typeof socialNetworkSchema>;

export const brandSchema = z.object({
  name: z.literal("Pink Paprikaa"),
  nameDevanagari: text,
  tagline: text,
  statement: text,
  vegStatement: text,
  established: z.number().int().min(2025),
  legal: z.object({
    entity: z.literal("Paprikaa Culinary Ventures Private Limited"),
    cin: z.string().regex(CIN),
    gstin: z.string().regex(GSTIN),
    fssai: z.string().regex(FSSAI),
    pan: z.string().regex(PAN),
    registeredAddress: text,
  }),
  contact: z.object({
    website: text,
    websiteUrl: z.url(),
    phone: z.string().regex(INDIAN_PHONE),
    phoneDisplay: text,
    whatsapp: z.string().regex(INDIAN_PHONE),
    email: z.email(),
    ordersEmail: z.email(),
    franchiseEmail: z.email(),
    careersEmail: z.email(),
  }),
  social: z.array(z.object({ network: socialNetworkSchema, handle: text, url: z.url() })).min(1),
  hours: z.object({ weekday: text, weekend: text, display: text }),
  outlets: z
    .array(
      z.object({
        id: text,
        city: text,
        name: text,
        address: text,
        hours: pending,
        phone: z.string().regex(INDIAN_PHONE),
        mapsUrl: z.url().nullable(),
      })
    )
    .min(1),
  billing: z
    .object({
      gstRate: z.number().min(0).max(1),
      gstSplit: z.object({ cgst: z.number().min(0), sgst: z.number().min(0) }),
      currency: z.literal("INR"),
      currencySymbol: z.literal("₹"),
      taxNote: text,
      invoicePrefix: text,
      bankName: pending,
      accountName: text,
      accountNumber: pending,
      ifsc: pending,
      upi: pending,
    })
    .refine(
      (billing) => Math.abs(billing.gstSplit.cgst + billing.gstSplit.sgst - billing.gstRate) < 1e-9,
      {
        message: "gstSplit must add up to gstRate",
      }
    ),
  policies: z.array(z.enum(["Privacy", "Terms", "Refunds"])).min(1),
});

export type Brand = z.infer<typeof brandSchema>;
