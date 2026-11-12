import { AppearArticle, AppearGroup } from "@/components/appear";
import { InfoIcon } from "lucide-react";
import { GeneralHeader } from "@/components/header";
const topics = [
  [
    "Clientes y mascotas",
    "Cargá primero al responsable y después a su mascota. Podés buscar por nombre, teléfono o responsable. Desactivar conserva el historial.",
  ],
  [
    "Agenda y turnos",
    "Elegí un rango de hasta 62 días. Al crear un turno seleccioná la mascota y al menos un servicio. El precio final se calcula con los descuentos y recargos.",
  ],
  [
    "Turnos completados",
    "Un administrador puede completar, volver a agendar o eliminar turnos. Para modificar un turno completado, primero debe volver a agendarlo.",
  ],
  [
    "Usuarios y personal",
    "Personal representa al equipo. Usuarios administra el acceso al sistema. Son registros distintos y su vinculación es opcional.",
  ],
  [
    "Servicios, razas y roles",
    "Los servicios permiten alta y edición. Razas y roles son catálogos de consulta definidos por el sistema.",
  ],
];
export default function HelpPage() {
  return (
    <AppearGroup className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Centro de ayuda"
        Svg={InfoIcon}
        description="Una guía rápida para trabajar en WoofDesk."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {topics.map(([title, text]) => (
          <AppearArticle
            key={title}
            className="bg-base-100 border-base-300 rounded-box border p-6"
          >
            <h2 className="mb-3 font-bold">{title}</h2>
            <p className="text-base-content/70 text-sm leading-relaxed">
              {text}
            </p>
          </AppearArticle>
        ))}
      </div>
    </AppearGroup>
  );
}
