import { z } from "zod";
import {
  auditSchema,
  optionalPhoneSchema,
  passwordSchema,
} from "@/features/shared/schemas";
export const userSchema = auditSchema.extend({
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
  active: z.boolean(),
});
export type User = z.infer<typeof userSchema>;
export const userInputSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(100),
  email: z.string().trim().email("Ingresá un correo válido").max(150),
  phone: optionalPhoneSchema,
  role: z.string().min(1, "Seleccioná un rol"),
});
export const userCreateSchema = userInputSchema.extend({
  password: passwordSchema,
});
export type UserInput = z.infer<typeof userInputSchema>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
