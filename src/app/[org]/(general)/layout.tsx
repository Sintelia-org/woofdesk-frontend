import type { ReactNode } from "react";

import { SystemNavigation } from "@/components/layout/system-navigation";

export default function GeneralLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <SystemNavigation />
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
