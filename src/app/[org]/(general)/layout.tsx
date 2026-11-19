import { NavigationViewport } from "@/components/layout/route-navigation";
import type { ReactNode } from "react";
import { SystemNavigation } from "@/components/layout/system-navigation";
import { BubbleCluster, PawTrail } from "@/components/backdrop";
import { SessionGuard } from "@/components/session-guard";
export default function GeneralLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-dvh min-h-0 flex-col overflow-hidden bg-[#F9F9F9] lg:flex-row">
      <SystemNavigation />
      {/* isolate keeps the decorative layer behind every view. */}
      <main className="relative isolate min-h-0 min-w-0 flex-1 overflow-hidden">
        <PawTrail className="text-secondary/25 absolute bottom-6 left-6 -z-10" />
        <BubbleCluster className="absolute top-4 right-6 -z-10" />
        <NavigationViewport>
          <SessionGuard>{children}</SessionGuard>
        </NavigationViewport>
      </main>
    </div>
  );
}
