"use client";
import { AppearGroup, AppearItem } from "@/components/appear";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { PersonName, SectionHeader } from "@/components/header";
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
  EmployeeModal,
  ToggleEmployeeModal,
} from "@/components/modals/employees";
import { getEmployees } from "@/features/employees/requests";
import { type Employee } from "@/features/employees/schemas";
import { useSession } from "@/features/session/session.client";
import { ErrorInformer } from "@/components/error";
import { roleLabels } from "@/features/shared/format";
import type { ServerError } from "@/lib/types";

export default function EmployeesPage() {
  const session = useSession();
  const orgId = session.data?.orgId;
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<DataPerPage>(10);
  const [active, setActive] = useState("true");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recordToUpdate, setRecordToUpdate] = useState<Employee>();
  const [recordToToggle, setRecordToToggle] = useState<Employee>();

  const canWrite = session.data?.role === "ADMIN";
  const employeesQuery = useQuery<
    Awaited<ReturnType<typeof getEmployees>>,
    ServerError
  >({
    queryKey: ["employees", orgId, page, limit, filter, active],
    queryFn: () =>
      getEmployees({
        page: page - 1,
        size: limit,
        search: filter || undefined,
        active: active === "all" ? undefined : active === "true",
      }),
    enabled: Boolean(orgId) && canWrite,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const columns: TableColumn<Employee>[] = [
    {
      label: "Nombre",
      key: "name",
      render: (item: Employee) => <PersonName name={item.name} />,
      width: "1.5fr",
    },
    {
      label: "Teléfono",
      key: "phone",
      render: (item: Employee) => item.phone || "—",
      width: "1fr",
    },
    {
      label: "Rol",
      key: "role",
      render: (item: Employee) => roleLabels[item.role] ?? item.role,
      width: "1fr",
    },
    {
      label: "Cuenta vinculada",
      key: "userEmail",
      render: (item: Employee) => item.userEmail || "—",
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
  if (session.data && !canWrite)
    return (
      <ErrorInformer message="Esta sección está disponible para administradores." />
    );
  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden">
      <SectionHeader
        title="Personal"
        count={employeesQuery.data?.totalElements}
        description="Las personas que atienden turnos, con su rol y la cuenta de acceso vinculada si la tienen."
        button={
          canWrite
            ? {
                text: "Agregar empleado",
                onClick: () => setIsCreateModalOpen(true),
              }
            : undefined
        }
      />
      <SearchToolbar
        value={filter}
        placeholder="Buscar empleado…"
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
        <TableWorking<Employee>
          ariaLabel="Tabla de personal"
          itemLabel="personal"
          addButtonLabel="Agregar empleado"
          searchInput={filter}
          emptySign="Sin personal"
          columns={columns}
          data={employeesQuery.data?.content}
          loading={employeesQuery.isPending}
          error={employeesQuery.error}
          pagination={{
            page,
            limit,
            total: employeesQuery.data?.totalElements ?? 0,
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
        <EmployeeModal isOpen onClose={() => setIsCreateModalOpen(false)} />
      ) : null}
      {recordToUpdate ? (
        <EmployeeModal
          isOpen
          employee={recordToUpdate}
          onClose={() => setRecordToUpdate(undefined)}
        />
      ) : null}
      {recordToToggle ? (
        <ToggleEmployeeModal
          isOpen
          employee={recordToToggle}
          onClose={() => setRecordToToggle(undefined)}
        />
      ) : null}
    </AppearGroup>
  );
}
