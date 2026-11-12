"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { Textarea } from "@/components/shadcn/textarea";
import { FormActions } from "./form-actions";
import {
  serviceInputSchema,
  serviceSchema,
  type Service,
  type ServiceInput,
} from "@/features/services/schemas";
import { useSession } from "@/features/session/session.client";
import { apiClient } from "@/lib/http/client";
import type { ServerError } from "@/lib/types";
export function ServiceModal({
  service,
  isOpen,
  onClose,
}: {
  service?: Service;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceInputSchema),
    defaultValues: { name: service?.name ?? "", info: service?.info ?? "" },
  });
  const mutation = useMutation<Service, ServerError, ServiceInput>({
    mutationFn: async (data) => {
      const response = await apiClient.request({
        method: service ? "PUT" : "POST",
        url: service ? `/api/services/${service.id}` : "/api/services",
        data,
      });
      return serviceSchema.parse(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["services", session.data?.orgId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["appointments", session.data?.orgId],
      });
      toast.success("Servicio guardado");
      onClose();
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title={service ? "Editar servicio" : "Agregar servicio"}
      footer={
        <FormActions
          form="service-form"
          pending={mutation.isPending}
          error={mutation.error}
          onClose={onClose}
        />
      }
    >
      <form
        id="service-form"
        className="modal-form grid gap-4"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        <Field
          htmlFor="service-name"
          label="Nombre"
          required
          error={errors.name?.message}
        >
          <Input id="service-name" {...register("name")} />
        </Field>
        <Field
          htmlFor="service-info"
          label="Descripción"
          error={errors.info?.message}
        >
          <Textarea id="service-info" {...register("info")} />
        </Field>
        <p className="text-base-content/55 text-xs">
          El precio se define en cada turno. Los servicios no se eliminan ni
          desactivan.
        </p>
      </form>
    </Modal>
  );
}
