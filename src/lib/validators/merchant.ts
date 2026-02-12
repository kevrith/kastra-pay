import { z } from "zod";

export const merchantOnboardingSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessEmail: z.string().email("Invalid business email"),
  businessPhone: z
    .string()
    .regex(/^(\+254|0)[17]\d{8}$/, "Invalid Kenyan phone number")
    .optional()
    .or(z.literal("")),
  description: z.string().max(1000).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  settlementEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  settlementPhone: z
    .string()
    .regex(/^(\+254|0)[17]\d{8}$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  settlementBankCode: z.string().optional(),
  settlementAccountNo: z.string().optional(),
});

export const merchantUpdateSchema = merchantOnboardingSchema.partial();

export const apiKeyCreateSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be under 100 characters"),
});

export type MerchantOnboardingInput = z.infer<typeof merchantOnboardingSchema>;
export type MerchantUpdateInput = z.infer<typeof merchantUpdateSchema>;
export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>;
