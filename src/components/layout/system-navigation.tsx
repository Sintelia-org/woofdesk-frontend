"use client";

import {
  ChevronsUpDownIcon,
  EllipsisIcon,
  InfoIcon,
  MenuIcon,
  PawPrintIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Sheet, SheetContent } from "@/components/shadcn/sheet";
import { cn } from "@/lib/cn";
import { navigationSections } from "@/utils/sections";

const organization = {
  initials: "CN",
  name: "Canina Norte",
  branch: "Sucursal Centro",
};

const currentUser = {
  name: "Sofía Martínez",
  role: "Administradora",
};

function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-primary text-neutral flex shrink-0 items-center justify-center",
        className,
      )}
    >
      <PawPrintIcon className="size-5" aria-hidden="true" />
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="size-9 rounded-[11px]" />
      <div className="flex flex-col gap-px">
        <span className="text-neutral-content text-[17px] leading-none font-bold">
          WoofDesk
        </span>
        <span className="text-secondary/80 font-mono text-[9px] tracking-widest">
          GROOMING OS
        </span>
      </div>
    </div>
  );
}

function MobileBrand() {
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className="size-9 rounded-[10px]" />
      <span className="text-neutral-content text-[17px] leading-none font-bold">
        WoofDesk
      </span>
    </div>
  );
}

function OrganizationCard() {
  return (
    <div className="bg-base-100/5 flex w-full items-center gap-2.5 rounded-[10px] p-3">
      <div className="bg-secondary text-neutral textarea-xs flex size-8 shrink-0 items-center justify-center rounded-lg font-bold">
        {organization.initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-neutral-content truncate text-xs font-semibold">
          {organization.name}
        </p>
        <p className="text-secondary/80 truncate text-[10px]">
          {organization.branch}
        </p>
      </div>
      <ChevronsUpDownIcon
        className="text-secondary/80 size-3.5 shrink-0"
        aria-hidden="true"
      />
    </div>
  );
}

function NavigationLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="flex flex-col gap-5">
      {navigationSections.map((section) => (
        <div key={section.label} className="flex flex-col gap-1">
          <p className="text-secondary/70 px-3 font-mono text-[9px] font-semibold tracking-[0.11em]">
            {section.label}
          </p>
          {section.items.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "focus-visible:outline-neutral-content flex h-10 items-center gap-2.5 rounded-[9px] px-3 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2",
                  isActive
                    ? "bg-primary text-neutral font-semibold"
                    : "text-base-200 hover:bg-base-100/5 hover:text-neutral-content",
                )}
              >
                <Icon
                  className={cn(
                    "size-4 shrink-0",
                    isActive ? "text-neutral" : "text-secondary",
                  )}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {item.label}
                </span>
                {isActive ? (
                  <span
                    className="bg-accent size-1.5 shrink-0 rounded-full"
                    aria-hidden="true"
                  />
                ) : null}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function NavigationFooter({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/ayuda"
        onClick={onNavigate}
        className="border-secondary/25 text-base-200 hover:bg-base-100/5 focus-visible:outline-neutral-content flex min-h-10 items-center gap-2.5 rounded-[9px] border px-3 py-2.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        <InfoIcon
          className="text-secondary size-4 shrink-0"
          aria-hidden="true"
        />
        Centro de ayuda
      </Link>

      <div className="border-secondary/25 flex items-center gap-2.5 border-t px-1 pt-3">
        <div
          className="bg-accent size-9 shrink-0 rounded-full"
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-neutral-content truncate text-xs font-semibold">
            {currentUser.name}
          </p>
          <p className="text-secondary/80 truncate text-[9px]">
            {currentUser.role}
          </p>
        </div>
        <EllipsisIcon
          className="text-secondary/80 size-4 shrink-0"
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function NavigationContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="bg-neutral flex h-full w-full flex-col justify-between gap-7 overflow-y-auto px-4.5 py-7">
      <div className="flex flex-col gap-7">
        <SidebarBrand />
        <OrganizationCard />
        <NavigationLinks onNavigate={onNavigate} />
      </div>
      <NavigationFooter onNavigate={onNavigate} />
    </div>
  );
}

export function SystemNavigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <aside
        aria-label="Navegación del sistema"
        className="sticky top-0 hidden h-screen w-62 shrink-0 lg:block"
      >
        <NavigationContent />
      </aside>

      <header className="bg-neutral sticky top-0 z-40 flex h-16 items-center justify-between px-4 lg:hidden">
        <MobileBrand />
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir navegación"
          aria-expanded={isOpen}
          className="text-neutral-content hover:bg-base-100/10 focus-visible:outline-neutral-content flex size-10 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <MenuIcon className="size-5" aria-hidden="true" />
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
