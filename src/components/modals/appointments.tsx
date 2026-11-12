"use client";
import { FormDateTimePicker } from "@/components/date";
import { FormSelect, SelectInput } from "@/components/select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { useState, type ReactNode } from "react";
import { PlusIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Modal, AlertWithMutationModal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { RecordSelect } from "@/components/record-select";
import { ErrorAlert } from "@/components/forms";
import { LoadingSpinner } from "@/components/loading";
import { FormActions } from "./form-actions";
import {
  appointmentInputSchema,
  appointmentSchema,
  paymentLabels,
  paymentMethodSchema,
  type Appointment,
  type AppointmentInput,
  type AppointmentSummary,
} from "@/features/appointments/schemas";
import { getAppointment } from "@/features/appointments/requests";
import { getServices } from "@/features/services/requests";
import { getPets } from "@/features/pets/requests";
import { money, appointmentDate } from "@/features/shared/format";
import { useSession } from "@/features/session/session.client";
import { apiClient } from "@/lib/http/client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";

async function loadPets(search: string, page: number) {
  const result = await getPets({ search, page, size: 20, active: true });
  return {
    options: result.content.map((pet) => ({
      id: pet.id,
      label: `${pet.name} · ${pet.clientName}`,
    })),
    total: result.totalElements,
  };
}
function toLocalInput(datetime: string) {
  const date = new Date(datetime);
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}
export function CreateAppointmentModal({
  isOpen,
  onClose,
  initialDatetime,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialDatetime?: string;
}) {
  return (
    <AppointmentForm
      isOpen={isOpen}
      onClose={onClose}
      initialDatetime={initialDatetime}
    />
  );
}
export function UpdateAppointmentModal({
  id,
  isOpen,
  onClose,
}: {
  id: number;
  isOpen: boolean;
  onClose: () => void;
}) {
  const session = useSession();
  const appointmentQuery = useQuery<
    Awaited<ReturnType<typeof getAppointment>>,
    ServerError
  >({
    queryKey: ["appointments", session.data?.orgId, "detail", id],
    queryFn: () => getAppointment(id),
    retry: false,
    refetchOnWindowFocus: false,
  });
  if (appointmentQuery.data)
    return (
      <AppointmentForm
        key={`${id}-${appointmentQuery.data.version}`}
        appointment={appointmentQuery.data}
        isOpen={isOpen}
        onClose={onClose}
      />
    );
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar turno">
      {appointmentQuery.isPending ? (
        <LoadingSpinner aria-label="Cargando turno" />
      ) : (
        <ErrorAlert message={getErrorMessage(appointmentQuery.error)} />
      )}
    </Modal>
  );
}
function AppointmentForm({
  appointment,
  isOpen,
  onClose,
  initialDatetime,
}: {
  appointment?: Appointment;
  initialDatetime?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const servicesQuery = useQuery<
    Awaited<ReturnType<typeof getServices>>,
    ServerError
  >({
    queryKey: ["services", session.data?.orgId, "all"],
    queryFn: () => getServices(),
    retry: false,
  });
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentInputSchema),
    defaultValues: {
      petId: appointment?.petId ?? 0,
      datetime: appointment
        ? toLocalInput(appointment.datetime)
        : (initialDatetime ?? ""),
      serviceIds: appointment?.services.map((s) => s.id) ?? [],
      grossPrice: appointment?.grossPrice ?? 0,
      maintenance: appointment?.maintenance ?? false,
      paymentMethod: appointment?.paymentMethod ?? null,
      info: appointment?.info ?? "",
      discounts: appointment?.discounts ?? [],
      surcharges: appointment?.surcharges ?? [],
      version: appointment?.version,
    },
  });
  const discounts = useFieldArray({
    control,
    name: "discounts",
    keyName: "formKey",
  });
  const surcharges = useFieldArray({
    control,
    name: "surcharges",
    keyName: "formKey",
  });
  const selectedServices = watch("serviceIds");
  const gross = watch("grossPrice");
  const discountValues = watch("discounts");
  const surchargeValues = watch("surcharges");
  const net =
    Number(gross || 0) -
    discountValues.reduce((sum, d) => sum + Number(d.amount || 0), 0) +
    surchargeValues.reduce((sum, s) => sum + Number(s.amount || 0), 0);
  const mutation = useMutation<Appointment, ServerError, AppointmentInput>({
    mutationFn: async (data) => {
      const response = await apiClient.request({
        method: appointment ? "PUT" : "POST",
        url: appointment
          ? `/api/appointments/${appointment.id}`
          : "/api/appointments",
        data: { ...data, datetime: new Date(data.datetime).toISOString() },
      });
      return appointmentSchema.parse(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointments", session.data?.orgId],
      });
      toast.success("Turno guardado");
      onClose();
    },
  });
  const isCompleted = appointment?.state === "COMPLETED";
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title={appointment ? "Editar turno" : "Agregar turno"}
      className="max-w-3xl"
      footer={
        <fieldset
          disabled={
            isCompleted || servicesQuery.isError || servicesQuery.isPending
          }
          className="col-span-full"
        >
          <FormActions
            form="appointment-form"
            pending={mutation.isPending}
            error={mutation.error}
            onClose={onClose}
          />
        </fieldset>
      }
    >
      <form
        id="appointment-form"
        className="modal-form grid gap-4 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        {isCompleted ? (
          <div className="bg-warning/10 text-warning col-span-full rounded-xl p-3 text-sm">
            El turno está completado. Un administrador debe volver a agendarlo
            antes de editar.
          </div>
        ) : null}
        <RecordSelect
          id="appointment-pet"
          label="Mascota"
          required
          entityName="mascotas"
          queryKey={["pets", session.data?.orgId, "picker"]}
          loadOptions={loadPets}
          value={watch("petId") || null}
          selectedLabel={
            appointment
              ? `${appointment.petName} · ${appointment.clientName}`
              : undefined
          }
          onChange={(id) =>
            setValue("petId", id ?? 0, { shouldValidate: true })
          }
          error={errors.petId?.message}
        />
        <Field
          htmlFor="appointment-datetime"
          label="Fecha y hora"
          required
          error={errors.datetime?.message}
        >
          <FormDateTimePicker
            id="appointment-datetime"
            control={control}
            name="datetime"
          />
        </Field>
        <fieldset className="col-span-full flex flex-col gap-2">
          <legend className="mb-2 text-sm font-medium">Servicios *</legend>
          {servicesQuery.isPending ? (
            <LoadingSpinner className="size-5" />
          ) : servicesQuery.isError ? (
            <ErrorAlert message={getErrorMessage(servicesQuery.error)} />
          ) : (
            <div className="flex flex-wrap gap-2">
              {servicesQuery.data?.map((service) => (
                <label
                  key={service.id}
                  className="border-secondary/30 flex cursor-pointer items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    className="checkbox checkbox-xs checkbox-primary"
                    checked={selectedServices.includes(service.id)}
                    onChange={(e) =>
                      setValue(
                        "serviceIds",
                        e.target.checked
                          ? [...selectedServices, service.id]
                          : selectedServices.filter((id) => id !== service.id),
                        { shouldValidate: true },
                      )
                    }
                  />
                  {service.name}
                </label>
              ))}
            </div>
          )}
          {servicesQuery.data?.length === 0 ? (
            <p className="text-base-content/60 text-sm">
              Un administrador debe agregar servicios al catálogo.
            </p>
          ) : null}
          {errors.serviceIds ? (
            <p className="text-error text-xs">{errors.serviceIds.message}</p>
          ) : null}
        </fieldset>
        <Field
          htmlFor="appointment-price"
          label="Precio bruto ($)"
          required
          error={errors.grossPrice?.message}
        >
          <Input
            id="appointment-price"
            type="number"
            step="0.01"
            min="0"
            {...register("grossPrice", { valueAsNumber: true })}
          />
        </Field>
        <Field htmlFor="appointment-payment" label="Forma de pago">
          <FormSelect
            id="appointment-payment"
            control={control}
            name="paymentMethod"
            parseValue={(value) => value || null}
            options={[
              { value: "", label: "Sin registrar" },
              ...Object.entries(paymentLabels).map(([value, label]) => ({
                value,
                label,
              })),
            ]}
          />
        </Field>
        <label className="col-span-full flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="checkbox checkbox-sm checkbox-primary"
            {...register("maintenance")}
          />
          Turno de mantenimiento (informativo)
        </label>
        {(["discounts", "surcharges"] as const).map((kind) => {
          const list = kind === "discounts" ? discounts : surcharges;
          const label = kind === "discounts" ? "Descuentos" : "Recargos";
          return (
            <fieldset
              key={kind}
              className="border-secondary/25 col-span-full space-y-2 rounded-xl border p-3"
            >
              <legend className="px-1 text-sm font-medium">{label}</legend>
              {list.fields.map((field, index) => (
                <div
                  key={field.formKey}
                  className="grid grid-cols-[minmax(0,1fr)_7rem_auto] gap-2"
                >
                  <div>
                    <Input
                      aria-label={`Concepto de ${label.toLowerCase()} ${index + 1}`}
                      placeholder="Concepto"
                      {...register(`${kind}.${index}.concept`)}
                    />
                    {errors[kind]?.[index]?.concept ? (
                      <p className="text-error text-xs">
                        {errors[kind]?.[index]?.concept?.message}
                      </p>
                    ) : null}
                  </div>
                  <div>
                    <Input
                      aria-label={`Monto de ${label.toLowerCase()} ${index + 1}`}
                      type="number"
                      step="0.01"
                      min="0.01"
                      {...register(`${kind}.${index}.amount`, {
                        valueAsNumber: true,
                      })}
                    />
                    {errors[kind]?.[index]?.amount ? (
                      <p className="text-error text-xs">
                        {errors[kind]?.[index]?.amount?.message}
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    aria-label="Quitar ajuste"
                    className="btn btn-ghost btn-square text-error"
                    onClick={() => list.remove(index)}
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => list.append({ concept: "", amount: 0 })}
              >
                <PlusIcon className="size-4" />
                Agregar {kind === "discounts" ? "descuento" : "recargo"}
              </button>
            </fieldset>
          );
        })}
        <div className="bg-accent/15 col-span-full flex items-center justify-between rounded-xl p-4">
          <span className="text-sm">Total estimado</span>
          <strong className="text-xl">{money(net)}</strong>
        </div>
        <Field
          className="col-span-full"
          htmlFor="appointment-info"
          label="Observaciones"
          error={errors.info?.message}
        >
          <Textarea id="appointment-info" {...register("info")} />
        </Field>
      </form>
    </Modal>
  );
}
export function AppointmentDetailsModal({
  id,
  isOpen,
  onClose,
  children,
}: {
  id: number;
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
}) {
  const session = useSession();
  const query = useQuery<
    Awaited<ReturnType<typeof getAppointment>>,
    ServerError
  >({
    queryKey: ["appointments", session.data?.orgId, "detail", id],
    queryFn: () => getAppointment(id),
    retry: false,
  });
  const appointment = query.data;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalle del turno"
      footer={children}
    >
      {query.isPending ? (
        <LoadingSpinner aria-label="Cargando detalle" />
      ) : query.isError ? (
        <ErrorAlert message={getErrorMessage(query.error)} />
      ) : appointment ? (
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-xl font-semibold">{appointment.petName}</h3>
            <p className="text-base-content/60 text-sm">
              {appointment.clientName} · {appointmentDate(appointment.datetime)}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {appointment.services.map((service) => (
              <span className="badge badge-outline" key={service.id}>
                {service.name}
              </span>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <dt>Estado</dt>
            <dd>
              {appointment.state === "COMPLETED" ? "Completado" : "Agendado"}
            </dd>
            <dt>Precio bruto</dt>
            <dd>{money(appointment.grossPrice)}</dd>
            {appointment.discounts.map((item) => (
              <div className="col-span-full flex justify-between" key={item.id}>
                <dt>Descuento: {item.concept}</dt>
                <dd>−{money(item.amount)}</dd>
              </div>
            ))}
            {appointment.surcharges.map((item) => (
              <div className="col-span-full flex justify-between" key={item.id}>
                <dt>Recargo: {item.concept}</dt>
                <dd>+{money(item.amount)}</dd>
              </div>
            ))}
            <dt className="font-semibold">Total</dt>
            <dd className="font-semibold">{money(appointment.netPrice)}</dd>
            <dt>Pago</dt>
            <dd>
              {appointment.paymentMethod
                ? paymentLabels[appointment.paymentMethod]
                : "Sin registrar"}
            </dd>
            <dt>Mantenimiento</dt>
            <dd>{appointment.maintenance ? "Sí" : "No"}</dd>
          </dl>
          <p className="text-base-content/65 text-sm whitespace-pre-wrap">
            {appointment.info || "Sin observaciones."}
          </p>
          <p className="text-base-content/45 border-t pt-3 text-xs">
            Creado por {appointment.createdBy}. Última edición:{" "}
            {appointment.updatedBy} · {appointmentDate(appointment.updatedAt)}
          </p>
        </div>
      ) : null}
    </Modal>
  );
}
export function AppointmentActionModal({
  appointment,
  action,
  isOpen,
  onClose,
}: {
  appointment: AppointmentSummary;
  action: "complete" | "reopen" | "delete";
  isOpen: boolean;
  onClose: () => void;
}) {
  const session = useSession();
  const queryClient = useQueryClient();
  const [payment, setPayment] = useState(appointment.paymentMethod ?? "");
  const titles = {
    complete: "Completar turno",
    reopen: "Volver a agendar",
    delete: "Eliminar turno",
  };
  const mutation = useMutation<unknown, ServerError, number>({
    mutationFn: async (id) => {
      if (action === "delete") {
        await apiClient.delete(`/api/appointments/${id}`);
        return;
      }
      return (
        await apiClient.post(
          `/api/appointments/${id}/${action}`,
          action === "complete"
            ? {
                paymentMethod: payment
                  ? paymentMethodSchema.parse(payment)
                  : null,
              }
            : undefined,
        )
      ).data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["appointments", session.data?.orgId],
      });
      toast.success("Turno actualizado");
      onClose();
    },
  });
  return (
    <AlertWithMutationModal
      isOpen={isOpen}
      onClose={onClose}
      mutation={mutation}
      data={appointment.id}
      title={titles[action]}
      description={titles[action]}
      buttonText={titles[action]}
      type={action === "delete" ? "danger" : "success"}
    >
      <div className="space-y-4">
        <p>
          <strong>{appointment.petName}</strong> ·{" "}
          {appointmentDate(appointment.datetime)}
        </p>
        <p>
          {action === "delete"
            ? "Se eliminará el turno con sus servicios, descuentos y recargos. Esta acción no se puede deshacer."
            : action === "reopen"
              ? "El turno volverá a estar agendado y permitirá editar sus datos."
              : "El turno quedará completado y no podrá editarse sin volver a agendarlo."}
        </p>
        {action === "complete" ? (
          <label className="flex flex-col gap-2 text-left text-sm">
            Forma de pago
            <SelectInput
              aria-label="Forma de pago"
              value={payment}
              onValueChange={setPayment}
              options={[
                { value: "", label: "Sin registrar" },
                ...Object.entries(paymentLabels).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
          </label>
        ) : null}
      </div>
    </AlertWithMutationModal>
  );
}
