import {
  CalendarDaysIcon,
  ChartNoAxesColumnIcon,
  ChevronsUpDownIcon,
  EllipsisIcon,
  InfoIcon,
  LayoutDashboardIcon,
  MenuIcon,
  PackageIcon,
  PawPrintIcon,
  ScissorsIcon,
  SettingsIcon,
  SparklesIcon,
  UserRoundCogIcon,
  UsersIcon,
  WalletCardsIcon,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavigationSection = {
  label: string;
  items: NavigationItem[];
};

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
      { label: "Inventario", href: "/inventario", icon: PackageIcon },
      { label: "Caja", href: "/caja", icon: WalletCardsIcon },
      { label: "Reportes", href: "/reportes", icon: ChartNoAxesColumnIcon },
    ],
  },
  {
    label: "EQUIPO",
    items: [
      { label: "Personal", href: "/personal", icon: UserRoundCogIcon },
      { label: "Configuración", href: "/configuracion", icon: SettingsIcon },
    ],
  },
];
