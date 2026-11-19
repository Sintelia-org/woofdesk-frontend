"use client";

import axios from "axios";
import {
  AlertTriangleIcon,
  CircleAlertIcon,
  MonitorSmartphoneIcon,
  RotateCwIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ZodError, type ZodIssue } from "zod";

import { HangingSign } from "@/components/hanging-sign";
import { Button } from "@/components/shadcn/button";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/query";

const MAX_LISTED_ISSUES = 20;

const typeLabels: Record<string, string> = {
  string: "texto",
  number: "número",
  integer: "número entero",
  boolean: "verdadero/falso",
  object: "objeto",
  array: "lista",
  date: "fecha",
  null: "null",
  undefined: "nada",
};

function typeLabel(type: string) {
  return typeLabels[type] ?? type;
}

function errorSignLabel(error: unknown) {
  if (error instanceof ZodError) return "Datos inválidos";
  if (axios.isAxiosError(error)) {
    if (error.code === "ERR_NETWORK") return "Sin conexión";
    if (error.response?.status === 403) return "Sin permiso";
    if (error.response && error.response.status >= 500)
      return "Error del servidor";
  }
  return "Algo falló";
}

// "content.0.client.name" reads as content[0].client.name.
function issuePath(path: ZodIssue["path"]) {
  if (!path.length) return "(respuesta completa)";
  return path
    .map((segment, index) =>
      typeof segment === "number"
        ? `[${segment}]`
        : index === 0
          ? segment
          : `.${segment}`,
    )
    .join("");
}

function issueDescription(issue: ZodIssue) {
  switch (issue.code) {
    case "invalid_type":
      return issue.received === "undefined"
        ? `Falta el campo; se esperaba ${typeLabel(issue.expected)}.`
        : `Se esperaba ${typeLabel(issue.expected)} y llegó ${typeLabel(issue.received)}.`;
    case "invalid_enum_value":
      return `Llegó "${String(issue.received)}"; los valores permitidos son ${issue.options.join(", ")}.`;
    case "invalid_literal":
      return `Se esperaba ${JSON.stringify(issue.expected)}.`;
    case "invalid_string":
      return `El texto no tiene el formato esperado (${typeof issue.validation === "string" ? issue.validation : "patrón"}).`;
    default:
      return issue.message;
  }
}

function ZodIssueList({ issues }: { issues: ZodIssue[] }) {
  return (
    <div className="bg-base-200 rounded-field w-full max-w-2xl overflow-hidden text-left">
      <p className="border-base-300 border-b px-4 py-2.5 text-sm font-semibold">
        {issues.length === 1
          ? "1 campo no coincide con lo esperado"
          : `${issues.length} campos no coinciden con lo esperado`}
      </p>
      <ul className="divide-base-300 max-h-60 divide-y overflow-y-auto text-sm">
        {issues.slice(0, MAX_LISTED_ISSUES).map((issue, index) => (
          <li
            key={index}
            className="flex flex-col gap-1 px-4 py-2.5 sm:flex-row sm:gap-4"
          >
            <code className="text-primary-ink font-mono-ui shrink-0 text-xs break-all sm:w-56">
              {issuePath(issue.path)}
            </code>
            <span>{issueDescription(issue)}</span>
          </li>
        ))}
      </ul>
      {issues.length > MAX_LISTED_ISSUES ? (
        <p className="text-base-content/70 border-base-300 border-t px-4 py-2 text-xs">
          Y {issues.length - MAX_LISTED_ISSUES} más.
        </p>
      ) : null}
    </div>
  );
}

// View-level error: a red hanging sign, the cause and, when the server
// response failed schema validation, every rejected field.
export function ErrorState({
  error,
  retry,
  className,
}: {
  error: unknown;
  retry?: () => void;
  className?: string;
}) {
  const issues = error instanceof ZodError ? error.issues : [];
  return (
    <div
      role="alert"
      className={cn(
        "border-error/25 bg-base-100 rounded-box flex flex-col items-center gap-4 border p-8 text-center",
        className,
      )}
    >
      <HangingSign label={errorSignLabel(error)} tone="error" />
      <p className="mt-2 font-bold text-balance">
        {getErrorMessage(error, "No se pudo cargar la información.")}
      </p>
      {issues.length ? (
        <ZodIssueList issues={issues} />
      ) : (
        <p className="text-base-content/70 text-sm">
          Reintentá en unos segundos. Si sigue pasando, avisale al
          administrador.
        </p>
      )}
      {retry ? (
        <Button type="button" size="sm" onClick={retry}>
          <RotateCwIcon className="size-4" aria-hidden="true" />
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}

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
      <span className="flex-1">
        {message ??
          "No se pudo cargar la información. Reintentá en unos segundos."}
      </span>
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
    <div className="bg-base-200 fixed inset-0 z-100 flex flex-col items-center justify-center gap-6 px-6 text-center">
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
        {getErrorMessage(
          error,
          "No se pudo cargar la información. Reintentá en unos segundos.",
        )}
      </p>
    </div>
  );
}
