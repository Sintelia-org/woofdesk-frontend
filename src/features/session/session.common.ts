import { redirect } from "next/navigation";
import { z } from "zod";
export const whoamiSchema = z.object({
  userId: z.coerce.number().int().positive(),
  orgId: z.number().int().positive(),
  role: z.enum(["ADMIN", "RECEPTIONIST", "GROOMER"]),
  expiresAt: z.string().datetime({ offset: true }),
  tenantInContext: z.number().nullable(),
});
export type WhoamI = z.infer<typeof whoamiSchema>;
export const loginResponseSchema = z.object({
  expiresAt: z.string(),
  user: z.object({
    id: z.number(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
    orgId: z.number(),
    orgName: z.string(),
  }),
});
export function redirectToHome() {
  return redirect("/");
}
export function redirectToLogin() {
  return redirect("/login");
}
export function redirectToDashboard(org: string | number) {
  return redirect(`/${encodeURIComponent(String(org))}/dashboard`);
}
