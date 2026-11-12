"use client";
import { AppearGroup, AppearItem } from "@/components/appear";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { UserRoundIcon, KeyRoundIcon } from "lucide-react";
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
  UserModal,
  ToggleUserModal,
  UserPasswordModal,
} from "@/components/modals/users";
import { getUsers } from "@/features/users/requests";
import { type User } from "@/features/users/schemas";
import { useSession } from "@/features/session/session.client";
import { ErrorInformer } from "@/components/error";
import { roleLabels } from "@/features/shared/format";
import type { ServerError } from "@/lib/types";

export default function UsersPage() {
  const session = useSession();
  const orgId = session.data?.orgId;
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<DataPerPage>(10);
  const [active, setActive] = useState("true");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [recordToUpdate, setRecordToUpdate] = useState<User>();
  const [recordToToggle, setRecordToToggle] = useState<User>();
  const [passwordUser, setPasswordUser] = useState<User>();
  const canWrite = session.data?.role === "ADMIN";
  const usersQuery = useQuery<
    Awaited<ReturnType<typeof getUsers>>,
    ServerError
  >({
    queryKey: ["users", orgId, page, limit, filter, active],
    queryFn: () =>
      getUsers({
        page: page - 1,
        size: limit,
        search: filter || undefined,
        active: active === "all" ? undefined : active === "true",
      }),
    enabled: Boolean(orgId) && canWrite,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const columns: TableColumn<User>[] = [
    {
      label: "Nombre",
      key: "name",
      render: (item: User) => item.name || "—",
      width: "1.5fr",
    },
    {
      label: "Correo",
      key: "email",
      render: (item: User) => item.email || "—",
      width: "1fr",
    },
    {
      label: "Teléfono",
      key: "phone",
      render: (item: User) => item.phone || "—",
      width: "1fr",
    },
    {
      label: "Rol",
      key: "role",
      render: (item: User) => roleLabels[item.role] ?? item.role,
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
          <button
            type="button"
            disabled={!canWrite}
            title="Asignar contraseña"
            aria-label="Asignar contraseña nueva"
            className="btn btn-ghost btn-sm btn-square"
            onClick={() => setPasswordUser(item)}
          >
            <KeyRoundIcon className="size-4" />
          </button>
          <ActionButtons
            active={item.active}
            onEdit={canWrite ? () => setRecordToUpdate(item) : undefined}
            onToggle={
              canWrite && item.id !== session.data?.userId
                ? () => setRecordToToggle(item)
                : undefined
            }
          />
        </div>
      ),
      width: "110px",
    },
  ];
  if (session.data && !canWrite)
    return (
      <div className="p-6">
        <ErrorInformer message="Esta vista está disponible para administradores." />
      </div>
    );
  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Usuarios"
        Svg={UserRoundIcon}
        count={usersQuery.data?.totalElements}
        description="Administrá el acceso de tu equipo y sus permisos."
        button={
          canWrite
            ? {
                text: "Agregar usuario",
                onClick: () => setIsCreateModalOpen(true),
              }
            : undefined
        }
      />
      <SearchToolbar
        value={filter}
        placeholder="Buscar usuario…"
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
        <TableWorking<User>
          ariaLabel="Tabla de usuarios"
          itemLabel="usuarios"
          addButtonLabel="Agregar usuario"
          searchInput={filter}
          columns={columns}
          data={usersQuery.data?.content}
          loading={usersQuery.isPending}
          error={usersQuery.error}
          pagination={{
            page,
            limit,
            total: usersQuery.data?.totalElements ?? 0,
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
        <UserModal isOpen onClose={() => setIsCreateModalOpen(false)} />
      ) : null}
      {recordToUpdate ? (
        <UserModal
          isOpen
          user={recordToUpdate}
          onClose={() => setRecordToUpdate(undefined)}
        />
      ) : null}
      {recordToToggle ? (
        <ToggleUserModal
          isOpen
          user={recordToToggle}
          onClose={() => setRecordToToggle(undefined)}
        />
      ) : null}
      {passwordUser ? (
        <UserPasswordModal
          isOpen
          user={passwordUser}
          onClose={() => setPasswordUser(undefined)}
        />
      ) : null}
    </AppearGroup>
  );
}
