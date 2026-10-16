import { z } from "zod";

export const petSexSchema = z.enum(["female", "male", "unknown"]);

export const petSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1),
  breed: z.string().trim().min(1),
  birthDate: z.coerce.date().nullable(),
  sex: petSexSchema,
  ownerId: z.string().uuid(),
});

export const createPetSchema = petSchema.omit({ id: true });

export type Pet = z.infer<typeof petSchema>;
export type CreatePetInput = z.infer<typeof createPetSchema>;
