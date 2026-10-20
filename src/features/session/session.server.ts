import { QueryClient } from "@tanstack/react-query";
import { cookies } from "next/headers";
// import { Permission } from "@/utils/permissions";
import { env } from "@/env/client.mjs";
import axios from "axios";
import {
  whoamiSchema,
  redirectToLogin,
  redirectToDashboard,
} from "./session.common";

async function getSessionFromServer(sessionCookie: string) {
  const url = `${env.NEXT_PUBLIC_API_URL}/api/usuario/autenticado`;
  const rawSession = await axios.get(url, {
    headers: {
      Cookie: `token=${sessionCookie}`,
    },
  });
  return whoamiSchema.parse(rawSession.data);
}

export async function authorizeSession(queryClient: QueryClient) {
  const allCookies = await cookies();
  const sessionCookie = allCookies.get(`token`)?.value;

  console.log("server - cookie: ", sessionCookie);
  if (!sessionCookie) return null;
  console.log("server - has cookie");

  const session = await queryClient
    .fetchQuery({
      queryKey: ["session", "general", sessionCookie],
      queryFn: () => getSessionFromServer(sessionCookie),
      retry: false,
    })
    .catch((err) => {
      console.log("authorizeSession");
      console.error(err.response);
      return undefined;
    });

  console.log("server - session: ", session);
  if (!session) return null;
  console.log("server - has session");

  return session;
}

export async function withAuth() {
  const queryClient = new QueryClient();

  const session = await authorizeSession(queryClient);
  if (!session) {
    console.log("server - no session");
    return redirectToLogin();
  }

  return session;
}

export async function redirectIfLoggedIn(environment: "pc" | "collector") {
  const queryClient = new QueryClient();

  const allCookies = await cookies();
  const sessionCookie = allCookies.get(`token`)?.value;

  if (!sessionCookie) return;

  const session = await queryClient
    .fetchQuery({
      queryKey: ["session", "auth", sessionCookie],
      queryFn: () => getSessionFromServer(sessionCookie),
      retry: false,
    })
    .catch((err) => {
      console.error(err.response);
      return undefined;
    });

  if (!!session) {
    if (environment === "pc") {
      return redirectToDashboard();
    }
  }
}
