import { apiClient } from "@/lib/http/client";
import { pageSchema, type ListParams } from "@/features/shared/schemas";
import { userSchema } from "./schemas";
export async function getUsers(params: ListParams = {}) {
  const response = await apiClient.get("/api/users", { params });
  return pageSchema(userSchema).parse(response.data);
}
export async function getUser(id: number) {
  const response = await apiClient.get(`/api/users/${id}`);
  return userSchema.parse(response.data);
}
