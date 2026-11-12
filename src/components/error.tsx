"use client";

import {
  AlertTriangleIcon,
  CircleAlertIcon,
  MonitorSmartphoneIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/query";

export function ErrorInformer({
  border = true,
  className,
  message,
  retry,
  svgClassName,
}: {
  border?: boolean;
  className?: string;
  message?: string;
  retry?: () => void;
  svgClassName?: string;
}) {
  return (
    <div
      className={cn(
        "text-error flex items-center justify-start gap-3 rounded-xl px-4 py-3",
        border && "border-error/35 bg-error/5 border",
        className,
      )}
      role="alert"
    >
      <AlertTriangleIcon
        aria-hidden="true"
        className={cn("size-9 min-w-9", svgClassName)}
      />
      <span className="flex-1">{message ?? "Ha ocurrido un error"}</span>
      {retry ? (
        <button
          className="btn btn-primary btn-sm"
          onClick={retry}
          type="button"
        >
          Reintentar
        </button>
      ) : null}
    </div>
  );
}

export function ErrorScreen({
  message = "No pudimos cargar esta pantalla.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="bg-base-200 fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 px-6 text-center">
      <ErrorInformer
        border={false}
        className="max-w-xl flex-col text-lg font-semibold"
        message={message}
        svgClassName="size-14"
      />
      <button
        className="btn btn-primary"
        onClick={onRetry ?? (() => router.refresh())}
        type="button"
      >
        Reintentar
      </button>
    </div>
  );
}

const hiddenAboveBreakpoint = {
  lg: "lg:hidden",
  md: "md:hidden",
  sm: "sm:hidden",
  xl: "xl:hidden",
} as const;

export function AlertScreen({
  maxMQ,
}: {
  maxMQ: keyof typeof hiddenAboveBreakpoint;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center",
        hiddenAboveBreakpoint[maxMQ],
      )}
    >
      <MonitorSmartphoneIcon className="text-base-content/65 size-16" />
      <p className="text-xl font-semibold">
        Esta pantalla no está disponible para dispositivos móviles
      </p>
      <p className="text-base-content/60 text-sm">
        Accedé desde una computadora.
      </p>
    </div>
  );
}

export function ErrorViewMessage({ error }: { error: unknown }) {
  return (
    <div className="text-error flex h-full w-full flex-col items-center justify-center gap-4 px-6 text-center">
      <CircleAlertIcon className="size-16 min-w-16" />
      <p className="max-w-xl text-lg">
        {getErrorMessage(error, "Ha ocurrido un error")}
      </p>
    </div>
  );
}
