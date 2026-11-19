import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  PawPrintIcon,
  ScissorsIcon,
  SparklesIcon,
  UsersIcon,
  BookOpenIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";
export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
};
export type NavigationSection = { label: string; items: NavigationItem[] };
export const navigationSections: NavigationSection[] = [
  {
    label: "Gestión",
    items: [
      { label: "Resumen", href: "/dashboard", icon: LayoutDashboardIcon },
      { label: "Agenda", href: "/agenda", icon: CalendarDaysIcon },
      { label: "Turnos", href: "/turnos", icon: ScissorsIcon },
      { label: "Mascotas", href: "/mascotas", icon: PawPrintIcon },
      { label: "Clientes", href: "/clientes", icon: UsersIcon },
    ],
  },
  {
    label: "Negocio",
    items: [
      { label: "Servicios", href: "/servicios", icon: SparklesIcon },
      { label: "Razas", href: "/razas", icon: BookOpenIcon },
    ],
  },
  {
    label: "Ajustes",
    items: [
      { label: "Configuración", href: "/configuracion", icon: SettingsIcon },
    ],
  },
];
