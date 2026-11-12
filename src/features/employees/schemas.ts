import { z } from "zod";
import { auditSchema, optionalPhoneSchema } from "@/features/shared/schemas";
export const employeeSchema = auditSchema.extend({
  name: z.string(),
  phone: z.string().nullable(),
  role: z.string(),
  userId: z.number().nullable(),
  userEmail: z.string().nullable(),
  active: z.boolean(),
});
export type Employee = z.infer<typeof employeeSchema>;
export const employeeInputSchema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre").max(150),
  phone: optionalPhoneSchema,
  role: z.string().min(1, "Seleccioná un rol"),
  userId: z.number().int().positive().nullable(),
});
export type EmployeeInput = z.infer<typeof employeeInputSchema>;
