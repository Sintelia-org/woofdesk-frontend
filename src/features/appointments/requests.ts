import { apiClient } from "@/lib/http/client";
import {
  appointmentSchema,
  appointmentSummarySchema,
  appointmentInputSchema,
} from "./schemas";
export type AppointmentParams = {
  from: string;
  to: string;
  state?: "SCHEDULED" | "COMPLETED";
  petId?: number;
  clientId?: number;
  maintenance?: boolean;
};
export async function getAppointments(params: AppointmentParams) {
  const response = await apiClient.get("/api/appointments", { params });
  return appointmentSummarySchema.array().parse(response.data);
}
export async function getAppointment(id: number) {
  const response = await apiClient.get(`/api/appointments/${id}`);
  return appointmentSchema.parse(response.data);
}

export async function rescheduleAppointment(id: number, datetime: string) {
  const appointment = await getAppointment(id);
  // PUT replaces the full record; retain current adjustments, service IDs and lock version.
  const data = appointmentInputSchema.parse({
    petId: appointment.petId,
    datetime,
    serviceIds: appointment.services.map((service) => service.id),
    grossPrice: appointment.grossPrice,
    maintenance: appointment.maintenance,
    paymentMethod: appointment.paymentMethod,
    info: appointment.info ?? "",
    discounts: appointment.discounts,
    surcharges: appointment.surcharges,
    version: appointment.version,
  });
  const response = await apiClient.put(`/api/appointments/${id}`, data);
  return appointmentSchema.parse(response.data);
}
