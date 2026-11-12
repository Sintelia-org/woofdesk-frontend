"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SparklesIcon, ScissorsIcon } from "lucide-react";
import { GeneralHeader } from "@/components/header";
import { SearchToolbar, ActionButtons } from "@/components/entity-ui";
import { ErrorInformer } from "@/components/error";
import { AppearArticle, AppearGroup, AppearList } from "@/components/appear";
import { ServiceModal } from "@/components/modals/services";
import { CardsSkeleton } from "@/components/skeletons";
import { getServices } from "@/features/services/requests";
import type { Service } from "@/features/services/schemas";
import { useSession } from "@/features/session/session.client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";
export default function ServicesPage() {
  const session = useSession();
  const [filter, setFilter] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [serviceToUpdate, setServiceToUpdate] = useState<Service>();
  const servicesQuery = useQuery<
    Awaited<ReturnType<typeof getServices>>,
    ServerError
  >({
    queryKey: ["services", session.data?.orgId, filter],
    queryFn: () => getServices(filter),
    enabled: !!session.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const canWrite = session.data?.role === "ADMIN";
  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Servicios"
        Svg={SparklesIcon}
        count={servicesQuery.data?.length}
        description="Un catálogo de cuidados pensado para cada mascota. El precio se define al agendar."
        button={
          canWrite
            ? {
                text: "Agregar servicio",
                onClick: () => setIsCreateModalOpen(true),
              }
            : undefined
        }
      />
      <SearchToolbar
        value={filter}
        onChange={setFilter}
        placeholder="Buscar servicio…"
      />
      {servicesQuery.isPending ? (
        <CardsSkeleton
          count={6}
          className="min-h-0 flex-1 overflow-hidden sm:grid-cols-2 xl:grid-cols-3"
        />
      ) : servicesQuery.isError ? (
        <ErrorInformer
          message={getErrorMessage(servicesQuery.error)}
          retry={() => {
            void servicesQuery.refetch();
          }}
        />
      ) : servicesQuery.data?.length ? (
        <AppearList className="grid min-h-0 flex-1 auto-rows-max content-start gap-4 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
          {servicesQuery.data.map((service) => (
            <AppearArticle
              key={service.id}
              className="border-base-300 bg-base-100 rounded-box flex flex-col gap-4 border p-5"
            >
              <div className="flex items-center justify-between">
                <span className="bg-accent/20 text-success flex size-11 items-center justify-center rounded-xl">
                  <ScissorsIcon className="size-5" />
                </span>
                <ActionButtons
                  onEdit={
                    canWrite ? () => setServiceToUpdate(service) : undefined
                  }
                />
              </div>
              <h2 className="text-lg font-bold">{service.name}</h2>
              <p className="text-base-content/70 text-sm whitespace-pre-wrap">
                {service.info || "Sin descripción adicional."}
              </p>
              <span className="text-base-content/70 mt-auto pt-3 text-xs">
                Precio a definir en el turno
              </span>
            </AppearArticle>
          ))}
        </AppearList>
      ) : (
        <div className="border-base-300 bg-base-100 rounded-box border p-10 text-center">
          <p className="text-base-content/70">
            {filter
              ? "No hay servicios que coincidan con tu búsqueda."
              : "Todavía no hay servicios cargados."}
          </p>
        </div>
      )}
      {isCreateModalOpen ? (
        <ServiceModal isOpen onClose={() => setIsCreateModalOpen(false)} />
      ) : null}
      {serviceToUpdate ? (
        <ServiceModal
          isOpen
          service={serviceToUpdate}
          onClose={() => setServiceToUpdate(undefined)}
        />
      ) : null}
    </AppearGroup>
  );
}
