"use client";
import { InfoIcon, MenuIcon, PawPrintIcon, LogOutIcon } from "lucide-react";
import { NavigationLink as Link } from "@/components/layout/route-navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/shadcn/sheet";
import { ErrorAlert } from "@/components/forms";
import { useSession, useLogout } from "@/features/session/session.client";
import { roleLabels } from "@/features/shared/format";
import { getErrorMessage } from "@/lib/query";
import { cn } from "@/lib/cn";
import { navigationSections } from "@/utils/sections";
function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-primary text-neutral flex size-9 items-center justify-center rounded-xl">
        <PawPrintIcon className="size-5" />
      </span>
      <div>
        <span className="text-neutral-content block text-lg font-bold">
          WoofDesk
        </span>
        <span className="text-secondary/70 font-mono-ui block text-[9px] tracking-widest">
          GROOMING OS
        </span>
      </div>
    </div>
  );
}
function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
  const session = useSession();
  const pathname = usePathname();
  const logout = useLogout();
  const org = session.data?.orgId;
  return (
    <div className="bg-neutral flex h-full flex-col justify-between gap-6 overflow-y-auto px-4.5 py-7">
      <div className="flex flex-col gap-6">
        <Brand />
        <div className="bg-base-100/5 rounded-xl p-3">
          <p className="text-neutral-content text-xs font-semibold">
            Organización #{org}
          </p>
          <p className="text-secondary/70 mt-1 text-[10px]">
            Espacio de trabajo
          </p>
        </div>
        <nav aria-label="Navegación principal" className="flex flex-col gap-5">
          {navigationSections.map((section) => {
            const items = section.items.filter(
              (item) => !item.adminOnly || session.data?.role === "ADMIN",
            );
            return (
              <div key={section.label} className="flex flex-col gap-1">
                <p className="text-secondary/65 font-mono-ui mb-1 px-3 text-[9px] font-semibold tracking-widest">
                  {section.label}
                </p>
                {items.map((item) => {
                  const href = `/${org}${item.href}`;
                  const active =
                    pathname === href || pathname.startsWith(href + "/");
                  const Icon = item.icon;
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-10 items-center gap-2.5 rounded-lg px-3 text-xs focus-visible:outline-white",
                        active
                          ? "bg-primary text-primary-content font-semibold"
                          : "text-base-200 hover:bg-base-100/5",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4",
                          active ? "text-neutral" : "text-secondary",
                        )}
                      />
                      <span>{item.label}</span>
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="bg-accent ml-auto size-1.5 rounded-full"
                        />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>
      <footer className="flex flex-col gap-3">
        <Link
          href={`/${org}/ayuda`}
          onClick={onNavigate}
          className="border-secondary/25 text-base-200 hover:bg-base-100/5 flex items-center gap-2.5 rounded-lg border px-3 py-3 text-xs"
        >
          <InfoIcon className="text-secondary size-4" />
          Centro de ayuda
        </Link>
        <Link
          href={`/${org}/cuenta`}
          onClick={onNavigate}
          className="border-secondary/25 flex items-center gap-3 border-t pt-4"
        >
          <span className="bg-accent text-neutral flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold">
            #{session.data?.userId}
          </span>
          <div>
            <p className="text-neutral-content text-xs font-semibold">
              Usuario #{session.data?.userId}
            </p>
            <p className="text-secondary/80 text-[10px]">
              {roleLabels[session.data?.role ?? ""]}
            </p>
          </div>
        </Link>
        <button
          type="button"
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
          className="text-secondary hover:text-neutral-content flex items-center gap-2 self-start px-1 py-2 text-xs"
        >
          <LogOutIcon className="size-3.5" />
          {logout.isPending ? "Cerrando…" : "Cerrar sesión"}
        </button>
        <ErrorAlert
          message={logout.error ? getErrorMessage(logout.error) : undefined}
        />
      </footer>
    </div>
  );
}
export function SystemNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <aside
        aria-label="Navegación del sistema"
        className="hidden h-full w-62 shrink-0 lg:block"
      >
        <NavigationContent />
      </aside>
      <header className="bg-neutral z-40 flex h-16 shrink-0 items-center justify-between px-4 lg:hidden">
        <Brand />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir navegación"
          aria-expanded={isOpen}
          className="text-neutral-content hover:bg-base-100/10 flex size-10 items-center justify-center rounded-sm"
        >
          <MenuIcon className="size-5" />
        </button>
      </header>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          accessibleTitle="Navegación del sistema"
          accessibleDescription="Accesos principales de WoofDesk"
          className="bg-neutral [&>button]:text-neutral-content w-62 max-w-[85vw] gap-0 border-0 p-0 sm:max-w-62"
        >
          <NavigationContent onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}
