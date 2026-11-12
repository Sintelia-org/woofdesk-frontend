import { apiClient } from "@/lib/http/client";
import { pageSchema, type ListParams } from "@/features/shared/schemas";
import { petSchema } from "./schemas";
export async function getPets(params: ListParams = {}) {
  const response = await apiClient.get("/api/pets", { params });
  return pageSchema(petSchema).parse(response.data);
}
export async function getPet(id: number) {
  const response = await apiClient.get(`/api/pets/${id}`);
  return petSchema.parse(response.data);
}
