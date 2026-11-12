"use client";
import { AppearGroup, AppearItem } from "@/components/appear";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UsersIcon } from "lucide-react";
import { GeneralHeader } from "@/components/header";
import {
  SearchToolbar,
  ActiveFilter,
  StatusBadge,
  ActionButtons,
} from "@/components/entity-ui";
import {
  TableWorking,
  type TableColumn,
  type DataPerPage,
} from "@/components/table";
import { ClientModal, ToggleClientModal } from "@/components/modals/clients";
import { getClients } from "@/features/clients/requests";
import { type Client } from "@/features/clients/schemas";
import { useSession } from "@/features/session/session.client";

import type { ServerError } from "@/lib/types";

export default function ClientsPage() {
  const session = useSession();
  const orgId = session.data?.orgId;
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<DataPerPage>(10);
  const [active, setActive] = useState("true");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recordToUpdate, setRecordToUpdate] = useState<Client>();
  const [recordToToggle, setRecordToToggle] = useState<Client>();

  const canWrite =
    session.data?.role === "ADMIN" || session.data?.role === "RECEPTIONIST";
  const clientsQuery = useQuery<
    Awaited<ReturnType<typeof getClients>>,
    ServerError
  >({
    queryKey: ["clients", orgId, page, limit, filter, active],
    queryFn: () =>
      getClients({
        page: page - 1,
        size: limit,
        search: filter || undefined,
        active: active === "all" ? undefined : active === "true",
      }),
    enabled: Boolean(orgId),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const columns: TableColumn<Client>[] = [
    {
      label: "Nombre",
      key: "name",
      render: (item: Client) => item.name || "—",
      width: "1.5fr",
    },
    {
      label: "Teléfono",
      key: "phone",
      render: (item: Client) => item.phone || "—",
      width: "1fr",
    },
    {
      label: "Información",
      key: "info",
      render: (item: Client) => item.info || "—",
      width: "1fr",
    },
    {
      label: "Estado",
      key: "active",
      render: (item) => <StatusBadge active={item.active} />,
      width: "100px",
    },
    {
      label: "Acciones",
      key: "actions",
      sortable: false,
      render: (item) => (
        <div className="flex items-center justify-end">
          <ActionButtons
            active={item.active}
            onEdit={canWrite ? () => setRecordToUpdate(item) : undefined}
            onToggle={canWrite ? () => setRecordToToggle(item) : undefined}
          />
        </div>
      ),
      width: "110px",
    },
  ];

  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Clientes"
        Svg={UsersIcon}
        count={clientsQuery.data?.totalElements}
        description="Las personas que confían en tu peluquería. Contactos e historial, en un solo lugar."
        button={
          canWrite
            ? {
                text: "Agregar cliente",
                onClick: () => setIsCreateModalOpen(true),
              }
            : undefined
        }
      />
      <SearchToolbar
        value={filter}
        placeholder="Buscar cliente…"
        onChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
      >
        <ActiveFilter
          value={active}
          onChange={(value) => {
            setActive(value);
            setPage(1);
          }}
        />
      </SearchToolbar>
      <AppearItem className="min-h-0 min-w-0 flex-1 overflow-hidden">
        <TableWorking<Client>
          ariaLabel="Tabla de clientes"
          itemLabel="clientes"
          addButtonLabel="Agregar cliente"
          searchInput={filter}
          columns={columns}
          data={clientsQuery.data?.content}
          loading={clientsQuery.isPending}
          error={clientsQuery.error}
          pagination={{
            page,
            limit,
            total: clientsQuery.data?.totalElements ?? 0,
            setPage,
            changeLimit: (value) => {
              setLimit(value);
              setPage(1);
            },
            showPageSize: true,
          }}
          onAdd={canWrite ? () => setIsCreateModalOpen(true) : undefined}
        />
      </AppearItem>
      {isCreateModalOpen ? (
        <ClientModal isOpen onClose={() => setIsCreateModalOpen(false)} />
      ) : null}
      {recordToUpdate ? (
        <ClientModal
          isOpen
          client={recordToUpdate}
          onClose={() => setRecordToUpdate(undefined)}
        />
      ) : null}
      {recordToToggle ? (
        <ToggleClientModal
          isOpen
          client={recordToToggle}
          onClose={() => setRecordToToggle(undefined)}
        />
      ) : null}
    </AppearGroup>
  );
}
