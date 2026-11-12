"use client";

import { getTheme } from "@table-library/react-table-library/baseline";
import {
  HeaderCellSort,
  useSort,
} from "@table-library/react-table-library/sort";
import {
  Body,
  Cell,
  Header,
  HeaderCell,
  HeaderRow,
  Row,
  Table as TableLibrary,
  type TableNode,
} from "@table-library/react-table-library/table";
import { useTheme } from "@table-library/react-table-library/theme";
import {
  ArrowDownAZIcon,
  ArrowUpAZIcon,
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  GlobeLockIcon,
  PlusIcon,
  SearchXIcon,
  Table2Icon,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/shadcn/button";
import { SelectInput } from "@/components/select-input";
import { cn } from "@/lib/cn";
import { getErrorMessage } from "@/lib/query";
import type { ServerError } from "@/lib/types";

export const dataPerPage = [5, 10, 15, 20] as const;
export type DataPerPage = (typeof dataPerPage)[number];

const ACTIONS_COLUMN_KEY = "actions";
const HEADER_HEIGHT_PX = 46;

// A regular border would outline the dark header with a light edge, so the
// frame border is an overlay that starts below the header (top-11.5 = 46px).
const tableFrameClassName =
  "bg-base-100 after:border-base-300 relative h-full min-h-0 overflow-hidden rounded-sm after:pointer-events-none after:absolute after:inset-x-0 after:top-11.5 after:bottom-0 after:z-10 after:rounded-b-sm after:border after:border-t-0";

export type TableColumn<T> = {
  label: ReactNode;
  key: string;
  render?: (item: T) => ReactNode;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  resizable?: boolean;
  width?: string;
};

type PaginationProps = {
  page: number;
  limit: number;
  total: number;
  setPage: (page: number) => void;
  changeLimit?: (limit: DataPerPage) => void;
  showPageSize?: boolean;
};

type TableWorkingProps<T extends TableNode> = {
  data?: T[];
  loading: boolean;
  error: ServerError | null;
  searchInput?: string;
  emptyText?: string;
  itemLabel?: string;
  addButtonLabel?: string;
  columns: TableColumn<T>[];
  pagination?: PaginationProps;
  onAdd?: () => void;
  fixedLastColumn?: boolean;
  ariaLabel?: string;
};

type PaginationItem = number | "ellipsis-left" | "ellipsis-right";

function compareValues(left: unknown, right: unknown) {
  const leftIsEmpty = left === null || left === undefined;
  const rightIsEmpty = right === null || right === undefined;

  if (leftIsEmpty && rightIsEmpty) return 0;
  if (leftIsEmpty) return 1;
  if (rightIsEmpty) return -1;

  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  return String(left).localeCompare(String(right), "es", {
    numeric: true,
    sensitivity: "base",
  });
}

function getPaginationItems(page: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items: PaginationItem[] = [];
  const start = Math.max(1, Math.min(page - 1, totalPages - 2));
  const end = Math.min(totalPages, start + 2);

  if (start > 1) items.push("ellipsis-left");

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages) items.push("ellipsis-right");

  return items;
}

function TablePagination({
  pagination,
  itemLabel,
}: {
  pagination: PaginationProps;
  itemLabel: string;
}) {
  const totalPages = Math.max(
    1,
    Math.ceil(pagination.total / pagination.limit),
  );
  const safePage = Math.min(Math.max(pagination.page, 1), totalPages);
  const start =
    pagination.total === 0 ? 0 : (safePage - 1) * pagination.limit + 1;
  const end = Math.min(safePage * pagination.limit, pagination.total);
  const items = getPaginationItems(safePage, totalPages);

  return (
    <footer className="border-base-300 flex min-h-13 shrink-0 flex-col gap-3 border-t px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-base-content/60 text-[10px]">
          Mostrando {start}–{end} de {pagination.total} {itemLabel}
        </p>

        {pagination.showPageSize && pagination.changeLimit ? (
          <SelectInput
            value={String(pagination.limit)}
            onValueChange={(value) => {
              pagination.changeLimit?.(Number(value) as DataPerPage);
              pagination.setPage(1);
            }}
            size="sm"
            aria-label="Cantidad de filas por página"
            className="w-32"
            options={dataPerPage.map((value) => ({
              value: String(value),
              label: `${value} por página`,
            }))}
          />
        ) : null}
      </div>

      <nav
        aria-label={`Paginación de ${itemLabel}`}
        className="flex items-center gap-1"
      >
        <button
          type="button"
          aria-label="Página anterior"
          disabled={safePage === 1}
          onClick={() => pagination.setPage(safePage - 1)}
          className="border-base-300 bg-base-100 hover:border-primary/40 flex size-7.5 items-center justify-center rounded-sm border disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeftIcon className="size-3.5" aria-hidden="true" />
        </button>

        {items.map((item) =>
          typeof item === "number" ? (
            <button
              type="button"
              key={item}
              aria-label={`Página ${item}`}
              aria-current={item === safePage ? "page" : undefined}
              onClick={() => pagination.setPage(item)}
              className={cn(
                "flex size-7.5 items-center justify-center rounded-sm border font-mono text-[10px] font-semibold",
                item === safePage
                  ? "border-primary bg-primary text-primary-content"
                  : "border-base-300 bg-base-100 hover:border-primary/40",
              )}
            >
              {item}
            </button>
          ) : (
            <span
              key={item}
              aria-hidden="true"
              className="border-base-300 bg-base-100 flex size-7.5 items-center justify-center rounded-sm border font-mono text-[10px]"
            >
              …
            </span>
          ),
        )}

        <button
          type="button"
          aria-label="Página siguiente"
          disabled={safePage === totalPages}
          onClick={() => pagination.setPage(safePage + 1)}
          className="border-base-300 bg-base-100 hover:border-primary/40 flex size-7.5 items-center justify-center rounded-sm border disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRightIcon className="size-3.5" aria-hidden="true" />
        </button>
      </nav>
    </footer>
  );
}

function TableWorking<T extends TableNode>({
  data,
  loading,
  error,
  searchInput = "",
  emptyText = "No hay datos cargados todavía",
  itemLabel = "registros",
  addButtonLabel = "Agregar",
  columns,
  onAdd,
  pagination,
  fixedLastColumn = true,
  ariaLabel = "Tabla de datos",
}: TableWorkingProps<T>) {
  const gridTemplate = columns
    .map((column) =>
      column.width?.endsWith("fr")
        ? `minmax(150px, ${column.width})`
        : (column.width ?? "minmax(120px, 1fr)"),
    )
    .join(" ");
  const lastColumnWidth = columns.at(-1)?.width ?? "48px";

  const tableTheme = useTheme([
    getTheme(),
    {
      Table: `
        --data-table-library_grid-template-columns: ${gridTemplate};
        width: 100%;
        height: 100%;
        min-width: 0;
        
        align-content: start;
        overscroll-behavior: contain;

        /* The sticky header lives inside the scroll container, so the
           vertical track is offset to start below it. Chromium ignores
           ::-webkit-scrollbar while DaisyUI's inherited scrollbar-color is
           set; Firefox keeps that standard styling and a full-height track. */
        @supports selector(::-webkit-scrollbar) {
          scrollbar-color: auto;
        }

        &::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        &::-webkit-scrollbar-track {
          background-color: transparent;
        }

        &::-webkit-scrollbar-track:vertical {
          margin-top: ${HEADER_HEIGHT_PX}px;
        }

        &::-webkit-scrollbar-thumb {
          border: 2px solid transparent;
          border-radius: 9999px;
          background-color: color-mix(in oklab, var(--color-base-content) 35%, transparent);
          background-clip: padding-box;
        }

        &::-webkit-scrollbar-corner {
          background-color: transparent;
        }
      `,
      HeaderRow: `
        background-color: var(--color-neutral);
      `,
      HeaderCell: `
        position: sticky;
        top: 0;
        z-index: 4;
        background-color: var(--color-neutral);
        height: ${HEADER_HEIGHT_PX}px;
        padding: 0 14px;
        color: var(--color-neutral-content);
        font-size: 12px;
        font-weight: 650;
        letter-spacing: 0.01em;

        .resizer-handle {
          width: 1px;
          margin: 10px 0;
          background-color: color-mix(in oklab, var(--color-neutral-content) 25%, transparent);
        }

        ${
          fixedLastColumn
            ? `&:last-child {
                position: sticky;
                right: 0;
                z-index: 5;
                min-width: ${lastColumnWidth};
                background-color: var(--color-neutral);
              }`
            : ""
        }
      `,
      Row: `
        min-height: 56px;
        --table-row-background: var(--color-base-100);
        background-color: var(--table-row-background);

        &:nth-of-type(even) {
          --table-row-background: color-mix(in oklab, var(--color-base-100) 50%, var(--color-base-200));
        }

        &:hover {
          --table-row-background: color-mix(in oklab, var(--color-base-100) 88%, var(--color-primary));
          background-color: var(--table-row-background);
        }
      `,
      Cell: `
        min-height: 56px;
        padding: 0 14px;
        background-color: var(--table-row-background, var(--color-base-100));
        border-bottom: 1px solid var(--color-base-300);
        color: var(--color-base-content);

       

        &:last-child {
          border-right: 1px solid var(--color-base-300);
        }
        font-size: 13px;

        ${
          fixedLastColumn
            ? `&:last-child {
                position: sticky;
                right: 0;
                z-index: 2;
                width: ${lastColumnWidth};
                background-color: var(--table-row-background, var(--color-base-100));
              }`
            : ""
        }
      `,
    },
  ]);

  const sortFns = Object.fromEntries(
    columns
      .filter(
        (column) =>
          column.sortable !== false && column.key !== ACTIONS_COLUMN_KEY,
      )
      .map((column) => [
        column.key,
        (nodes: TableNode[]) =>
          [...nodes].sort((left, right) =>
            compareValues(left[column.key], right[column.key]),
          ),
      ]),
  );

  const sort = useSort(
    { nodes: data ?? [] },
    {},
    {
      sortFns,
      sortIcon: {
        margin: "6px",
        iconDefault: <ArrowUpDownIcon className="size-3" />,
        iconUp: <ArrowUpAZIcon className="size-3" />,
        iconDown: <ArrowDownAZIcon className="size-3" />,
      },
    },
  );

  if (loading) return <TableLoading />;
  if (error) return <TableError error={error} />;

  if (
    !data?.length &&
    pagination &&
    pagination.page > 1 &&
    pagination.total > 0
  ) {
    return (
      <div className="border-base-300 bg-base-100 rounded-2xl border p-6 text-center">
        <p className="text-base-content/60 mb-4 text-sm">
          Esta página ya no tiene registros.
        </p>
        <button
          className="btn btn-outline btn-sm"
          type="button"
          onClick={() => pagination.setPage(Math.max(1, pagination.page - 1))}
        >
          Volver a la página anterior
        </button>
      </div>
    );
  }

  if (!data?.length) {
    const hasSearch = searchInput.trim().length > 0;

    return (
      <div className="border-base-300 bg-base-100 flex h-full min-h-0 w-full flex-col items-center justify-center gap-4 rounded-2xl border p-8 text-center">
        {hasSearch ? (
          <SearchXIcon className="text-secondary size-14" aria-hidden="true" />
        ) : (
          <Table2Icon className="text-secondary size-14" aria-hidden="true" />
        )}
        <p className="text-base-content/60 text-sm">
          {hasSearch ? (
            <>
              No hay resultados para <strong>{searchInput}</strong>
            </>
          ) : (
            emptyText
          )}
        </p>
        {!hasSearch && onAdd ? (
          <Button type="button" size="sm" onClick={onAdd}>
            <PlusIcon className="size-4" aria-hidden="true" />
            {addButtonLabel}
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <section
      aria-label={ariaLabel}
      className={cn(tableFrameClassName, "flex flex-col")}
    >
      <div className="min-h-0 w-full flex-1 overflow-hidden">
        <TableLibrary
          data={{ nodes: data }}
          layout={{ custom: true, horizontalScroll: true, fixedHeader: true }}
          sort={sort}
          theme={tableTheme}
        >
          {(tableList: T[]) => (
            <>
              <Header>
                <HeaderRow>
                  {columns.map((column, index) => {
                    const isLastColumn = index === columns.length - 1;
                    const isSortable =
                      column.sortable !== false &&
                      column.key !== ACTIONS_COLUMN_KEY;
                    // The library resizes a column by taking width from the
                    // next visible one, so the column before actions must not
                    // be resizable either or the actions column would change.
                    const isResizable =
                      column.resizable !== false &&
                      !isLastColumn &&
                      column.key !== ACTIONS_COLUMN_KEY &&
                      columns[index + 1]?.key !== ACTIONS_COLUMN_KEY;

                    if (!isSortable) {
                      return (
                        <HeaderCell
                          key={column.key}
                          className={column.headerClassName}
                        >
                          {column.label}
                        </HeaderCell>
                      );
                    }

                    return (
                      <HeaderCellSort
                        key={column.key}
                        sortKey={column.key}
                        resize={isResizable}
                        stiff
                        className={column.headerClassName}
                      >
                        {column.label}
                      </HeaderCellSort>
                    );
                  })}
                </HeaderRow>
              </Header>

              <Body>
                {tableList.map((item) => (
                  <Row key={item.id} item={item}>
                    {columns.map((column) => (
                      <Cell
                        key={`${item.id}-${column.key}`}
                        className={cn("relative", column.className)}
                      >
                        {column.render
                          ? column.render(item)
                          : String(item[column.key] ?? "—")}
                      </Cell>
                    ))}
                  </Row>
                ))}
              </Body>
            </>
          )}
        </TableLibrary>
      </div>

      {pagination ? (
        <TablePagination pagination={pagination} itemLabel={itemLabel} />
      ) : null}
    </section>
  );
}

export function TableLoading() {
  return (
    <div
      className={tableFrameClassName}
      aria-label="Cargando tabla"
      aria-busy="true"
    >
      {/* Static like the real header, so refetches don't flash a dark bar. */}
      <div className="bg-neutral h-11.5" />
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="border-base-300 flex h-16 animate-pulse items-center gap-4 border-t px-4"
        >
          <div className="bg-secondary/20 size-8.5 rounded-[10px]" />
          <div className="bg-secondary/20 h-3 w-28 rounded-full" />
          <div className="bg-secondary/15 h-3 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function TableError({ error }: { error: ServerError }) {
  const isConnectionError =
    error.code === "ERR_NETWORK" || error.code === "connection-error";
  const Icon = isConnectionError ? GlobeLockIcon : CircleAlertIcon;

  return (
    <div className="border-error/20 bg-error/5 text-error flex h-full min-h-0 w-full flex-col items-center justify-center gap-4 rounded-sm border p-8 text-center">
      <Icon className="size-14" aria-hidden="true" />
      <p className="text-sm font-medium">
        {isConnectionError
          ? "No se pudo conectar con el servidor"
          : getErrorMessage(error, "No se pudo cargar la información")}
      </p>
    </div>
  );
}

export { TableWorking };
