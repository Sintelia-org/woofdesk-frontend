"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Modal } from "@/components/modal";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { SuccessAlert } from "@/components/forms";
import { FormActions } from "./form-actions";
import { apiClient } from "@/lib/http/client";
import type { ServerError } from "@/lib/types";
import { CheckCircle2Icon, LockKeyholeOpenIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { LoadingSpinner } from "../loading";
const schema = z.object({
  email: z.string().trim().email("Ingresá un correo válido").max(150),
});
export function RecoveryPasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });
  const mutation = useMutation<void, ServerError, z.infer<typeof schema>>({
    mutationFn: async (data) => {
      await apiClient.post("/api/auth/forgot-password", data);
    },
  });
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      locked={mutation.isPending}
      title=""
      footer={
        !mutation.isSuccess ? (
          <FormActions
            form="recovery-form"
            pending={mutation.isPending}
            error={mutation.error}
            onClose={onClose}
            label="Enviar enlace"
          />
        ) : null
      }
    >
      {mutation.isSuccess ? (
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2Icon className="text-success size-20 min-w-20" />
          <div className="text-success flex items-center justify-center gap-2.5 text-center text-balance">
            <span>
              Si el correo corresponde a una cuenta activa, recibirás un enlace
              para recuperar tu contraseña.
            </span>
          </div>

          <button onClick={onClose} className="btn btn-sm btn-neutral min-w-24">
            Cerrar
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="border-neutral/30 text-neutral/70 bg-neutral/10 flex items-center justify-center rounded-md p-2">
              <LockKeyholeOpenIcon className="size-10 min-w-10" />
            </div>
            <span className="text-lg font-medium">Recuperar contraseña</span>

            <p className="text-center text-sm text-balance">
              Ingrese el email con el que registró su cuenta. Le enviaremos un
              mail para que pueda recuperarla.
            </p>
          </div>
          <form
            id="recovery-form"
            className="modal-form grid gap-4"
            noValidate
            onSubmit={handleSubmit((data) => {
              if (!mutation.isPending) mutation.mutate(data);
            })}
          >
            <Field
              htmlFor="recovery-email"
              label="Correo electrónico"
              required
              error={errors.email?.message}
            >
              <Input
                placeholder="Email de tu cuenta"
                id="recovery-email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
            </Field>
          </form>
        </div>
      )}
    </Modal>
  );
}
