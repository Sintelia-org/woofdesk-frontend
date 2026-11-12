import { z } from "zod";
export const idSchema = z.number().int().positive();
export const auditSchema = z.object({
  id: idSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});
export function pageSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    content: z.array(item),
    page: z.number().int().nonnegative(),
    size: z.number().int().positive(),
    totalElements: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
  });
}
export const optionalText = z
  .string()
  .trim()
  .max(2000, "Máximo 2000 caracteres");
export const phoneSchema = z
  .string()
  .trim()
  .max(30)
  .refine(
    (value) => value.replace(/\D/g, "").length >= 6,
    "Ingresá al menos 6 dígitos",
  );
export const optionalPhoneSchema = z.union([phoneSchema, z.literal("")]);
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(72, "Máximo 72 caracteres")
  .refine(
    (value) => new TextEncoder().encode(value).length <= 72,
    "Máximo 72 bytes",
  );
export type ListParams = {
  page?: number;
  size?: number;
  search?: string;
  active?: boolean;
};
