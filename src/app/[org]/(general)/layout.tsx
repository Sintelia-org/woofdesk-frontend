import { NavigationViewport } from "@/components/layout/route-navigation";
import type { ReactNode } from "react";
import { SystemNavigation } from "@/components/layout/system-navigation";
import { SessionGuard } from "@/components/session-guard";
export default function GeneralLayout({ children }: { children: ReactNode }) {
  return (
    <SessionGuard>
      <div className="bg-base-200 flex h-dvh min-h-0 flex-col overflow-hidden lg:flex-row">
        <SystemNavigation />
        <main className="min-h-0 min-w-0 flex-1 overflow-hidden">
          <NavigationViewport>{children}</NavigationViewport>
        </main>
      </div>
    </SessionGuard>
  );
}
