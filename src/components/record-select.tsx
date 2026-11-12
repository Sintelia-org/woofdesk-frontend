"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { ErrorAlert } from "@/components/forms";
import { LoadingSpinner } from "@/components/loading";
import { Field } from "@/components/shadcn/field";
import { PickerOptions, PickerSearch } from "@/components/select-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/popover";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";

export type RecordOption = { id: number; label: string };
export function RecordSelect({
  id,
  label,
  entityName,
  required = false,
  queryKey,
  loadOptions,
  value,
  onChange,
  selectedLabel,
  error,
}: {
  id: string;
  label: string;
  entityName: string;
  required?: boolean;
  queryKey: readonly unknown[];
  loadOptions: (
    search: string,
    page: number,
  ) => Promise<{ options: RecordOption[]; total: number }>;
  value: number | null;
  onChange: (value: number | null) => void;
  selectedLabel?: string;
  error?: string;
}) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selection, setSelection] = useState<RecordOption>();
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search), 250);
    return () => window.clearTimeout(timeout);
  }, [search]);
  const optionsQuery = useInfiniteQuery<
    Awaited<ReturnType<typeof loadOptions>>,
    ServerError
  >({
    queryKey: [...queryKey, debouncedSearch, "infinite"],
    queryFn: ({ pageParam }) => loadOptions(debouncedSearch, Number(pageParam)),
    initialPageParam: 0,
    getNextPageParam: (last, pages) =>
      last.options.length &&
      pages.reduce((count, page) => count + page.options.length, 0) < last.total
        ? pages.length
        : undefined,
    enabled: open,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { hasNextPage, isFetching, fetchNextPage } = optionsQuery;
  const options =
    optionsQuery.data?.pages.flatMap((page) => page.options) ?? [];
  // Fill short menus automatically; subsequent results load as the list scrolls.
  useEffect(() => {
    const list = listRef.current;
    if (
      open &&
      list &&
      hasNextPage &&
      !isFetching &&
      list.scrollHeight <= list.clientHeight
    ) {
      void fetchNextPage();
    }
  }, [open, options.length, hasNextPage, isFetching, fetchNextPage]);
  const selected =
    options.find((option) => option.id === value)?.label ||
    (selection?.id === value ? selection.label : undefined) ||
    selectedLabel;
  return (
    <Field htmlFor={id} label={label} required={required} error={error}>
      <div className="relative">
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) {
              setSearch("");
              setDebouncedSearch("");
            }
          }}
        >
          <PopoverTrigger
            id={id}
            type="button"
            aria-invalid={Boolean(error)}
            aria-required={required || undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="picker-trigger group"
          >
            <span
              className={
                value
                  ? "min-w-0 truncate"
                  : "text-base-content/50 min-w-0 truncate"
              }
            >
              {value ? selected || `Registro #${value}` : "Seleccionar…"}
            </span>
            <span className={!required && value ? "pr-7" : undefined}>
              <ChevronDownIcon
                aria-hidden="true"
                className="text-base-content/50 size-4 shrink-0 group-data-[state=open]:rotate-180"
              />
            </span>
          </PopoverTrigger>
          <PopoverContent
            aria-label={`Seleccionar ${label.toLowerCase()}`}
            align="start"
            sideOffset={0}
            collisionPadding={12}
            className="picker-content z-[70] flex max-h-[min(20rem,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-t-none"
          >
            <PickerSearch
              value={search}
              onChange={setSearch}
              label={`Buscar ${entityName}`}
            />
            <div
              ref={listRef}
              className="min-h-0 overflow-y-auto"
              onScroll={(event) => {
                const list = event.currentTarget;
                if (
                  hasNextPage &&
                  !isFetching &&
                  list.scrollHeight - list.scrollTop - list.clientHeight < 60
                )
                  void fetchNextPage();
              }}
            >
              {optionsQuery.isPending || search !== debouncedSearch ? (
                <LoadingSpinner
                  aria-label="Cargando opciones"
                  className="m-3 size-5"
                />
              ) : optionsQuery.isError && !options.length ? (
                <div className="p-2">
                  <ErrorAlert message={getErrorMessage(optionsQuery.error)} />
                  <button
                    className="btn btn-ghost btn-sm mt-2"
                    type="button"
                    onClick={() => void optionsQuery.refetch()}
                  >
                    Reintentar
                  </button>
                </div>
              ) : (
                <PickerOptions
                  options={options.map((option) => ({
                    value: String(option.id),
                    label: option.label,
                  }))}
                  value={String(value ?? "")}
                  entityName={entityName}
                  onSelect={(next) => {
                    setSelection(
                      options.find((option) => option.id === Number(next)),
                    );
                    onChange(Number(next));
                    setOpen(false);
                    setSearch("");
                    setDebouncedSearch("");
                  }}
                />
              )}
              {optionsQuery.isFetchingNextPage ? (
                <LoadingSpinner
                  aria-label="Cargando más opciones"
                  className="m-3 size-4"
                />
              ) : null}
              {optionsQuery.isFetchNextPageError ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm m-2"
                  onClick={() => void fetchNextPage()}
                >
                  Reintentar cargar opciones
                </button>
              ) : null}
            </div>
          </PopoverContent>
        </Popover>
        {!required && value ? (
          <button
            type="button"
            aria-label={`Quitar ${label.toLowerCase()}`}
            className="text-base-content/50 hover:text-base-content absolute top-1/2 right-2 -translate-y-1/2 rounded-sm p-1"
            onClick={() => {
              onChange(null);
              setSelection(undefined);
            }}
          >
            <XIcon aria-hidden="true" className="size-4" />
          </button>
        ) : null}
      </div>
    </Field>
  );
}
