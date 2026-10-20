import { clientSchema } from "@/env/schema.mjs";
import { redirect } from "next/navigation";
import { z } from "zod";

export function redirectToHome() {
  return redirect("/");
}
export function redirectToLogin() {
  return redirect("/login");
}
export function redirectToDashboard() {
  return redirect("/dashboard");
}

export type WhoamI = z.output<typeof whoamiSchema>;
export const whoamiSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  deposito_id: z.number().nullable(),
});
