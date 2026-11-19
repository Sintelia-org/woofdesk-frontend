import { SettingsIcon } from "lucide-react";
import type { ReactNode } from "react";
import { AppearGroup } from "@/components/appear";
import { GeneralHeader } from "@/components/header";
import { SettingsTabs } from "./settings-tabs";

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8">
      <GeneralHeader
        title="Configuración"
        Svg={SettingsIcon}
        subtitle="Tu equipo, quién entra al sistema y qué puede hacer cada uno."
      />
      <SettingsTabs />
      <div className="min-h-0 min-w-0 flex-1">{children}</div>
    </AppearGroup>
  );
}
