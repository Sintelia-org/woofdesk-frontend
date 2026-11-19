import { redirect } from "next/navigation";
import { z } from "zod";
// GET /api/auth/me, as returned by the backend's MeResponse record.
const meResponseSchema = z.object({
  user: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    email: z.string(),
  }),
  organization: z.object({
    id: z.number().int().positive(),
    name: z.string(),
  }),
  role: z.object({
    id: z.number().int().positive(),
    name: z.enum(["ADMIN", "RECEPTIONIST", "GROOMER"]),
  }),
});
// Flattened for the UI so session consumers keep reading orgId, role, etc.
export const whoamiSchema = meResponseSchema.transform(
  ({ user, organization, role }) => ({
    userId: user.id,
    userName: user.name,
    email: user.email,
    orgId: organization.id,
    orgName: organization.name,
    role: role.name,
  }),
);
export type WhoamI = z.output<typeof whoamiSchema>;
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
