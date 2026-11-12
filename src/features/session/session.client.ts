"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/http/client";
import type { ServerError } from "@/lib/types";
import { whoamiSchema } from "./session.common";
export async function getSession() {
  const response = await apiClient.get("/api/auth/me");
  return whoamiSchema.parse(response.data);
}
export function useSession() {
  return useQuery<Awaited<ReturnType<typeof getSession>>, ServerError>({
    queryKey: ["session"],
    queryFn: getSession,
    retry: false,
    staleTime: 30_000,
  });
}
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation<void, ServerError, void>({
    mutationFn: async () => {
      await apiClient.post("/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
}
