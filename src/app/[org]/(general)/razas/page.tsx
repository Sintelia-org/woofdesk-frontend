"use client";
import { AppearGroup, AppearItem } from "@/components/appear";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PawPrintIcon } from "lucide-react";
import { GeneralHeader } from "@/components/header";
import { SearchToolbar } from "@/components/entity-ui";
import { TableWorking, type TableColumn } from "@/components/table";
import { getBreeds } from "@/features/breeds/requests";
import type { Breed } from "@/features/breeds/schemas";
import { speciesLabels } from "@/features/pets/schemas";
import { useSession } from "@/features/session/session.client";
import type { ServerError } from "@/lib/types";
export default function BreedsPage() {
  const session = useSession();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const breedsQuery = useQuery<
    Awaited<ReturnType<typeof getBreeds>>,
    ServerError
  >({
    queryKey: ["breeds", session.data?.orgId, filter],
    queryFn: () => getBreeds(filter),
    enabled: !!session.data,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const columns: TableColumn<Breed>[] = [
    { label: "Raza", key: "name", width: "2fr" },
    {
      label: "Especie",
      key: "species",
      render: (breed) => speciesLabels[breed.species],
      width: "1fr",
    },
  ];
  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Razas"
        Svg={PawPrintIcon}
        count={breedsQuery.data?.length}
        description="Catálogo compartido de referencia para las fichas de mascotas. Disponible para consulta."
      />
      <SearchToolbar
        value={filter}
        onChange={(value) => {
          setFilter(value);
          setPage(1);
        }}
        placeholder="Buscar raza…"
      />
      <AppearItem className="min-h-0 flex-1 overflow-hidden">
        <TableWorking<Breed>
          fixedLastColumn={false}
          ariaLabel="Catálogo de razas"
          itemLabel="razas"
          searchInput={filter}
          columns={columns}
          data={breedsQuery.data?.slice((page - 1) * 20, page * 20)}
          loading={breedsQuery.isPending}
          error={breedsQuery.error}
          pagination={{
            page,
            limit: 20,
            total: breedsQuery.data?.length ?? 0,
            setPage,
          }}
        />
      </AppearItem>
    </AppearGroup>
  );
}
