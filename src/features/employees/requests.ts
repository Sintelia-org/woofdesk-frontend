import { apiClient } from "@/lib/http/client";
import { pageSchema, type ListParams } from "@/features/shared/schemas";
import { employeeSchema } from "./schemas";
export async function getEmployees(params: ListParams = {}) {
  const response = await apiClient.get("/api/employees", { params });
  return pageSchema(employeeSchema).parse(response.data);
}
export async function getEmployee(id: number) {
  const response = await apiClient.get(`/api/employees/${id}`);
  return employeeSchema.parse(response.data);
}
