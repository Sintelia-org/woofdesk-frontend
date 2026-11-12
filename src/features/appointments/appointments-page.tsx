"use client";
import { DatePickerPopover } from "@/components/date";
import { SelectInput } from "@/components/select-input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays } from "date-fns";
import { toast } from "sonner";
import { ErrorAlert } from "@/components/forms";
import { cn } from "@/lib/cn";
import dynamic from "next/dynamic";
import {
  calendarDate,
  calendarDay,
  calendarRange,
  movedAppointmentTime,
  type CalendarState,
  type CalendarTarget,
} from "./calendar";
import { useState } from "react";
import {
  CalendarDaysIcon,
  ScissorsIcon,
  EyeIcon,
  CheckIcon,
  RotateCcwIcon,
} from "lucide-react";
import { GeneralHeader } from "@/components/header";
import { SearchToolbar, ActionButtons } from "@/components/entity-ui";
import {
  TableWorking,
  type TableColumn,
  type DataPerPage,
} from "@/components/table";
import {
  AppearArticle,
  AppearGroup,
  AppearItem,
  AppearList,
} from "@/components/appear";
import { ErrorInformer } from "@/components/error";
import { LoadingSpinner } from "@/components/loading";
import { CardsSkeleton } from "@/components/skeletons";
import {
  CreateAppointmentModal,
  UpdateAppointmentModal,
  AppointmentDetailsModal,
  AppointmentActionModal,
} from "@/components/modals/appointments";
import { getAppointments, rescheduleAppointment } from "./requests";
import {
  paymentLabels,
  type AppointmentSummary,
  type Appointment,
} from "./schemas";
import {
  appointmentDate,
  localDate,
  money,
  normalize,
} from "@/features/shared/format";
import { useSession } from "@/features/session/session.client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";

const AppointmentCalendar = dynamic(
  () =>
    import("./appointment-calendar").then(
      (module) => module.AppointmentCalendar,
    ),
  {
    loading: () => (
      <div className="bg-base-100 border-base-300 rounded-box flex min-h-0 flex-1 items-center justify-center border">
        <LoadingSpinner aria-label="Cargando calendario" />
      </div>
    ),
  },
);

function AppointmentActions({
  appointment,
  canWrite,
  isAdmin,
  onView,
  onEdit,
  onAction,
}: {
  appointment: AppointmentSummary;
  canWrite: boolean;
  isAdmin: boolean;
  onView?: () => void;
  onEdit: () => void;
  onAction: (action: "complete" | "reopen" | "delete") => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      {onView ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square"
          title="Ver detalle"
          aria-label="Ver detalle del turno"
          onClick={onView}
        >
          <EyeIcon className="size-4" />
        </button>
      ) : null}
      <ActionButtons
        onEdit={
          canWrite && appointment.state === "SCHEDULED" ? onEdit : undefined
        }
        onDelete={
          isAdmin && appointment.state === "SCHEDULED"
            ? () => onAction("delete")
            : undefined
        }
      />
      {isAdmin ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-square text-success"
          title={
            appointment.state === "SCHEDULED" ? "Completar" : "Volver a agendar"
          }
          aria-label={
            appointment.state === "SCHEDULED"
              ? "Completar turno"
              : "Volver a agendar turno"
          }
          onClick={() =>
            onAction(appointment.state === "SCHEDULED" ? "complete" : "reopen")
          }
        >
          {appointment.state === "SCHEDULED" ? (
            <CheckIcon className="size-4" />
          ) : (
            <RotateCcwIcon className="size-4" />
          )}
        </button>
      ) : null}
    </div>
  );
}
export function AppointmentsPage({ view }: { view: "table" | "agenda" }) {
  const queryClient = useQueryClient();
  const session = useSession();
  const orgId = session.data?.orgId;
  const [display, setDisplay] = useState<"calendar" | "table">("calendar");
  const [calendar, setCalendar] = useState<CalendarState>(() => ({
    view: "month",
    date: localDate(),
  }));
  const showCalendar = view === "table" && display === "calendar";
  const [createDatetime, setCreateDatetime] = useState<string>();
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<DataPerPage>(10);
  const [range, setRange] = useState(() => ({
    from: localDate(),
    to: localDate(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    ),
  }));
  const [state, setState] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [updateId, setUpdateId] = useState<number>();
  const [detailId, setDetailId] = useState<number>();
  const [action, setAction] = useState<{
    appointment: AppointmentSummary;
    type: "complete" | "reopen" | "delete";
  }>();
  const visibleRange = showCalendar ? calendarRange(calendar) : range;
  // API boundaries are organization-local; padding covers device/organization timezone differences.
  const requestRange = showCalendar
    ? {
        from: calendarDay(addDays(calendarDate(visibleRange.from), -2)),
        to: calendarDay(addDays(calendarDate(visibleRange.to), 2)),
      }
    : range;
  const days =
    (new Date(range.to + "T12:00:00").getTime() -
      new Date(range.from + "T12:00:00").getTime()) /
    86400000;
  const validRange =
    showCalendar ||
    (!!range.from &&
      !!range.to &&
      Number.isFinite(days) &&
      days >= 0 &&
      days < 62);
  const appointmentsQuery = useQuery<
    Awaited<ReturnType<typeof getAppointments>>,
    ServerError
  >({
    queryKey: [
      "appointments",
      orgId,
      showCalendar ? "calendar" : "list",
      requestRange.from,
      requestRange.to,
      state,
      maintenance,
    ],
    queryFn: () =>
      getAppointments({
        ...requestRange,
        state:
          state === "SCHEDULED" || state === "COMPLETED" ? state : undefined,
        maintenance: maintenance ? maintenance === "true" : undefined,
      }),
    enabled: !!orgId && validRange,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const canWrite =
    session.data?.role === "ADMIN" || session.data?.role === "RECEPTIONIST";
  const isAdmin = session.data?.role === "ADMIN";
  const moveMutation = useMutation<
    Appointment,
    ServerError,
    { id: number; datetime: string }
  >({
    mutationFn: ({ id, datetime }) => rescheduleAppointment(id, datetime),
    onSuccess: () => {
      toast.success("Turno reprogramado");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "No se pudo reprogramar el turno."));
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["appointments", orgId] }),
  });
  const records =
    appointmentsQuery.data
      ?.map((item) =>
        moveMutation.isPending && moveMutation.variables?.id === item.id
          ? { ...item, datetime: moveMutation.variables.datetime }
          : item,
      )
      .filter(
        (item) =>
          !showCalendar ||
          (localDate(new Date(item.datetime)) >= visibleRange.from &&
            localDate(new Date(item.datetime)) <= visibleRange.to),
      )
      .filter((item) =>
        normalize(
          `${item.petName} ${item.clientName} ${item.services.join(" ")}`,
        ).includes(normalize(filter)),
      )
      .sort(
        (a, b) =>
          new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
      ) ?? [];
  function moveAppointment(id: number, target: CalendarTarget) {
    if (!canWrite || moveMutation.isPending) return;
    const appointment = records.find((item) => item.id === id);
    if (!appointment || appointment.state !== "SCHEDULED") return;
    const datetime = movedAppointmentTime(appointment.datetime, target);
    if (!datetime) {
      toast.error(
        "Ese horario no existe en tu zona horaria. Elegí otro horario.",
      );
      return;
    }
    if (
      new Date(datetime).getTime() === new Date(appointment.datetime).getTime()
    )
      return;
    moveMutation.mutate({ id, datetime });
  }
  const selectedAppointment = records.find((item) => item.id === detailId);
  const groups = Object.groupBy(records, (item) => item.datetime.slice(0, 10));
  const columns: TableColumn<AppointmentSummary>[] = [
    {
      label: "Fecha y hora",
      key: "datetime",
      render: (item) => appointmentDate(item.datetime),
      width: "190px",
    },
    {
      label: "Mascota / Responsable",
      key: "petName",
      render: (item) => (
        <div>
          <p className="font-semibold">{item.petName}</p>
          <p className="text-base-content/55 text-xs">{item.clientName}</p>
        </div>
      ),
      width: "1.5fr",
    },
    {
      label: "Servicios",
      key: "services",
      render: (item) => item.services.join(", "),
      width: "1.5fr",
    },
    {
      label: "Estado",
      key: "state",
      render: (item) => (
        <span
          className={
            item.state === "COMPLETED"
              ? "badge badge-sm badge-success badge-outline"
              : "badge badge-sm badge-warning badge-outline"
          }
        >
          {item.state === "COMPLETED" ? "Completado" : "Agendado"}
        </span>
      ),
      width: "120px",
    },
    {
      label: "Total",
      key: "netPrice",
      render: (item) => money(item.netPrice),
      width: "120px",
    },
    {
      label: "Pago",
      key: "paymentMethod",
      render: (item) =>
        item.paymentMethod
          ? paymentLabels[item.paymentMethod]
          : "Sin registrar",
      width: "130px",
    },
    {
      label: "Acciones",
      key: "actions",
      sortable: false,
      render: (item) => (
        <AppointmentActions
          appointment={item}
          canWrite={canWrite}
          isAdmin={isAdmin}
          onView={() => setDetailId(item.id)}
          onEdit={() => setUpdateId(item.id)}
          onAction={(type) => setAction({ appointment: item, type })}
        />
      ),
      width: "170px",
    },
  ];
  return (
    <AppearGroup className="grid-page flex h-full min-h-0 min-w-0 flex-col gap-4 overflow-hidden p-4 sm:p-6 lg:p-8">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <GeneralHeader
            title={view === "agenda" ? "Agenda" : "Turnos"}
            Svg={view === "agenda" ? CalendarDaysIcon : ScissorsIcon}
            count={records.length}
            description={
              view === "agenda"
                ? "La próxima visita empieza con una agenda clara."
                : "Consultá el detalle, los cuidados y el precio de cada visita."
            }
            button={
              canWrite && !showCalendar
                ? {
                    text: "Agregar turno",
                    onClick: () => {
                      setCreateDatetime(undefined);
                      setIsCreateModalOpen(true);
                    },
                  }
                : undefined
            }
          />
        </div>
        {view === "table" ? (
          <AppearItem
            aria-label="Presentación de turnos"
            className="border-base-300 bg-base-100 flex shrink-0 gap-1 rounded-sm border p-1"
          >
            {(["calendar", "table"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={display === value}
                disabled={moveMutation.isPending}
                className={cn(
                  "rounded-sm px-3 py-1.5 text-xs font-medium",
                  display === value
                    ? "bg-neutral text-neutral-content"
                    : "text-base-content/70 hover:bg-secondary/20",
                )}
                onClick={() => setDisplay(value)}
              >
                {value === "calendar" ? "Calendario" : "Tabla"}
              </button>
            ))}
          </AppearItem>
        ) : null}
      </div>
      <SearchToolbar
        value={filter}
        onChange={(v) => {
          setFilter(v);
          setPage(1);
        }}
        placeholder="Buscar mascota, cliente o servicio…"
      >
        {!showCalendar ? (
          <>
            <label className="text-base-content/70 flex items-center gap-2 text-xs">
              Desde
              <InputDate
                value={range.from}
                onChange={(from) => {
                  setRange({ ...range, from });
                  setPage(1);
                }}
              />
            </label>
            <label className="text-base-content/70 flex items-center gap-2 text-xs">
              Hasta
              <InputDate
                value={range.to}
                onChange={(to) => {
                  setRange({ ...range, to });
                  setPage(1);
                }}
              />
            </label>
          </>
        ) : null}
        <SelectInput
          aria-label="Filtrar estado del turno"
          searchable={false}
          size="sm"
          className="min-w-0 flex-1 sm:w-44 sm:flex-none"
          value={state}
          onValueChange={(value) => {
            setState(value);
            setPage(1);
          }}
          options={[
            { value: "", label: "Todos los estados" },
            { value: "SCHEDULED", label: "Agendados" },
            { value: "COMPLETED", label: "Completados" },
          ]}
        />
        <SelectInput
          aria-label="Filtrar mantenimiento"
          size="sm"
          className="min-w-0 flex-1 sm:w-44 sm:flex-none"
          value={maintenance}
          onValueChange={(value) => {
            setMaintenance(value);
            setPage(1);
          }}
          options={[
            { value: "", label: "Todas las visitas" },
            { value: "true", label: "Mantenimiento" },
            { value: "false", label: "Sin mantenimiento" },
          ]}
        />
      </SearchToolbar>
      {!showCalendar ? (
        <p className="text-base-content/70 shrink-0 text-xs">
          El rango se interpreta en la zona horaria de la peluquería (máximo 62
          días). Las horas se muestran en este dispositivo.
        </p>
      ) : null}
      {showCalendar && moveMutation.isError ? (
        <ErrorAlert
          message={getErrorMessage(
            moveMutation.error,
            "No se pudo reprogramar el turno.",
          )}
          onClick={() => moveMutation.reset()}
        />
      ) : null}
      {showCalendar ? (
        <AppearItem className="flex min-h-0 flex-1 flex-col">
          <AppointmentCalendar
            state={calendar}
            onStateChange={setCalendar}
            appointments={records}
            canWrite={canWrite}
            pendingId={
              moveMutation.isPending ? moveMutation.variables?.id : undefined
            }
            loading={appointmentsQuery.isPending}
            error={
              appointmentsQuery.isError ? (
                <ErrorInformer
                  message={getErrorMessage(appointmentsQuery.error)}
                  retry={() => {
                    void appointmentsQuery.refetch();
                  }}
                />
              ) : undefined
            }
            onCreate={(datetime) => {
              setCreateDatetime(datetime);
              setIsCreateModalOpen(true);
            }}
            onView={setDetailId}
            onEdit={setUpdateId}
            onMove={moveAppointment}
          />
        </AppearItem>
      ) : !validRange ? (
        <ErrorInformer message="Seleccioná un rango válido de hasta 62 días." />
      ) : view === "table" ? (
        <AppearItem className="min-h-0 flex-1 overflow-hidden">
          <TableWorking<AppointmentSummary>
            ariaLabel="Tabla de turnos"
            itemLabel="turnos"
            columns={columns}
            searchInput={filter}
            data={records.slice((page - 1) * limit, page * limit)}
            loading={appointmentsQuery.isPending}
            error={appointmentsQuery.error}
            pagination={{
              page,
              limit,
              total: records.length,
              setPage,
              changeLimit: (v) => {
                setLimit(v);
                setPage(1);
              },
              showPageSize: true,
            }}
            onAdd={canWrite ? () => setIsCreateModalOpen(true) : undefined}
          />
        </AppearItem>
      ) : appointmentsQuery.isPending ? (
        <CardsSkeleton
          count={4}
          className="min-h-0 flex-1 overflow-hidden xl:grid-cols-2"
        />
      ) : appointmentsQuery.isError ? (
        <ErrorInformer
          message={getErrorMessage(appointmentsQuery.error)}
          retry={() => {
            void appointmentsQuery.refetch();
          }}
        />
      ) : records.length ? (
        <AppearList className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
          {Object.entries(groups).map(([day, appointments]) => (
            <section key={day}>
              <h2 className="text-base-content/70 mb-3 text-sm font-bold">
                {new Date(day + "T12:00:00").toLocaleDateString("es-AR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </h2>
              <div className="grid gap-3 xl:grid-cols-2">
                {appointments?.map((item) => (
                  <AppearArticle
                    key={item.id}
                    className="border-base-300 bg-base-100 rounded-box flex flex-col gap-4 border p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-primary-ink font-mono-ui mb-1 text-xs">
                          {new Date(item.datetime).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <h3 className="text-lg font-bold">{item.petName}</h3>
                        <p className="text-base-content/70 text-xs">
                          {item.clientName}
                        </p>
                      </div>
                      <span
                        className={
                          item.state === "COMPLETED"
                            ? "badge badge-success badge-outline badge-sm"
                            : "badge badge-warning badge-outline badge-sm"
                        }
                      >
                        {item.state === "COMPLETED" ? "Completado" : "Agendado"}
                      </span>
                    </div>
                    <p className="text-base-content/70 text-sm">
                      {item.services.join(" · ")}
                    </p>
                    {item.maintenance ? (
                      <span className="text-success text-xs">
                        Visita de mantenimiento
                      </span>
                    ) : null}
                    <div className="flex items-center justify-between border-t pt-3">
                      <strong>{money(item.netPrice)}</strong>
                      <AppointmentActions
                        appointment={item}
                        canWrite={canWrite}
                        isAdmin={isAdmin}
                        onView={() => setDetailId(item.id)}
                        onEdit={() => setUpdateId(item.id)}
                        onAction={(type) =>
                          setAction({ appointment: item, type })
                        }
                      />
                    </div>
                  </AppearArticle>
                ))}
              </div>
            </section>
          ))}
        </AppearList>
      ) : (
        <div className="bg-base-100 border-base-300 rounded-box border p-10 text-center">
          <CalendarDaysIcon className="text-primary/60 mx-auto mb-3 size-10" />
          <h2 className="font-bold">
            Una agenda con espacio para nuevas visitas
          </h2>
          <p className="text-base-content/70 mt-2 text-sm">
            No hay turnos que coincidan con los filtros.
          </p>
        </div>
      )}
      {isCreateModalOpen ? (
        <CreateAppointmentModal
          initialDatetime={createDatetime}
          isOpen
          onClose={() => setIsCreateModalOpen(false)}
        />
      ) : null}
      {updateId ? (
        <UpdateAppointmentModal
          isOpen
          id={updateId}
          onClose={() => setUpdateId(undefined)}
        />
      ) : null}
      {detailId ? (
        <AppointmentDetailsModal
          isOpen
          id={detailId}
          onClose={() => setDetailId(undefined)}
        >
          {selectedAppointment ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-base-content/55 text-xs">
                Acciones del turno
              </span>
              <AppointmentActions
                appointment={selectedAppointment}
                canWrite={canWrite}
                isAdmin={isAdmin}
                onEdit={() => {
                  setDetailId(undefined);
                  setUpdateId(selectedAppointment.id);
                }}
                onAction={(type) => {
                  setDetailId(undefined);
                  setAction({ appointment: selectedAppointment, type });
                }}
              />
            </div>
          ) : null}
        </AppointmentDetailsModal>
      ) : null}
      {action ? (
        <AppointmentActionModal
          isOpen
          appointment={action.appointment}
          action={action.type}
          onClose={() => setAction(undefined)}
        />
      ) : null}
    </AppearGroup>
  );
}
function InputDate({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <DatePickerPopover
      value={value}
      onChange={onChange}
      allowClear={false}
      className="h-8 w-36 text-xs"
    />
  );
}
