"use client";
import { AppearGroup, AppearItem } from "@/components/appear";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PawPrintIcon } from "lucide-react";
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
import {
  PetModal,
  TogglePetModal,
  PetDetailsModal,
} from "@/components/modals/pets";
import { getPets } from "@/features/pets/requests";
import { type Pet, sizeLabels } from "@/features/pets/schemas";
import { useSession } from "@/features/session/session.client";

import type { ServerError } from "@/lib/types";

export function PetsPage() {
  const session = useSession();
  const orgId = session.data?.orgId;
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<DataPerPage>(10);
  const [active, setActive] = useState("true");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailId, setDetailId] = useState<number>();
  const [recordToUpdate, setRecordToUpdate] = useState<Pet>();
  const [recordToToggle, setRecordToToggle] = useState<Pet>();

  const canWrite =
    session.data?.role === "ADMIN" || session.data?.role === "RECEPTIONIST";
  const petsQuery = useQuery<Awaited<ReturnType<typeof getPets>>, ServerError>({
    queryKey: ["pets", orgId, page, limit, filter, active],
    queryFn: () =>
      getPets({
        page: page - 1,
        size: limit,
        search: filter || undefined,
        active: active === "all" ? undefined : active === "true",
      }),
    enabled: Boolean(orgId),
    retry: false,
    refetchOnWindowFocus: false,
  });
  const columns: TableColumn<Pet>[] = [
    {
      label: "Nombre",
      key: "name",
      render: (item: Pet) => item.name || "—",
      width: "1.5fr",
    },
    {
      label: "Responsable",
      key: "clientName",
      render: (item: Pet) => item.clientName || "—",
      width: "1.5fr",
    },
    {
      label: "Raza",
      key: "breedName",
      render: (item: Pet) => item.breedName || "—",
      width: "1fr",
    },
    {
      label: "Tamaño",
      key: "size",
      render: (item: Pet) =>
        item.size ? sizeLabels[item.size] : "Sin informar",
      width: "1fr",
    },
    {
      label: "Peso",
      key: "weight",
      render: (item: Pet) => (item.weight !== null ? `${item.weight} kg` : "—"),
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
            onView={() => setDetailId(item.id)}
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
        title="Mascotas"
        Svg={PawPrintIcon}
        count={petsQuery.data?.totalElements}
        description="Cada mascota, con sus cuidados y su historia. Encontrá su ficha cuando la necesites."
        button={
          canWrite
            ? {
                text: "Agregar mascota",
                onClick: () => setIsCreateModalOpen(true),
              }
            : undefined
        }
      />
      <SearchToolbar
        value={filter}
        placeholder="Buscar mascota…"
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
        <TableWorking<Pet>
          ariaLabel="Tabla de mascotas"
          itemLabel="mascotas"
          addButtonLabel="Agregar mascota"
          searchInput={filter}
          columns={columns}
          data={petsQuery.data?.content}
          loading={petsQuery.isPending}
          error={petsQuery.error}
          pagination={{
            page,
            limit,
            total: petsQuery.data?.totalElements ?? 0,
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
      {detailId ? (
        <PetDetailsModal
          isOpen
          id={detailId}
          onClose={() => setDetailId(undefined)}
        />
      ) : null}
      {isCreateModalOpen ? (
        <PetModal isOpen onClose={() => setIsCreateModalOpen(false)} />
      ) : null}
      {recordToUpdate ? (
        <PetModal
          isOpen
          pet={recordToUpdate}
          onClose={() => setRecordToUpdate(undefined)}
        />
      ) : null}
      {recordToToggle ? (
        <TogglePetModal
          isOpen
          pet={recordToToggle}
          onClose={() => setRecordToToggle(undefined)}
        />
      ) : null}
    </AppearGroup>
  );
}
