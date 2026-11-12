"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { NavigationLink as Link } from "@/components/layout/route-navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Field } from "@/components/shadcn/field";
import { Input } from "@/components/shadcn/input";
import { ErrorAlert, LoadableButton, SuccessAlert } from "@/components/forms";
import { LoadingScreen } from "@/components/loading";
import { passwordSchema } from "@/features/shared/schemas";
import { apiClient } from "@/lib/http/client";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";
const schema = z
  .object({ newPassword: passwordSchema, confirmation: z.string() })
  .refine((data) => data.newPassword === data.confirmation, {
    path: ["confirmation"],
    message: "Las contraseñas no coinciden",
  });
function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmation: "" },
  });
  const mutation = useMutation<void, ServerError, z.infer<typeof schema>>({
    mutationFn: async (data) => {
      if (!token) throw new Error("Falta el enlace de recuperación");
      await apiClient.post("/api/auth/reset-password", {
        token,
        newPassword: data.newPassword,
      });
    },
  });
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="bg-base-100 border-secondary/30 w-full max-w-md rounded-2xl border p-6 shadow-sm">
        <h1 className="mb-5 text-2xl font-bold">Elegí una contraseña nueva</h1>
        {!token ? (
          <ErrorAlert message="El enlace está incompleto. Solicitá uno nuevo desde el login." />
        ) : mutation.isSuccess ? (
          <SuccessAlert
            showCheck
            message="Contraseña actualizada. Ya podés iniciar sesión."
          />
        ) : (
          <form
            className="modal-form flex flex-col gap-4"
            noValidate
            onSubmit={handleSubmit((data) => {
              if (!mutation.isPending) mutation.mutate(data);
            })}
          >
            <Field
              htmlFor="reset-password"
              label="Nueva contraseña"
              required
              error={errors.newPassword?.message}
            >
              <Input
                id="reset-password"
                type="password"
                autoComplete="new-password"
                {...register("newPassword")}
              />
            </Field>
            <Field
              htmlFor="reset-confirm"
              label="Repetir contraseña"
              required
              error={errors.confirmation?.message}
            >
              <Input
                id="reset-confirm"
                type="password"
                autoComplete="new-password"
                {...register("confirmation")}
              />
            </Field>
            <ErrorAlert
              message={
                mutation.error ? getErrorMessage(mutation.error) : undefined
              }
            />
            <LoadableButton
              className="btn-primary"
              isPending={mutation.isPending}
              type="submit"
            >
              Guardar contraseña
            </LoadableButton>
          </form>
        )}
        <Link
          href="/login"
          className="text-primary mt-5 inline-block text-sm hover:underline"
        >
          Volver a iniciar sesión
        </Link>
      </section>
    </main>
  );
}
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
