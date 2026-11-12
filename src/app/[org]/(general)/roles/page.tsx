"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheckIcon } from "lucide-react";
import { GeneralHeader } from "@/components/header";
import { SearchToolbar } from "@/components/entity-ui";
import { ErrorInformer } from "@/components/error";
import { AppearArticle, AppearGroup, AppearList } from "@/components/appear";
import { CardsSkeleton } from "@/components/skeletons";
import { getRoles } from "@/features/roles/requests";
import { normalize, roleLabels } from "@/features/shared/format";
import { useSession } from "@/features/session/session.client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";
const descriptions: Record<string, string> = {
  ADMIN:
    "Administra el equipo, los usuarios y el catálogo. Puede completar, reabrir y eliminar turnos.",
  RECEPTIONIST:
    "Consulta la agenda y administra clientes, mascotas y turnos agendados.",
  GROOMER:
    "Consulta clientes, mascotas, servicios y agenda. No modifica registros.",
};
export default function RolesPage() {
  const session = useSession();
  const [filter, setFilter] = useState("");
  const rolesQuery = useQuery<
    Awaited<ReturnType<typeof getRoles>>,
    ServerError
  >({
    queryKey: ["roles", session.data?.orgId],
    queryFn: () => getRoles(),
    enabled: !!session.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const roles = rolesQuery.data?.filter((role) =>
    normalize(roleLabels[role.name] ?? role.name).includes(normalize(filter)),
  );
  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Roles y permisos"
        Svg={ShieldCheckIcon}
        count={rolesQuery.data?.length}
        description="Estos roles están definidos por el sistema y se asignan a usuarios y empleados."
      />
      <SearchToolbar
        value={filter}
        onChange={setFilter}
        placeholder="Buscar rol…"
      />
      {rolesQuery.isPending ? (
        <CardsSkeleton
          count={3}
          className="min-h-0 flex-1 overflow-hidden lg:grid-cols-3"
        />
      ) : rolesQuery.isError ? (
        <ErrorInformer message={getErrorMessage(rolesQuery.error)} />
      ) : (
        <AppearList className="grid min-h-0 flex-1 auto-rows-max content-start gap-4 overflow-y-auto lg:grid-cols-3">
          {roles?.map((role) => (
            <AppearArticle
              key={role.id}
              className="bg-base-100 border-base-300 rounded-box border p-6"
            >
              <ShieldCheckIcon className="text-primary mb-4 size-7" />
              <h2 className="text-lg font-bold">
                {roleLabels[role.name] ?? role.name}
              </h2>
              <p className="text-base-content/70 mt-3 text-sm">
                {descriptions[role.name] ?? "Rol del sistema."}
              </p>
              <span className="text-base-content/70 font-mono-ui mt-5 block text-xs">
                {role.name}
              </span>
            </AppearArticle>
          ))}
          {roles?.length === 0 ? (
            <p className="text-base-content/70 text-sm">
              No hay coincidencias.
            </p>
          ) : null}
        </AppearList>
      )}
    </AppearGroup>
  );
}
