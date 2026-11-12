"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal, AlertWithMutationModal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { FormActions } from "./form-actions";
import {
  clientInputSchema,
  clientSchema,
  type Client,
  type ClientInput,
} from "@/features/clients/schemas";
import { useSession } from "@/features/session/session.client";
import { apiClient } from "@/lib/http/client";
import type { ServerError } from "@/lib/types";

type Props = { isOpen: boolean; onClose: () => void; client?: Client };
export function ClientModal({ isOpen, onClose, client }: Props) {
  const queryClient = useQueryClient();
  const session = useSession();
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientInput>({
    resolver: zodResolver(clientInputSchema),
    defaultValues: {
      name: client?.name ?? "",
      phone: client?.phone ?? "",
      info: client?.info ?? "",
    },
  });
  const mutation = useMutation<Client, ServerError, ClientInput>({
    mutationFn: async (data) => {
      const response = await apiClient.request({
        method: client ? "PUT" : "POST",
        url: client ? `/api/clients/${client.id}` : "/api/clients",
        params: { confirmDuplicate },
        data,
      });
      return clientSchema.parse(response.data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["clients", session.data?.orgId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["pets", session.data?.orgId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["appointments", session.data?.orgId],
        }),
      ]);
      toast.success(client ? "Cliente actualizado" : "Cliente agregado");
      onClose();
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title={client ? "Editar cliente" : "Agregar cliente"}
      footer={
        <FormActions
          form="client-form"
          pending={mutation.isPending}
          error={mutation.error}
          onClose={onClose}
        />
      }
    >
      <form
        id="client-form"
        className="modal-form grid gap-4"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        <Field
          htmlFor="client-name"
          label="Nombre"
          required
          error={errors.name?.message}
        >
          <Input
            id="client-name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>
        <Field
          htmlFor="client-phone"
          label="Teléfono"
          required
          error={errors.phone?.message}
        >
          <Input
            id="client-phone"
            type="tel"
            aria-invalid={!!errors.phone}
            {...register("phone", {
              onChange: () => {
                setConfirmDuplicate(false);
                mutation.reset();
              },
            })}
          />
        </Field>
        <Field
          htmlFor="client-info"
          label="Información adicional"
          error={errors.info?.message}
        >
          <Textarea id="client-info" {...register("info")} />
        </Field>
        {mutation.error?.response?.data?.code === "DUPLICATE_PHONE" ? (
          <label className="border-warning/30 bg-warning/10 flex gap-3 rounded-xl border p-3 text-sm">
            <input
              type="checkbox"
              className="checkbox checkbox-sm"
              checked={confirmDuplicate}
              onChange={(e) => setConfirmDuplicate(e.target.checked)}
            />
            <span>
              Ya existe un cliente con este teléfono. Confirmo que quiero
              compartir el número y guardar igualmente.
            </span>
          </label>
        ) : null}
      </form>
    </Modal>
  );
}
export function ToggleClientModal({
  client,
  isOpen,
  onClose,
}: {
  client: Client;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const mutation = useMutation<unknown, ServerError, number>({
    mutationFn: async (id) =>
      (
        await apiClient.post(
          `/api/clients/${id}/${client.active ? "deactivate" : "activate"}`,
        )
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["clients", session.data?.orgId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["pets", session.data?.orgId],
      });
      toast.success("Estado del cliente actualizado");
      onClose();
    },
  });
  return (
    <AlertWithMutationModal
      isOpen={isOpen}
      onClose={onClose}
      mutation={mutation}
      data={client.id}
      title={client.active ? "Desactivar cliente" : "Reactivar cliente"}
      description="Cambiar el estado del cliente"
      buttonText={client.active ? "Desactivar" : "Reactivar"}
      type={client.active ? "warning" : "success"}
    >
      ¿Querés {client.active ? "desactivar" : "reactivar"} a{" "}
      <strong>{client.name}</strong>? Su historial se conserva.
    </AlertWithMutationModal>
  );
}
