import "server-only";
import axios from "axios";
import { cookies } from "next/headers";
import { QueryClient } from "@tanstack/react-query";
import { env } from "@/env/client.mjs";
import {
  whoamiSchema,
  redirectToLogin,
  redirectToDashboard,
} from "./session.common";
async function getSessionFromServer(sessionCookie: string) {
  try {
    const response = await axios.get(`${env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      headers: { Cookie: `access_token=${sessionCookie}` },
      timeout: 15_000,
    });
    return whoamiSchema.parse(response.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401)
      return null;
    throw error;
  }
}
export async function authorizeSession(queryClient: QueryClient) {
  const cookie = (await cookies()).get("access_token")?.value;
  if (!cookie) return null;
  return queryClient.fetchQuery({
    queryKey: ["session"],
    queryFn: () => getSessionFromServer(cookie),
    retry: false,
  });
}
export async function withAuth() {
  const session = await authorizeSession(new QueryClient());
  if (!session) return redirectToLogin();
  return session;
}
export async function redirectIfLoggedIn(environment: "pc" | "collector") {
  const session = await authorizeSession(new QueryClient());
  if (session && environment === "pc")
    return redirectToDashboard(session.orgId);
}
