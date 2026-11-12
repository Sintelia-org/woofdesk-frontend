import { z } from "zod";
import { auditSchema, optionalText } from "@/features/shared/schemas";
export const serviceSchema = auditSchema.extend({
  name: z.string(),
  info: z.string().nullable(),
});
export type Service = z.infer<typeof serviceSchema>;
export const serviceInputSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(100),
  info: optionalText,
});
export type ServiceInput = z.infer<typeof serviceInputSchema>;
