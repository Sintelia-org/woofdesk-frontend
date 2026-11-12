"use client";
import { AppearItem } from "@/components/appear";
import { SelectInput } from "@/components/select-input";
import {
  EyeIcon,
  PencilIcon,
  PowerIcon,
  Trash2Icon,
  SearchIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { DebouncedInput } from "@/components/forms";
import { cn } from "@/lib/cn";
export function SearchToolbar({
  value,
  onChange,
  placeholder,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  children?: ReactNode;
}) {
  return (
    <AppearItem className="search-toolbar border-base-300 bg-base-100 rounded-box flex shrink-0 flex-wrap items-center gap-3 border p-3">
      <label className="input flex h-10 w-full items-center gap-2 sm:max-w-sm">
        <SearchIcon
          aria-hidden="true"
          className="text-base-content/45 size-4"
        />
        <span className="sr-only">{placeholder}</span>
        <DebouncedInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full min-w-0 text-sm"
        />
      </label>
      {children}
    </AppearItem>
  );
}
// Full class names per tone so Tailwind can detect them statically.
const statusDotTones = {
  success: { ring: "bg-success/10", dot: "bg-success" },
  error: { ring: "bg-error/10", dot: "bg-error" },
  neutral: { ring: "bg-neutral/10", dot: "bg-neutral" },
} as const;

function StatusDot({ tone }: { tone: keyof typeof statusDotTones }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-3.5 shrink-0 items-center justify-center rounded-full",
        statusDotTones[tone].ring,
      )}
    >
      <span className={cn("size-1.5 rounded-full", statusDotTones[tone].dot)} />
    </span>
  );
}

const activeFilterOptions = [
  { value: "all", label: "Todos", icon: <StatusDot tone="neutral" /> },
  { value: "true", label: "Activos", icon: <StatusDot tone="success" /> },
  { value: "false", label: "Inactivos", icon: <StatusDot tone="error" /> },
];

export function ActiveFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <SelectInput
        aria-label="Filtrar por estado"
        searchable={false}
        size="sm"
        className="h-10 w-36 text-sm"
        value={value}
        onValueChange={onChange}
        options={activeFilterOptions}
      />
    </div>
  );
}
export function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={
        active
          ? "badge badge-sm border-success/20 bg-success/10 text-success"
          : "badge badge-sm border-neutral/15 bg-neutral/5 text-neutral/55"
      }
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
export function ActionButtons({
  onView,
  onEdit,
  onToggle,
  active,
  onDelete,
}: {
  onView?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
  active?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      {onView ? (
        <button
          type="button"
          aria-label="Ver ficha"
          title="Ver ficha"
          className="btn btn-ghost btn-sm btn-square text-base-content/65"
          onClick={onView}
        >
          <EyeIcon className="size-4" />
        </button>
      ) : null}
      {onEdit ? (
        <button
          type="button"
          aria-label="Editar registro"
          title="Editar"
          className="btn btn-ghost btn-sm btn-square text-base-content/65 hover:bg-primary/15"
          onClick={onEdit}
        >
          <PencilIcon className="size-4" />
        </button>
      ) : null}
      {onToggle ? (
        <button
          type="button"
          aria-label={active ? "Desactivar registro" : "Reactivar registro"}
          title={active ? "Desactivar" : "Reactivar"}
          className="btn btn-ghost btn-sm btn-square text-warning"
          onClick={onToggle}
        >
          <PowerIcon className="size-4" />
        </button>
      ) : null}
      {onDelete ? (
        <button
          type="button"
          aria-label="Eliminar registro"
          title="Eliminar"
          className="btn btn-ghost btn-sm btn-square text-error"
          onClick={onDelete}
        >
          <Trash2Icon className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
