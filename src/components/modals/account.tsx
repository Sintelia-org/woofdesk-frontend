"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Modal, AlertWithMutationModal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { FormActions } from "./form-actions";
import { passwordSchema } from "@/features/shared/schemas";
import { apiClient } from "@/lib/http/client";
import type { ServerError } from "@/lib/types";
const changeSchema = z
  .object({
    currentPassword: z.string().min(1, "Ingresá tu contraseña actual"),
    newPassword: passwordSchema,
    confirmation: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmation, {
    path: ["confirmation"],
    message: "Las contraseñas no coinciden",
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    path: ["newPassword"],
    message: "Elegí una contraseña diferente a la actual",
  });
export function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof changeSchema>>({
    resolver: zodResolver(changeSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmation: "" },
  });
  const mutation = useMutation<void, ServerError, z.infer<typeof changeSchema>>(
    {
      mutationFn: async (data) => {
        await apiClient.post("/api/account/password", {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        });
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["session"] });
        toast.success(
          "Contraseña actualizada. Se cerraron las otras sesiones.",
        );
        onClose();
      },
    },
  );
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title="Cambiar mi contraseña"
      footer={
        <FormActions
          form="account-password-form"
          pending={mutation.isPending}
          error={mutation.error}
          onClose={onClose}
        />
      }
    >
      <form
        id="account-password-form"
        className="modal-form grid gap-4"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        <Field
          htmlFor="current-password"
          label="Contraseña actual"
          required
          error={errors.currentPassword?.message}
        >
          <Input
            id="current-password"
            type="password"
            autoComplete="current-password"
            {...register("currentPassword")}
          />
        </Field>
        <Field
          htmlFor="new-password"
          label="Nueva contraseña"
          required
          error={errors.newPassword?.message}
        >
          <Input
            id="new-password"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
          />
        </Field>
        <Field
          htmlFor="confirm-password"
          label="Repetir contraseña"
          required
          error={errors.confirmation?.message}
        >
          <Input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            {...register("confirmation")}
          />
        </Field>
        <p className="text-base-content/55 text-xs">
          Se cerrarán las sesiones de los demás dispositivos. Continuarás con
          acceso en este.
        </p>
      </form>
    </Modal>
  );
}
export function LogoutAllModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const mutation = useMutation<unknown, ServerError, void>({
    mutationFn: async () => {
      await apiClient.post("/api/account/logout-all");
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/login");
    },
  });
  return (
    <AlertWithMutationModal
      isOpen={isOpen}
      onClose={onClose}
      mutation={mutation}
      data={undefined}
      title="Cerrar todas las sesiones"
      description="Cerrar las sesiones en todos tus dispositivos"
      buttonText="Cerrar todas"
      type="warning"
    >
      Se cerrará también la sesión de este dispositivo. Vas a necesitar volver a
      iniciar sesión.
    </AlertWithMutationModal>
  );
}
