import { z } from "zod";
export const breedSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  species: z.enum(["DOG", "CAT", "OTHER"]),
});
export type Breed = z.infer<typeof breedSchema>;
