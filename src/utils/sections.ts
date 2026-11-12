import {
  CalendarDaysIcon,
  LayoutDashboardIcon,
  PawPrintIcon,
  ScissorsIcon,
  SparklesIcon,
  UserRoundCogIcon,
  UsersIcon,
  UserRoundIcon,
  ShieldCheckIcon,
  BookOpenIcon,
  KeyRoundIcon,
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
    label: "GESTIÓN",
    items: [
      { label: "Resumen", href: "/dashboard", icon: LayoutDashboardIcon },
      { label: "Agenda", href: "/agenda", icon: CalendarDaysIcon },
      { label: "Turnos", href: "/turnos", icon: ScissorsIcon },
      { label: "Mascotas", href: "/mascotas", icon: PawPrintIcon },
      { label: "Clientes", href: "/clientes", icon: UsersIcon },
    ],
  },
  {
    label: "NEGOCIO",
    items: [
      { label: "Servicios", href: "/servicios", icon: SparklesIcon },
      { label: "Razas", href: "/razas", icon: BookOpenIcon },
    ],
  },
  {
    label: "EQUIPO",
    items: [
      {
        label: "Personal",
        href: "/personal",
        icon: UserRoundCogIcon,
        adminOnly: true,
      },
      {
        label: "Usuarios",
        href: "/usuarios",
        icon: UserRoundIcon,
        adminOnly: true,
      },
      { label: "Roles", href: "/roles", icon: ShieldCheckIcon },
      { label: "Mi cuenta", href: "/cuenta", icon: KeyRoundIcon },
    ],
  },
];
