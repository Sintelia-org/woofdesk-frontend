import { apiClient } from "@/lib/http/client";
import { serviceSchema } from "./schemas";
export async function getServices(search = "") {
  const response = await apiClient.get("/api/services", {
    params: { search: search || undefined },
  });
  return serviceSchema.array().parse(response.data);
}
