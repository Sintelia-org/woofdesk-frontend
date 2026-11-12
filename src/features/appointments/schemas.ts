import { z } from "zod";
import { optionalText } from "@/features/shared/schemas";
export const paymentLabels = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  DEBIT_CARD: "Tarjeta de débito",
  CREDIT_CARD: "Tarjeta de crédito",
  MERCADO_PAGO: "Mercado Pago",
  OTHER: "Otro",
} as const;
export const paymentMethodSchema = z.enum([
  "CASH",
  "TRANSFER",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "MERCADO_PAGO",
  "OTHER",
]);
export const adjustmentSchema = z.object({
  id: z.number().optional(),
  concept: z.string().trim().min(1, "Ingresá un concepto").max(100),
  amount: z
    .number()
    .min(0.01, "El monto debe ser mayor a cero")
    .max(9999999999.99)
    .multipleOf(0.01),
});
export const appointmentSummarySchema = z.object({
  id: z.number(),
  datetime: z.string().datetime({ offset: true }),
  state: z.enum(["SCHEDULED", "COMPLETED"]),
  maintenance: z.boolean(),
  petId: z.number(),
  petName: z.string(),
  clientId: z.number(),
  clientName: z.string(),
  services: z.array(z.string()),
  grossPrice: z.number(),
  netPrice: z.number(),
  paymentMethod: paymentMethodSchema.nullable(),
});
export const appointmentSchema = appointmentSummarySchema
  .omit({ services: true })
  .extend({
    info: z.string().nullable(),
    services: z.array(z.object({ id: z.number(), name: z.string() })),
    discounts: z.array(adjustmentSchema.extend({ id: z.number() })),
    surcharges: z.array(adjustmentSchema.extend({ id: z.number() })),
    createdBy: z.string(),
    updatedBy: z.string(),
    version: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });
export type AppointmentSummary = z.infer<typeof appointmentSummarySchema>;
export type Appointment = z.infer<typeof appointmentSchema>;
export const appointmentInputSchema = z
  .object({
    petId: z.number().int().positive("Seleccioná una mascota"),
    datetime: z
      .string()
      .min(1, "Ingresá fecha y hora")
      .refine((v) => !Number.isNaN(new Date(v).getTime()), "Fecha no válida"),
    serviceIds: z.array(z.number()).min(1, "Seleccioná al menos un servicio"),
    grossPrice: z
      .number()
      .min(0, "El precio no puede ser negativo")
      .max(9999999999.99)
      .multipleOf(0.01),
    maintenance: z.boolean(),
    paymentMethod: paymentMethodSchema.nullable(),
    info: optionalText,
    discounts: z.array(adjustmentSchema),
    surcharges: z.array(adjustmentSchema),
    version: z.number().optional(),
  })
  .superRefine((data, ctx) => {
    const net =
      Math.round(data.grossPrice * 100) -
      data.discounts.reduce((sum, d) => sum + Math.round(d.amount * 100), 0) +
      data.surcharges.reduce((sum, s) => sum + Math.round(s.amount * 100), 0);
    if (net < 0)
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["grossPrice"],
        message: "Los descuentos no pueden superar el precio más los recargos",
      });
  });
export type AppointmentInput = z.infer<typeof appointmentInputSchema>;
