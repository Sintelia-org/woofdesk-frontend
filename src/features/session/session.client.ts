"use client";

import { env } from "@/env/client.mjs";
import { ServerError } from "@/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { redirectToLogin, whoamiSchema } from "./session.common";
import { usePathname } from "next/navigation";

export async function getSession() {
  const url = `${env.NEXT_PUBLIC_API_URL}/api/usuario/autenticado`;
  const rawSession = await axios.get(url, { withCredentials: true });
  return whoamiSchema.parse(rawSession.data);
}

export function useSession() {
  const pathname = usePathname();
  const session = useQuery<Awaited<ReturnType<typeof getSession>>, ServerError>(
    {
      queryKey: ["session", null],
      queryFn: () => getSession(),
      // staleTime: 30 * 1000, // 30 seconds of cache
      retry: false,
    },
  );

  console.log("client - session", session);

  if (
    session.isError &&
    session.error.status === 401 &&
    !["/login", "/colector/login"].includes(pathname) // Avoid redirect if user is already in /login -> without this the query runs indefenitely
  ) {
    console.log("client - no session");
    redirectToLogin();
  }

  return session;
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation<void, ServerError, { environment: "pc" | "collector" }>({
    mutationFn: async () => {
      const url = `${env.NEXT_PUBLIC_API_URL}/api/logout`;
      return axios.post(url, null, { withCredentials: true });
    },
    onSuccess: (_, vars) => {
      queryClient.removeQueries();
      redirectToLogin();
    },
  });
}
