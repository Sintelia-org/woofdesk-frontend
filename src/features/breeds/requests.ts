import { apiClient } from "@/lib/http/client";
import { breedSchema } from "./schemas";
export async function getBreeds(search = "") {
  const response = await apiClient.get("/api/breeds", {
    params: { search: search || undefined },
  });
  return breedSchema.array().parse(response.data);
}
