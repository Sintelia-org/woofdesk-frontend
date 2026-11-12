"use client";
import { AppearArticle, AppearGroup } from "@/components/appear";
import { useState } from "react";
import {
  KeyRoundIcon,
  LogOutIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react";
import { GeneralHeader } from "@/components/header";
import {
  ChangePasswordModal,
  LogoutAllModal,
} from "@/components/modals/account";
import { useSession, useLogout } from "@/features/session/session.client";
import { roleLabels } from "@/features/shared/format";
import { ErrorAlert } from "@/components/forms";
import { getErrorMessage } from "@/lib/query";
export default function AccountPage() {
  const session = useSession();
  const logout = useLogout();
  const [changeOpen, setChangeOpen] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  return (
    <AppearGroup className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Mi cuenta"
        Svg={UserRoundIcon}
        description="Cuidá tu acceso y administrá tus sesiones."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <AppearArticle className="border-base-300 bg-base-100 rounded-box border p-6">
          <ShieldCheckIcon className="text-primary mb-4 size-7" />
          <h2 className="font-bold">Sesión actual</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <dt className="text-base-content/70">Usuario</dt>
            <dd>#{session.data?.userId}</dd>
            <dt className="text-base-content/70">Organización</dt>
            <dd>#{session.data?.orgId}</dd>
            <dt className="text-base-content/70">Rol</dt>
            <dd>{roleLabels[session.data?.role ?? ""]}</dd>
            <dt className="text-base-content/70">Vencimiento</dt>
            <dd>
              {session.data
                ? new Date(session.data.expiresAt).toLocaleString("es-AR")
                : "—"}
            </dd>
          </dl>
        </AppearArticle>
        <AppearArticle className="border-base-300 bg-base-100 rounded-box flex flex-col items-start gap-4 border p-6">
          <h2 className="font-bold">Seguridad</h2>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => setChangeOpen(true)}
          >
            <KeyRoundIcon className="size-4" />
            Cambiar contraseña
          </button>
          <button
            type="button"
            className="btn btn-outline btn-sm text-warning"
            onClick={() => setLogoutAllOpen(true)}
          >
            Cerrar todas las sesiones
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            disabled={logout.isPending}
            onClick={() => logout.mutate()}
          >
            <LogOutIcon className="size-4" />
            {logout.isPending ? "Cerrando…" : "Cerrar esta sesión"}
          </button>
          <ErrorAlert
            message={logout.error ? getErrorMessage(logout.error) : undefined}
          />
        </AppearArticle>
      </div>
      {changeOpen ? (
        <ChangePasswordModal isOpen onClose={() => setChangeOpen(false)} />
      ) : null}
      {logoutAllOpen ? (
        <LogoutAllModal isOpen onClose={() => setLogoutAllOpen(false)} />
      ) : null}
    </AppearGroup>
  );
}
