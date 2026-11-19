export const roleLabels: Record<string, string> = {
  ADMIN: "Administrador",
  RECEPTIONIST: "Recepcionista",
  GROOMER: "Peluquero",
};
export const roleDescriptions: Record<string, string> = {
  ADMIN:
    "Administra el equipo, los usuarios y el catálogo. Puede completar, reabrir y eliminar turnos.",
  RECEPTIONIST:
    "Consulta la agenda y administra clientes, mascotas y turnos agendados.",
  GROOMER:
    "Consulta clientes, mascotas, servicios y agenda. No modifica registros.",
};
export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
export function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(value);
}
export function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
export function localDate(value = new Date()) {
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
}
export function appointmentDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
