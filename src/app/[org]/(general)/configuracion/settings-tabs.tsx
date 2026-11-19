"use client";
import {
  KeyRoundIcon,
  PawPrintIcon,
  ShieldCheckIcon,
  UserRoundCogIcon,
  UserRoundIcon,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import { AppearItem } from "@/components/appear";
import { NavigationLink as Link } from "@/components/layout/route-navigation";
import { useSession } from "@/features/session/session.client";
import { cn } from "@/lib/cn";

const settingsTabs = [
  {
    segment: "personal",
    label: "Personal",
    caption: "Quién atiende los turnos",
    icon: UserRoundCogIcon,
    adminOnly: true,
  },
  {
    segment: "usuarios",
    label: "Usuarios",
    caption: "Quién entra al sistema",
    icon: UserRoundIcon,
    adminOnly: true,
  },
  {
    segment: "roles",
    label: "Roles",
    caption: "Qué puede hacer cada uno",
    icon: ShieldCheckIcon,
  },
  {
    segment: "cuenta",
    label: "Mi cuenta",
    caption: "Contraseña y sesiones",
    icon: KeyRoundIcon,
  },
];

// Each tab is a route, so sections are linkable and the back button works.
// The active tab drops a notch toward the content it controls.
export function SettingsTabs() {
  const session = useSession();
  const pathname = usePathname();
  const { org } = useParams<{ org: string }>();
  const isAdmin = session.data?.role === "ADMIN";
  return (
    <AppearItem className="shrink-0">
      <nav
        aria-label="Secciones de configuración"
        className="-mx-1 overflow-x-auto px-1 pt-1 pb-3"
      >
        <ul className="flex gap-2 sm:gap-3">
          {settingsTabs
            .filter((tab) => !tab.adminOnly || isAdmin)
            .map((tab) => {
              const href = `/${org}/configuracion/${tab.segment}`;
              const active =
                pathname === href || pathname.startsWith(href + "/");
              const Icon = tab.icon;
              return (
                <li
                  key={tab.segment}
                  className="flex-none sm:max-w-64 sm:flex-1"
                >
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-box relative flex h-full items-center gap-3 border py-2.5 pr-3 pl-2.5 transition-colors",
                      active
                        ? "bg-neutral border-neutral text-neutral-content after:bg-neutral after:absolute after:-bottom-1.5 after:left-6 after:size-3 after:rotate-45 after:rounded-xs"
                        : "bg-base-100 border-base-300 hover:border-secondary hover:bg-secondary/10",
                    )}
                  >
                    <span
                      className={cn(
                        "rounded-field flex size-9 shrink-0 items-center justify-center",
                        active
                          ? "bg-primary text-neutral"
                          : "bg-primary/15 text-primary-ink",
                      )}
                    >
                      <Icon aria-hidden="true" className="size-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold whitespace-nowrap">
                        {tab.label}
                      </span>
                      <span
                        className={cn(
                          "hidden truncate text-xs sm:block",
                          active ? "text-secondary" : "text-base-content/70",
                        )}
                      >
                        {tab.caption}
                      </span>
                    </span>
                    {active ? (
                      <PawPrintIcon
                        aria-hidden="true"
                        fill="currentColor"
                        strokeWidth={1}
                        className="text-primary hidden size-3.5 shrink-0 sm:block"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </AppearItem>
  );
}
