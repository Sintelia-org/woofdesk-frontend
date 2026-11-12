import { apiClient } from "@/lib/http/client";
import { roleSchema } from "./schemas";
export async function getRoles(search = "") {
  const response = await apiClient.get("/api/roles", {
    params: { search: search || undefined },
  });
  return roleSchema.array().parse(response.data);
}
