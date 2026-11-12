import { z } from "zod";
import { localDate } from "@/features/shared/format";
import { auditSchema, optionalText } from "@/features/shared/schemas";
export const speciesLabels = {
  DOG: "Perro",
  CAT: "Gato",
  OTHER: "Otro",
} as const;
export const genderLabels = { MALE: "Macho", FEMALE: "Hembra" } as const;
export const sizeLabels = {
  SMALL: "Pequeño",
  MEDIUM: "Mediano",
  LARGE: "Grande",
  GIANT: "Gigante",
} as const;
export const furLabels = {
  SHORT: "Corto",
  MEDIUM: "Medio",
  LONG: "Largo",
  CURLY: "Rizado",
  DOUBLE_COAT: "Doble manto",
} as const;
export const petSchema = auditSchema.extend({
  clientId: z.number(),
  clientName: z.string(),
  species: z.enum(["DOG", "CAT", "OTHER"]),
  breedId: z.number().nullable(),
  breedName: z.string().nullable(),
  name: z.string(),
  gender: z.enum(["MALE", "FEMALE"]).nullable(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "GIANT"]).nullable(),
  fur: z.enum(["SHORT", "MEDIUM", "LONG", "CURLY", "DOUBLE_COAT"]).nullable(),
  birthdate: z.string().nullable(),
  weight: z.number().nullable(),
  allergy: z.boolean(),
  info: z.string().nullable(),
  active: z.boolean(),
});
export type Pet = z.infer<typeof petSchema>;
export const petInputSchema = z.object({
  clientId: z.number().int().positive("Seleccioná un cliente"),
  species: z.enum(["DOG", "CAT", "OTHER"]),
  breedId: z.number().int().positive().nullable(),
  name: z.string().trim().min(1, "Ingresá un nombre").max(100),
  gender: z.enum(["MALE", "FEMALE"]).nullable(),
  size: z.enum(["SMALL", "MEDIUM", "LARGE", "GIANT"]).nullable(),
  fur: z.enum(["SHORT", "MEDIUM", "LONG", "CURLY", "DOUBLE_COAT"]).nullable(),
  birthdate: z
    .string()
    .refine(
      (v) => !v || (/^\d{4}-\d{2}-\d{2}$/.test(v) && v <= localDate()),
      "La fecha no puede ser futura",
    ),
  weight: z
    .number()
    .min(0.01, "El peso debe ser mayor a cero")
    .max(999.99, "Máximo 999,99 kg")
    .multipleOf(0.01, "Máximo dos decimales")
    .nullable(),
  allergy: z.boolean(),
  info: optionalText,
});
export type PetInput = z.infer<typeof petInputSchema>;
