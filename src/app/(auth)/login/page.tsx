"use client";

import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useEffect, useState, useTransition } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ServerError } from "@/lib/types";
import { apiClient } from "@/lib/http/client";
import { RecoveryPasswordModal } from "@/components/modals/auth";
import { BubbleCluster, PawTrail } from "@/components/backdrop";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ErrorAlert, ErrorLabel } from "@/components/forms";
import { Button } from "@/components/shadcn/button";
import { LoadingScreen, RouteProgressBar } from "@/components/loading";
import { getErrorMessage } from "@/lib/query";
import { useSession } from "@/features/session/session.client";
import { loginResponseSchema } from "@/features/session/session.common";

type Input = z.infer<typeof inputSchema>;
const inputSchema = z.object({
  email: z.string().email({ message: "Escribe un correo electrónico válido" }),
  password: z
    .string()
    .min(8, { message: "La contraseña debe tener al menos 8 carácteres" }),
});

export default function LoginPage() {
  const session = useSession();

  const router = useRouter();
  const queryClient = useQueryClient();
  // The transition stays pending until the dashboard route commits, which is
  // what keeps the progress bar visible for the whole redirect.
  const [isRedirecting, startRedirect] = useTransition();
  useEffect(() => {
    if (!session.data) return;
    const dashboardHref = `/${session.data.orgId}/dashboard`;
    startRedirect(() => router.replace(dashboardHref));
  }, [session.data, router]);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRecoveryPasswordModalOpen, setIsRecoveryPasswordModalOpen] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Input>({
    resolver: zodResolver(inputSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation<
    z.infer<typeof loginResponseSchema>,
    ServerError,
    Input
  >({
    mutationFn: async (data) => {
      const response = await apiClient.post("/api/auth/login", data);
      return loginResponseSchema.parse(response.data);
    },
    onSuccess: async (result) => {
      queryClient.clear();
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      startRedirect(() => router.replace(`/${result.user.orgId}/dashboard`));
    },
  });
  const isSubmitting = mutation.isPending || isRedirecting;

  const onSubmit: SubmitHandler<Input> = (data) => mutation.mutate(data);

  const submitError = mutation.isError
    ? mutation.error.response?.status === 401
      ? "El correo o la contraseña son incorrectos."
      : getErrorMessage(
          mutation.error,
          "No se pudo iniciar sesión. Intentá nuevamente.",
        )
    : undefined;

  // The form only appears once /me confirms there is no session; an existing
  // session keeps the loading screen until the dashboard route commits.
  if (session.isPending) return <LoadingScreen />;
  if (session.data) return <LoadingScreen />;

  return (
    <section className="flex min-h-screen w-full items-stretch">
      {isRedirecting ? (
        <RouteProgressBar label="Redirigiendo al panel" />
      ) : null}
      <article className="bg-neutral relative hidden min-h-screen w-full max-w-xl flex-col justify-between overflow-hidden p-10 lg:flex">
        <Image
          src="/brand/woofdesk-logo-dark.webp"
          alt="WoofDesk"
          width={1820}
          height={356}
          priority
          className="relative h-10 w-auto self-start"
        />

        <div className="flex h-56 flex-col gap-6">
          <p className="text-primary text-sm font-semibold">
            Gestión para peluquerías caninas
          </p>

          <p className="text-5xl font-bold tracking-tighter text-balance text-white">
            Tu agenda, en orden. Tu equipo, más liviano.
          </p>

          <p className="tracking-wide text-white/70">
            Turnos, clientes y mascotas en un solo lugar, para que puedas
            enfocarte en brindar una mejor atención.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheckIcon className="text-success size-5 min-w-5" />
          <span className="text-sm text-white/70">
            Acceso seguro para tu equipo
          </span>
        </div>

        <BubbleCluster className="absolute top-8 right-6" />
        <PawTrail className="text-primary/15 absolute right-16 bottom-10" />
      </article>
      <form
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={isSubmitting}
        className="bg-base-100 relative flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-14 sm:px-10"
      >
        <div aria-hidden="true" className="awning absolute inset-x-0 top-0" />
        <div className="flex w-full max-w-sm flex-col gap-4">
          {/* The brand panel is hidden below lg, so the form carries the logo. */}
          <Image
            src="/brand/woofdesk-logo.webp"
            alt="WoofDesk"
            width={1820}
            height={356}
            priority
            className="mb-4 h-9 w-auto self-start lg:hidden"
          />
          <div className="flex w-full flex-col gap-2">
            <span className="text-neutral text-4xl font-bold tracking-tighter">
              Iniciar sesión
            </span>
            <span className="text-neutral/60 font-sans font-medium">
              Ingresá tus datos para acceder al sistema.
            </span>
          </div>

          <div className="flex w-full flex-col gap-1.5">
            <label htmlFor="email" className="text-neutral text-xs font-bold">
              Correo electrónico
            </label>
            <div className="input flex h-12 w-full items-center gap-2">
              <MailIcon className="text-neutral/70 size-5 min-w-5" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register("email")}
                placeholder="nombre@peluqueria.com"
                className="text-neutral/60 peer"
              />
            </div>
            <ErrorLabel message={errors.email?.message} />
          </div>

          <div className="flex w-full flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-neutral text-xs font-bold"
            >
              Contraseña
            </label>
            <div className="input flex h-12 w-full items-center gap-2">
              <LockIcon className="text-neutral/70 size-5 min-w-5" />
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                placeholder="***************"
                className="text-neutral/60 peer"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setIsPasswordVisible((visible) => !visible)}
                className="text-neutral/70 hover:text-neutral cursor-pointer"
                aria-label={
                  isPasswordVisible
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {isPasswordVisible ? (
                  <EyeOffIcon className="size-5 min-w-5" />
                ) : (
                  <EyeIcon className="size-5 min-w-5" />
                )}
              </button>
            </div>
            <ErrorLabel message={errors.password?.message} />
          </div>

          <ErrorAlert
            message={submitError}
            onClick={mutation.reset}
            className="h-auto min-h-12 shadow-none"
          />

          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={() => setIsRecoveryPasswordModalOpen(true)}
              className="text-primary cursor-pointer text-xs hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full text-white"
          >
            {isRedirecting
              ? "Redirigiendo..."
              : mutation.isPending
                ? "Ingresando..."
                : "Ingresar al sistema"}
          </Button>
        </div>
      </form>
      {isRecoveryPasswordModalOpen ? (
        <RecoveryPasswordModal
          isOpen
          onClose={() => setIsRecoveryPasswordModalOpen(false)}
        />
      ) : null}
    </section>
  );
}
