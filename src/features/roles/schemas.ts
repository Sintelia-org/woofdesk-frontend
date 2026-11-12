import { z } from "zod";
export const roleSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
});
export type Role = z.infer<typeof roleSchema>;
