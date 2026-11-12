import { z } from "zod";
import {
  auditSchema,
  optionalText,
  phoneSchema,
} from "@/features/shared/schemas";
export const clientSchema = auditSchema.extend({
  name: z.string(),
  phone: z.string(),
  info: z.string().nullable(),
  active: z.boolean(),
});
export type Client = z.infer<typeof clientSchema>;
export const clientInputSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(150),
  phone: phoneSchema,
  info: optionalText,
});
export type ClientInput = z.infer<typeof clientInputSchema>;
