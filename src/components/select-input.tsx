"use client";

import { useState, type ComponentProps, type ReactNode } from "react";
import { CheckIcon, ChevronDownIcon, InfoIcon, SearchIcon } from "lucide-react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { LoadingSpinner } from "@/components/loading";
import { cn } from "@/lib/cn";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: ReactNode;
};

export function PickerOptions({
  options,
  value,
  onSelect,
  entityName = "opciones",
  children,
}: {
  options: readonly SelectOption[];
  value: string;
  onSelect: (value: string) => void;
  entityName?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="listbox"
      aria-label={entityName}
      className="p-1"
      onKeyDown={(event) => {
        const buttons = Array.from(
          event.currentTarget.querySelectorAll<HTMLButtonElement>(
            'button[role="option"]:not(:disabled)',
          ),
        );
        const index = buttons.findIndex(
          (button) => button === document.activeElement,
        );
        let next: number;
        if (event.key === "ArrowDown")
          next = Math.min(index + 1, buttons.length - 1);
        else if (event.key === "ArrowUp") next = Math.max(index - 1, 0);
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = buttons.length - 1;
        else return;
        event.preventDefault();
        buttons[next]?.focus();
      }}
    >
      {options.length
        ? options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              disabled={option.disabled}
              className="picker-item flex w-full items-center justify-between gap-2 px-2.5 py-2 text-left"
              onClick={() => onSelect(option.value)}
            >
              <span className="flex min-w-0 items-center gap-2">
                {option.icon}
                <span>{option.label}</span>
              </span>
              {option.value === value ? (
                <CheckIcon
                  aria-hidden="true"
                  className="text-primary size-4 shrink-0"
                />
              ) : null}
            </button>
          ))
        : (children ?? (
            <p
              role="status"
              className="text-base-content/60 flex items-center gap-2 px-3 py-4 text-sm"
            >
              <InfoIcon
                aria-hidden="true"
                className="text-info size-4 shrink-0"
              />
              No hay {entityName} disponibles
            </p>
          ))}
    </div>
  );
}

export function PickerSearch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="border-secondary/25 relative shrink-0 border-b p-2">
      <SearchIcon
        aria-hidden="true"
        className="text-base-content/40 pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2"
      />
      <input
        type="search"
        autoComplete="off"
        aria-label={label}
        placeholder="Buscar…"
        value={value}
        className="input input-sm w-full pl-8"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            event.currentTarget.parentElement?.parentElement
              ?.querySelector<HTMLButtonElement>(
                'button[role="option"]:not(:disabled)',
              )
              ?.focus();
          }
        }}
      />
    </div>
  );
}

type SelectInputProps = Omit<
  ComponentProps<typeof PopoverTrigger>,
  "children" | "value" | "onChange" | "defaultValue"
> & {
  value: string | null;
  onValueChange: (value: string) => void;
  options: readonly SelectOption[];
  placeholder?: string;
  entityName?: string;
  size?: "sm" | "default";
  loading?: boolean;
  /** Short fixed lists (such as status filters) do not need a search box. */
  searchable?: boolean;
};

export function SelectInput({
  value,
  onValueChange,
  options,
  placeholder = "Seleccionar…",
  entityName = "opciones",
  size = "default",
  loading = false,
  searchable = true,
  className,
  ...props
}: SelectInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selected = options.find((option) => option.value === (value ?? ""));
  const normalize = (text: string) =>
    text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLocaleLowerCase("es");
  const filtered = options.filter((option) =>
    normalize(option.label).includes(normalize(search)),
  );
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setSearch("");
      }}
    >
      <PopoverTrigger
        type="button"
        className={cn(
          "picker-trigger group",
          size === "sm" && "h-8 px-2.5 text-xs",
          className,
        )}
        {...props}
      >
        <span className="flex min-w-0 items-center gap-2">
          {selected?.icon}
          <span
            className={cn(
              "min-w-0 truncate text-left",
              !selected && "text-base-content/50",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDownIcon
          aria-hidden="true"
          className="text-base-content/50 size-4 shrink-0 group-data-[state=open]:rotate-180"
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={0}
        collisionPadding={12}
        aria-label={props["aria-label"] ?? placeholder}
        className="picker-content z-[70] flex max-h-[min(20rem,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-t-none"
      >
        {searchable ? (
          <PickerSearch
            value={search}
            onChange={setSearch}
            label={`Buscar ${entityName}`}
          />
        ) : null}
        <div className="min-h-0 overflow-y-auto">
          <PickerOptions
            options={filtered}
            value={value ?? ""}
            entityName={entityName}
            onSelect={(next) => {
              onValueChange(next);
              setOpen(false);
              setSearch("");
            }}
          >
            {loading ? (
              <LoadingSpinner
                aria-label="Cargando opciones"
                className="m-3 size-5"
              />
            ) : undefined}
          </PickerOptions>
        </div>
      </PopoverContent>
    </Popover>
  );
}

type FormSelectProps<T extends FieldValues> = Omit<
  SelectInputProps,
  "value" | "onValueChange" | "name"
> & {
  control: Control<T>;
  name: FieldPath<T>;
  parseValue?: (value: string) => string | number | null;
  onValueChange?: (value: string) => void;
};

export function FormSelect<T extends FieldValues>({
  control,
  name,
  parseValue,
  onValueChange,
  ...props
}: FormSelectProps<T>) {
  const { field, fieldState } = useController({ control, name });
  return (
    <SelectInput
      {...props}
      name={field.name}
      ref={field.ref}
      onBlur={field.onBlur}
      aria-invalid={fieldState.invalid || props["aria-invalid"]}
      value={
        field.value === null || field.value === undefined
          ? ""
          : String(field.value)
      }
      onValueChange={(value) => {
        field.onChange(parseValue ? parseValue(value) : value);
        onValueChange?.(value);
      }}
    />
  );
}
