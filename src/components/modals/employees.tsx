"use client";
import { FormSelect } from "@/components/select-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Modal, AlertWithMutationModal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { RecordSelect } from "@/components/record-select";
import { ErrorAlert } from "@/components/forms";
import { FormActions } from "./form-actions";
import {
  employeeInputSchema,
  employeeSchema,
  type Employee,
  type EmployeeInput,
} from "@/features/employees/schemas";
import { getRoles } from "@/features/roles/requests";
import { getUsers } from "@/features/users/requests";
import { roleLabels } from "@/features/shared/format";
import { useSession } from "@/features/session/session.client";
import { apiClient } from "@/lib/http/client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";
async function loadUsers(search: string, page: number) {
  const result = await getUsers({ search, page, size: 20, active: true });
  return {
    options: result.content.map((user) => ({
      id: user.id,
      label: `${user.name} · ${user.email}`,
    })),
    total: result.totalElements,
  };
}
export function EmployeeModal({
  employee,
  isOpen,
  onClose,
}: {
  employee?: Employee;
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
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmployeeInput>({
    resolver: zodResolver(employeeInputSchema),
    defaultValues: {
      name: employee?.name ?? "",
      phone: employee?.phone ?? "",
      role: employee?.role ?? "",
      userId: employee?.userId ?? null,
    },
  });
  const mutation = useMutation<Employee, ServerError, EmployeeInput>({
    mutationFn: async (data) => {
      const response = await apiClient.request({
        method: employee ? "PUT" : "POST",
        url: employee ? `/api/employees/${employee.id}` : "/api/employees",
        data,
      });
      return employeeSchema.parse(response.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employees", session.data?.orgId],
      });
      toast.success("Empleado guardado");
      onClose();
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title={employee ? "Editar empleado" : "Agregar empleado"}
      footer={
        <FormActions
          form="employee-form"
          pending={mutation.isPending}
          error={mutation.error}
          onClose={onClose}
        />
      }
    >
      <form
        id="employee-form"
        className="modal-form grid gap-4 sm:grid-cols-2"
        noValidate
        onSubmit={handleSubmit((data) => {
          if (!mutation.isPending) mutation.mutate(data);
        })}
      >
        <Field
          htmlFor="employee-name"
          label="Nombre"
          required
          error={errors.name?.message}
        >
          <Input id="employee-name" {...register("name")} />
        </Field>
        <Field
          htmlFor="employee-phone"
          label="Teléfono"
          error={errors.phone?.message}
        >
          <Input id="employee-phone" type="tel" {...register("phone")} />
        </Field>
        <Field
          htmlFor="employee-role"
          label="Rol"
          required
          error={errors.role?.message}
        >
          <FormSelect
            id="employee-role"
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
        <RecordSelect
          id="employee-user"
          entityName="usuarios"
          label="Usuario vinculado (opcional)"
          queryKey={["users", session.data?.orgId, "picker"]}
          loadOptions={loadUsers}
          value={watch("userId")}
          selectedLabel={employee?.userEmail ?? undefined}
          onChange={(id) => setValue("userId", id, { shouldValidate: true })}
        />
        <p className="text-base-content/55 col-span-full text-xs">
          Un usuario puede estar vinculado a un solo empleado. Desactivar al
          empleado no desactiva su cuenta.
        </p>
        {rolesQuery.isError ? (
          <ErrorAlert message={getErrorMessage(rolesQuery.error)} />
        ) : null}
      </form>
    </Modal>
  );
}
export function ToggleEmployeeModal({
  employee,
  isOpen,
  onClose,
}: {
  employee: Employee;
  isOpen: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const session = useSession();
  const mutation = useMutation<unknown, ServerError, number>({
    mutationFn: async (id) =>
      (
        await apiClient.post(
          `/api/employees/${id}/${employee.active ? "deactivate" : "activate"}`,
        )
      ).data,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["employees", session.data?.orgId],
      });
      toast.success("Estado del empleado actualizado");
      onClose();
    },
  });
  return (
    <AlertWithMutationModal
      isOpen={isOpen}
      onClose={onClose}
      mutation={mutation}
      data={employee.id}
      title={employee.active ? "Desactivar empleado" : "Reactivar empleado"}
      description="Cambiar el estado del empleado"
      buttonText={employee.active ? "Desactivar" : "Reactivar"}
      type={employee.active ? "warning" : "success"}
    >
      ¿Querés {employee.active ? "desactivar" : "reactivar"} a{" "}
      <strong>{employee.name}</strong>?
    </AlertWithMutationModal>
  );
}
