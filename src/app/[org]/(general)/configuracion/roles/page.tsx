"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckIcon, LockIcon, MinusIcon } from "lucide-react";
import { AppearGroup, AppearItem } from "@/components/appear";
import { ErrorState } from "@/components/error";
import { SectionHeader } from "@/components/header";
import { CardsSkeleton } from "@/components/skeletons";
import { getRoles } from "@/features/roles/requests";
import { roleDescriptions, roleLabels } from "@/features/shared/format";
import { useSession } from "@/features/session/session.client";
import { cn } from "@/lib/cn";
import type { ServerError } from "@/lib/types";

const everyone = ["ADMIN", "RECEPTIONIST", "GROOMER"];
const frontDesk = ["ADMIN", "RECEPTIONIST"];
const adminOnly = ["ADMIN"];

// Mirrors the backend's authorization rules (docs/backend-integration.md,
// "Roles"). Roles are a read-only system catalog, so this is informative:
// the server enforces every rule on its own.
const permissionGroups = [
  {
    label: "Clientes y mascotas",
    items: [
      { action: "Ver fichas", roles: everyone },
      { action: "Crear y editar", roles: frontDesk },
      { action: "Activar o desactivar", roles: frontDesk },
    ],
  },
  {
    label: "Turnos",
    items: [
      { action: "Ver la agenda y los turnos", roles: everyone },
      { action: "Agendar y editar turnos programados", roles: frontDesk },
      { action: "Completar, reabrir y eliminar turnos", roles: adminOnly },
    ],
  },
  {
    label: "Catálogo",
    items: [
      { action: "Ver servicios, razas y roles", roles: everyone },
      { action: "Crear y editar servicios", roles: adminOnly },
    ],
  },
  {
    label: "Equipo",
    items: [{ action: "Gestionar personal y usuarios", roles: adminOnly }],
  },
];
const totalActions = permissionGroups.reduce(
  (total, group) => total + group.items.length,
  0,
);

export default function RolesPage() {
  const session = useSession();
  const [selectedRole, setSelectedRole] = useState<string>();
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
  // Until someone picks a role, show the viewer's own.
  const current = selectedRole ?? session.data?.role ?? "ADMIN";
  const allowedCount = permissionGroups.reduce(
    (total, group) =>
      total + group.items.filter((item) => item.roles.includes(current)).length,
    0,
  );
  return (
    <AppearGroup className="flex h-full min-h-0 flex-col gap-5 overflow-y-auto">
      <SectionHeader
        title="Roles y permisos"
        count={rolesQuery.data?.length}
        description="Elegí un rol para ver qué puede hacer. Se asignan a cada usuario y a cada persona del personal."
      />
      {rolesQuery.isPending ? (
        <CardsSkeleton
          count={2}
          className="lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]"
        />
      ) : rolesQuery.isError ? (
        <ErrorState
          error={rolesQuery.error}
          retry={() => {
            void rolesQuery.refetch();
          }}
        />
      ) : (
        <AppearItem className="grid items-start gap-5 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
          <div role="group" aria-label="Roles" className="flex flex-col gap-2">
            {rolesQuery.data.map((role) => {
              const active = role.name === current;
              return (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedRole(role.name)}
                  className={cn(
                    "rounded-box flex w-full cursor-pointer flex-col gap-1 border px-4 py-3.5 text-left transition-colors",
                    active
                      ? "bg-neutral border-neutral text-neutral-content"
                      : "bg-base-100 border-base-300 hover:border-secondary",
                  )}
                >
                  <span className="flex items-center justify-between gap-2 font-semibold">
                    {roleLabels[role.name] ?? role.name}
                    {role.name === session.data?.role ? (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-semibold",
                          active
                            ? "bg-primary text-neutral"
                            : "bg-secondary/25 text-base-content",
                        )}
                      >
                        Tu rol
                      </span>
                    ) : null}
                  </span>
                  <span
                    className={cn(
                      "text-xs leading-relaxed",
                      active ? "text-secondary" : "text-base-content/70",
                    )}
                  >
                    {roleDescriptions[role.name] ?? "Rol del sistema."}
                  </span>
                </button>
              );
            })}
          </div>
          <section
            aria-labelledby="role-permissions-title"
            className="bg-base-100 border-base-300 rounded-box flex flex-col gap-4 border p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 id="role-permissions-title" className="text-lg font-bold">
                {roleLabels[current] ?? current}
              </h3>
              <p className="text-base-content/70 text-sm">
                Puede hacer {allowedCount} de {totalActions} acciones
              </p>
            </div>
            <p className="bg-base-200 rounded-field flex items-center gap-2.5 px-3.5 py-3 text-sm">
              <LockIcon aria-hidden="true" className="size-4 shrink-0" />
              Los roles los define el sistema: no se pueden crear ni modificar.
            </p>
            {permissionGroups.map((group) => (
              <div key={group.label}>
                <h4 className="text-base-content/70 mb-1 text-sm font-semibold">
                  {group.label}
                </h4>
                <ul className="divide-base-300 divide-y">
                  {group.items.map((item) => {
                    const allowed = item.roles.includes(current);
                    return (
                      <li
                        key={item.action}
                        className="flex items-center justify-between gap-4 py-2.5"
                      >
                        <span
                          className={cn(
                            "text-sm",
                            !allowed && "text-base-content/70",
                          )}
                        >
                          {item.action}
                        </span>
                        <span
                          className={cn(
                            "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                            allowed
                              ? "bg-success/15 text-success"
                              : "bg-base-200 text-base-content/70",
                          )}
                        >
                          {allowed ? (
                            <CheckIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          ) : (
                            <MinusIcon
                              aria-hidden="true"
                              className="size-3.5"
                            />
                          )}
                          {allowed ? "Puede" : "No puede"}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </section>
        </AppearItem>
      )}
    </AppearGroup>
  );
}
