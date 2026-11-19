"use client";
import { useState, type ReactNode } from "react";
import {
  KeyRoundIcon,
  LogOutIcon,
  MonitorSmartphoneIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { AppearArticle, AppearGroup } from "@/components/appear";
import { ErrorAlert } from "@/components/forms";
import { SectionHeader } from "@/components/header";
import {
  ChangePasswordModal,
  LogoutAllModal,
} from "@/components/modals/account";
import { Button } from "@/components/shadcn/button";
import { useLogout, useSession } from "@/features/session/session.client";
import { roleDescriptions, roleLabels } from "@/features/shared/format";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/query";

const rowTones = {
  primary: "bg-primary/15 text-primary",
  info: "bg-info/15 text-info",
  warning: "bg-warning/15 text-warning",
} as const;

function SecurityRow({
  Icon,
  tone,
  title,
  description,
  children,
}: {
  Icon: LucideIcon;
  tone: keyof typeof rowTones;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 px-6 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span
        className={cn(
          "rounded-field flex size-10 shrink-0 items-center justify-center",
          rowTones[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-base-content/70 mt-0.5 text-sm text-pretty">
          {description}
        </p>
      </div>
      <div className="col-start-2 justify-self-start sm:col-start-3">
        {children}
      </div>
    </li>
  );
}

export default function AccountPage() {
  const session = useSession();
  const logout = useLogout();
  const [changeOpen, setChangeOpen] = useState(false);
  const [logoutAllOpen, setLogoutAllOpen] = useState(false);
  const role = session.data?.role ?? "";
  return (
    <AppearGroup className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto">
      <SectionHeader
        title="Mi cuenta"
        description="Tus datos de acceso y los dispositivos donde iniciaste sesión."
      />
      <div className="grid max-w-6xl gap-4 lg:grid-cols-[2fr_3fr] lg:items-start">
        <AppearArticle className="border-base-300 bg-base-100 rounded-box flex flex-col overflow-hidden border">
          <div
            className="awning shrink-0 [--awning-band:44px] [--awning-r:14px]"
            aria-hidden="true"
          />
          <div className="-mt-7 flex flex-col gap-5 px-6 pb-6">
            <span className="bg-accent text-neutral ring-base-100 flex size-18 items-center justify-center rounded-full ring-4">
              <UserRoundIcon className="size-8" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-bold wrap-break-word">
                {session.data?.userName}
              </h2>
              <p className="text-base-content/70 text-sm break-all">
                {session.data?.email}
              </p>
              <p className="text-base-content/70 mt-1 text-sm">
                {session.data?.orgName}
              </p>
            </div>
            {/* Collar tag: the ring hole shows the card behind it. */}
            <div className="bg-secondary/25 relative rounded-3xl py-4 pr-4 pl-11">
              <span
                aria-hidden="true"
                className="bg-base-100 ring-secondary absolute top-1/2 left-4 size-3 -translate-y-1/2 rounded-full ring-2"
              />
              <p className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheckIcon
                  className="text-primary size-4"
                  aria-hidden="true"
                />
                {roleLabels[role] ?? "Sin rol"}
              </p>
              <p className="text-base-content/70 mt-1.5 text-sm text-pretty">
                {roleDescriptions[role] ?? "Rol del sistema."}
              </p>
            </div>
          </div>
        </AppearArticle>
        <AppearArticle className="border-base-300 bg-base-100 rounded-box flex flex-col overflow-hidden border">
          <div className="border-base-300 border-b px-6 py-5">
            <h2 className="text-lg font-bold">Acceso y sesiones</h2>
            <p className="text-base-content/70 mt-1 text-sm">
              Cambiá tu contraseña o cerrá sesión en tus dispositivos.
            </p>
          </div>
          <ul className="divide-base-300 divide-y">
            <SecurityRow
              Icon={KeyRoundIcon}
              tone="primary"
              title="Contraseña"
              description="Al cambiarla se cierran tus sesiones en los otros dispositivos."
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => setChangeOpen(true)}
              >
                Cambiar contraseña
              </Button>
            </SecurityRow>
            <SecurityRow
              Icon={MonitorSmartphoneIcon}
              tone="info"
              title="Este dispositivo"
              description="Cerrás la sesión solo en este dispositivo. Los demás siguen abiertos."
            >
              <Button
                size="sm"
                variant="ghost"
                loading={logout.isPending}
                onClick={() => logout.mutate()}
              >
                {logout.isPending ? null : (
                  <LogOutIcon className="size-4" aria-hidden="true" />
                )}
                {logout.isPending ? "Cerrando…" : "Cerrar esta sesión"}
              </Button>
            </SecurityRow>
            <SecurityRow
              Icon={ShieldAlertIcon}
              tone="warning"
              title="Todos tus dispositivos"
              description="Usalo si perdiste un dispositivo o entraste desde una computadora compartida. También cierra esta sesión."
            >
              <Button
                size="sm"
                variant="outline"
                className="text-warning"
                onClick={() => setLogoutAllOpen(true)}
              >
                Cerrar todas las sesiones
              </Button>
            </SecurityRow>
          </ul>
          {logout.error ? (
            <div className="px-6 pb-5">
              <ErrorAlert message={getErrorMessage(logout.error)} />
            </div>
          ) : null}
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
