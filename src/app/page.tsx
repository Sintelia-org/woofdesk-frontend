import {
  Bell,
  CalendarDays,
  Clock3,
  Dog,
  HomeIcon,
  Package,
  PawPrint,
  Plus,
  Scissors,
  Search,
  Settings,
  Users,
} from "lucide-react";

import { Button } from "@/components/shadcn/button";

const navigation = [
  { icon: HomeIcon, label: "Resumen" },
  { icon: CalendarDays, label: "Agenda" },
  { icon: Clock3, label: "Turnos" },
  { icon: Dog, label: "Mascotas" },
  { icon: Users, label: "Clientes" },
  { icon: Scissors, label: "Servicios" },
  { icon: Package, label: "Inventario" },
];

const stats = [
  { label: "Turnos de hoy", value: "12", detail: "3 pendientes" },
  { label: "Mascotas", value: "248", detail: "8 nuevas este mes" },
  { label: "Clientes", value: "186", detail: "74% recurrentes" },
  { label: "Ocupación", value: "82%", detail: "Próximos 7 días" },
];

const appointments = [
  {
    pet: "Luna",
    owner: "Sofía Martínez",
    service: "Baño y corte",
    time: "09:00",
  },
  { pet: "Toby", owner: "Lucas Pérez", service: "Deslanado", time: "10:30" },
  {
    pet: "Mora",
    owner: "Valentina Díaz",
    service: "Baño completo",
    time: "12:00",
  },
];

export default function Home() {
  return (
    <main className="bg-base-200 min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="bg-neutral text-neutral-content hidden min-h-screen flex-col p-5 lg:flex">
        <div className="flex items-center gap-3 px-2 py-3">
          <span className="bg-primary text-primary-content grid size-10 place-items-center rounded-xl">
            <PawPrint className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-bold">PawFlow</p>
            <p className="text-neutral-content/60 text-xs">Gestión de turnos</p>
          </div>
        </div>

        <nav className="mt-8 space-y-1" aria-label="Navegación principal">
          {navigation.map(({ icon: Icon, label }, index) => (
            <a
              className={
                index === 0
                  ? "bg-primary text-primary-content flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold"
                  : "text-neutral-content/70 hover:bg-neutral-content/10 hover:text-neutral-content flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
              }
              href="#"
              key={label}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </a>
          ))}
        </nav>

        <a
          className="text-neutral-content/70 hover:bg-neutral-content/10 hover:text-neutral-content mt-auto flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors"
          href="#"
        >
          <Settings className="size-4" aria-hidden="true" />
          Configuración
        </a>
      </aside>

      <section className="min-w-0">
        <header className="border-base-300 bg-base-100 flex h-18 items-center justify-between border-b px-5 md:px-8">
          <div className="flex items-center gap-3 lg:hidden">
            <span className="bg-primary text-primary-content grid size-9 place-items-center rounded-lg">
              <PawPrint className="size-4" aria-hidden="true" />
            </span>
            <span className="font-bold">PawFlow</span>
          </div>

          <div className="relative hidden w-full max-w-sm md:block">
            <Search
              className="text-base-content/45 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              aria-label="Buscar"
              className="input input-bordered bg-base-200 focus:border-primary h-10 w-full pl-10 focus:outline-none"
              placeholder="Buscar mascotas, clientes o turnos"
              type="search"
            />
          </div>

          <button
            aria-label="Notificaciones"
            className="btn btn-ghost btn-square btn-sm ml-auto"
            type="button"
          >
            <Bell className="size-5" />
          </button>
        </header>

        <div className="mx-auto max-w-7xl space-y-7 p-5 md:p-8">
          <div className="animate-appear flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-primary text-sm font-semibold">
                Jueves, 15 de octubre
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight">
                Buen día, Matías
              </h1>
              <p className="text-base-content/60 mt-1 text-sm">
                Esta pantalla inicial confirma que el setup y el tema funcionan.
              </p>
            </div>
            <Button className="sm:self-auto">
              <Plus className="size-4" aria-hidden="true" />
              Nuevo turno
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <article
                className="border-base-300 bg-base-100 rounded-box border p-5 shadow-sm"
                key={stat.label}
              >
                <p className="text-base-content/60 text-sm">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold">{stat.value}</p>
                <p className="text-success mt-2 text-xs font-medium">
                  {stat.detail}
                </p>
              </article>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.8fr)]">
            <section className="border-base-300 bg-base-100 rounded-box overflow-hidden border shadow-sm">
              <div className="border-base-300 flex items-center justify-between border-b px-5 py-4">
                <div>
                  <h2 className="font-bold">Próximos turnos</h2>
                  <p className="text-base-content/55 text-sm">
                    Agenda de esta mañana
                  </p>
                </div>
                <button className="btn btn-ghost btn-sm" type="button">
                  Ver agenda
                </button>
              </div>

              <div className="divide-base-300 divide-y">
                {appointments.map((appointment) => (
                  <article
                    className="grid gap-3 px-5 py-4 sm:grid-cols-[4rem_1fr_auto] sm:items-center"
                    key={`${appointment.pet}-${appointment.time}`}
                  >
                    <p className="text-primary font-bold">{appointment.time}</p>
                    <div>
                      <p className="font-semibold">{appointment.pet}</p>
                      <p className="text-base-content/55 text-sm">
                        {appointment.owner} · {appointment.service}
                      </p>
                    </div>
                    <span className="badge badge-success badge-soft">
                      Confirmado
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <aside className="border-base-300 bg-base-100 rounded-box border p-5 shadow-sm">
              <h2 className="font-bold">Setup preparado</h2>
              <p className="text-base-content/55 mt-1 text-sm">
                Bases listas para comenzar a construir módulos.
              </p>
              <ul className="mt-5 space-y-3 text-sm">
                {[
                  "Next.js App Router + TypeScript",
                  "DaisyUI con tema PawFlow",
                  "shadcn/Radix reutilizable",
                  "React Query + Axios",
                  "React Hook Form + Zod",
                  "Zustand y Sonner",
                ].map((item) => (
                  <li className="flex items-center gap-3" key={item}>
                    <span className="bg-accent size-2 rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
