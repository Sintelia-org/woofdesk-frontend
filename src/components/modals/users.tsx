"use client";
import { FormSelect } from "@/components/select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Modal, AlertWithMutationModal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { ErrorAlert } from "@/components/forms";
import { FormActions } from "./form-actions";
import {
  userInputSchema,
  userCreateSchema,
  userSchema,
  type User,
  type UserCreateInput,
} from "@/features/users/schemas";
import { passwordSchema } from "@/features/shared/schemas";
import { getRoles } from "@/features/roles/requests";
import { roleLabels } from "@/features/shared/format";
import { useSession } from "@/features/session/session.client";
import { apiClient } from "@/lib/http/client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";

const editFormSchema = userInputSchema.extend({ password: z.string() });
export function UserModal({
  user,
  isOpen,
  onClose,
}: {
  user?: User;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const rolesQuery = useQuery<
    Awaited<ReturnType<typeof getRoles>>,
    ServerError
  >({
    queryKey: ["roles", session.data?.orgId],
    queryFn: () => getRoles(),
    retry: false,
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UserCreateInput>({
    resolver: zodResolver(user ? editFormSchema : userCreateSchema),
    defaultValues: {
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      role: user?.role ?? "",
      password: "",
    },
  });
  const mutation = useMutation<User, ServerError, UserCreateInput>({
    mutationFn: async (data) => {
      const payload = user
        ? userInputSchema.parse(data)
        : userCreateSchema.parse(data);
      const response = await apiClient.request({
        method: user ? "PUT" : "POST",
        url: user ? `/api/users/${user.id}` : "/api/users",
        data: payload,
      });
      return userSchema.parse(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", session.data?.orgId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["employees", session.data?.orgId],
      });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Usuario guardado");
      onClose();
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title={user ? "Editar usuario" : "Agregar usuario"}
      footer={
        <FormActions
          form="user-form"
          pending={mutation.isPending}
          error={mutation.error}
          onClose={onClose}
        />
      }
    >
      <form
        id="user-form"
        className="modal-form grid gap-4 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        <Field
          htmlFor="user-name"
          label="Nombre"
          required
          error={errors.name?.message}
        >
          <Input id="user-name" {...register("name")} />
        </Field>
        <Field
          htmlFor="user-email"
          label="Correo electrónico"
          required
          error={errors.email?.message}
        >
          <Input
            id="user-email"
            type="email"
            autoComplete="off"
            {...register("email")}
          />
        </Field>
        <Field
          htmlFor="user-phone"
          label="Teléfono"
          error={errors.phone?.message}
        >
          <Input id="user-phone" type="tel" {...register("phone")} />
        </Field>
        <Field
          htmlFor="user-role"
          label="Rol"
          required
          error={errors.role?.message}
        >
          <FormSelect
            id="user-role"
            control={control}
            name="role"
            disabled={rolesQuery.isPending}
            placeholder="Seleccionar rol"
            options={
              rolesQuery.data?.map((role) => ({
                value: role.name,
                label: roleLabels[role.name] ?? role.name,
              })) ?? []
            }
          />
        </Field>
        {!user ? (
          <Field
            htmlFor="user-password"
            label="Contraseña inicial"
            required
            error={errors.password?.message}
          >
            <Input
              id="user-password"
              type="password"
              autoComplete="new-password"
              {...register("password")}
            />
          </Field>
        ) : null}
        {rolesQuery.isError ? (
          <ErrorAlert message={getErrorMessage(rolesQuery.error)} />
        ) : null}
      </form>
    </Modal>
  );
}
export function ToggleUserModal({
  user,
  isOpen,
  onClose,
}: {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const mutation = useMutation<unknown, ServerError, number>({
    mutationFn: async (id) =>
      (
        await apiClient.post(
          `/api/users/${id}/${user.active ? "deactivate" : "activate"}`,
        )
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["users", session.data?.orgId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["employees", session.data?.orgId],
      });
      toast.success("Estado del usuario actualizado");
      onClose();
    },
  });
  return (
    <AlertWithMutationModal
      isOpen={isOpen}
      onClose={onClose}
      mutation={mutation}
      data={user.id}
      title={user.active ? "Desactivar usuario" : "Reactivar usuario"}
      description="Cambiar el acceso al sistema"
      buttonText={user.active ? "Desactivar" : "Reactivar"}
      type={user.active ? "warning" : "success"}
    >
      ¿Querés {user.active ? "desactivar" : "reactivar"} a{" "}
      <strong>{user.name}</strong>? El servidor impide desactivar tu propia
      cuenta y conservará al menos un administrador activo.
    </AlertWithMutationModal>
  );
}
const resetSchema = z.object({ newPassword: passwordSchema });
export function UserPasswordModal({
  user,
  isOpen,
  onClose,
}: {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "" },
  });
  const mutation = useMutation<void, ServerError, z.infer<typeof resetSchema>>({
    mutationFn: async (data) => {
      await apiClient.post(`/api/users/${user.id}/password`, data);
    },
    onSuccess: () => {
      toast.success("Contraseña actualizada");
      onClose();
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      locked={mutation.isPending}
      onClose={onClose}
      title="Asignar contraseña"
      footer={
        <FormActions
          form="admin-password-form"
          pending={mutation.isPending}
          error={mutation.error}
          onClose={onClose}
        />
      }
    >
      <form
        id="admin-password-form"
        className="modal-form grid gap-4"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        <p className="text-base-content/60 text-sm">
          Cuenta de {user.name}. La persona podrá cambiarla desde Mi cuenta.
        </p>
        <Field
          htmlFor="reset-user-password"
          label="Nueva contraseña"
          required
          error={errors.newPassword?.message}
        >
          <Input
            id="reset-user-password"
            type="password"
            autoComplete="new-password"
            {...register("newPassword")}
          />
        </Field>
      </form>
    </Modal>
  );
}
