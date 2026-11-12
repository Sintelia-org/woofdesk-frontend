import { apiClient } from "@/lib/http/client";
import { pageSchema, type ListParams } from "@/features/shared/schemas";
import { clientSchema } from "./schemas";
export async function getClients(params: ListParams = {}) {
  const response = await apiClient.get("/api/clients", { params });
  return pageSchema(clientSchema).parse(response.data);
}
export async function getClient(id: number) {
  const response = await apiClient.get(`/api/clients/${id}`);
  return clientSchema.parse(response.data);
}
