import {
  faSearch,
  faSort,
  faSortDown,
  faSortUp,
} from "@fortawesome/free-solid-svg-icons";
import {
  type Column,
  type ColumnDef,
  type ColumnPinningState,
  type Header,
  useTable,
} from "@tanstack/react-table";
import classNames from "classnames";
import { CSSProperties, useId, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { columnId, defaultRowId, pinRegion } from "./columns";
import { formatCell, humanize } from "./formatCell";
import { gridFeatures, type GridFeatures } from "./features";
import type {
  DataGridAlign,
  DataGridColumnMeta,
  DataGridColumnProps,
  DataGridProps,
  DataGridRow,
} from "./types";

const DEFAULT_PAGE_SIZE = 25;
const DEFAULT_PAGE_OPTIONS = [10, 25, 50, 100];
const UNPAGED_SIZE = 100_000;

type ViewProps<T extends DataGridRow> = Omit<
  DataGridProps<T>,
  "children" | "properties"
> & {
  columns: DataGridColumnProps<T>[];
};

export function DataGridView<T extends DataGridRow>({
  data,
  columns,
  getRowId,
  searchable = false,
  searchPlaceholder = "Search",
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions = DEFAULT_PAGE_OPTIONS,
  striped = false,
  hover = true,
  size,
  stacked = "md",
  empty,
  className,
  caption,
}: ViewProps<T>) {
  const searchId = useId();
  const pageSizeId = useId();
  const paging = pageSize !== false;
  const resolvedPageSize = paging ? pageSize : UNPAGED_SIZE;

  const [globalFilter, setGlobalFilter] = useState("");

  const columnDefs = useMemo(() => columns.map(toColumnDef), [columns]);

  const columnPinning = useMemo<ColumnPinningState>(() => {
    const start: string[] = [];
    const end: string[] = [];
    columns.forEach((col, index) => {
      const region = pinRegion(col.frozen);
      const id = columnId(col, index);
      if (region === "start") start.push(id);
      else if (region === "end") end.push(id);
    });
    return { start, end };
  }, [columns]);

  const columnVisibility = useMemo(() => {
    const visibility: Record<string, boolean> = {};
    columns.forEach((col, index) => {
      if (col.hidden) visibility[columnId(col, index)] = false;
    });
    return visibility;
  }, [columns]);

  const sizeChoices = useMemo(() => {
    const set = new Set(pageSizeOptions);
    if (paging) set.add(pageSize);
    return [...set].sort((a, b) => a - b);
  }, [pageSize, pageSizeOptions, paging]);

  const table = useTable({
    features: gridFeatures,
    data,
    columns: columnDefs,
    getRowId: (row, index) => getRowId?.(row, index) ?? defaultRowId(row, index),
    state: {
      globalFilter,
      columnPinning,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    initialState: {
      pagination: { pageIndex: 0, pageSize: resolvedPageSize },
    },
    globalFilterFn: "includesString",
    getColumnCanGlobalFilter: (column) => {
      const meta = column.columnDef.meta as DataGridColumnMeta | undefined;
      return meta?.searchable !== false;
    },
    enableSortingRemoval: true,
  });

  const pageIndex = table.state.pagination.pageIndex;
  const currentPageSize = table.state.pagination.pageSize;
  const filteredCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const from = filteredCount === 0 ? 0 : pageIndex * currentPageSize + 1;
  const to = Math.min(filteredCount, (pageIndex + 1) * currentPageSize);
  const rows = table.getRowModel().rows;
  const visibleCount = table.getVisibleLeafColumns().length;
  const emptyMessage =
    empty ?? (data.length === 0 ? "No records." : "No matching records.");
  const hasPins =
    columnPinning.start.length > 0 || columnPinning.end.length > 0;

  const onSearch = (value: string) => {
    setGlobalFilter(value);
    table.setPageIndex(0);
  };

  return (
    <div
      className={classNames(
        "app-datagrid",
        stacked && `app-datagrid--stack-${stacked}`,
        className,
      )}
    >
      {(searchable || paging) && (
        <div className="app-datagrid-toolbar">
          {searchable && (
            <div className="app-datagrid-search">
              <label className="visually-hidden" htmlFor={searchId}>
                {searchPlaceholder}
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <Icon icon={faSearch} />
                </span>
                <input
                  id={searchId}
                  type="search"
                  className="form-control"
                  placeholder={searchPlaceholder}
                  value={globalFilter}
                  onChange={(event) => onSearch(event.target.value)}
                />
              </div>
            </div>
          )}
          {paging && (
            <div className="app-datagrid-pagesize">
              <label className="form-label mb-0 small text-nowrap" htmlFor={pageSizeId}>
                Rows
              </label>
              <select
                id={pageSizeId}
                className="form-select form-select-sm"
                value={currentPageSize}
                onChange={(event) => {
                  table.setPageSize(Number(event.target.value));
                  table.setPageIndex(0);
                }}
              >
                {sizeChoices.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="app-datagrid-table-wrap table-responsive">
        <table
          className={classNames("table app-datagrid-table", {
            "table-striped": striped,
            "table-hover": hover,
            "table-sm": size === "sm",
            "app-datagrid-table--pins": hasPins,
          })}
        >
          {caption && <caption className="visually-hidden">{caption}</caption>}
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className={headerClassName(header)}
                    style={cellStyle(header.column)}
                    aria-sort={ariaSort(header)}
                  >
                    {header.isPlaceholder ? null : (
                      <SortHeader header={header} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={Math.max(visibleCount, 1)}
                  className="text-center text-body-secondary py-4"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={bodyClassName(cell.column)}
                      style={cellStyle(cell.column)}
                    >
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="app-datagrid-cards">
        {rows.length === 0 ? (
          <div className="text-center text-body-secondary py-4">
            {emptyMessage}
          </div>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="card app-datagrid-card mb-2">
              <div className="card-body py-2 px-3">
                {row.getVisibleCells().map((cell) => (
                  <div key={cell.id} className="app-datagrid-card-row">
                    <div className="app-datagrid-card-label">
                      {cell.column.columnDef.meta?.label ?? cell.column.id}
                    </div>
                    <div
                      className={classNames(
                        "app-datagrid-card-value",
                        alignClass(cell.column.columnDef.meta?.align),
                      )}
                    >
                      <table.FlexRender cell={cell} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {(paging || searchable) && (
        <div className="app-datagrid-footer">
          <div className="small text-body-secondary" aria-live="polite">
            {filteredCount === 0
              ? "No rows"
              : `Showing ${from.toLocaleString()}–${to.toLocaleString()} of ${filteredCount.toLocaleString()}`}
          </div>
          {paging && pageCount > 1 && (
            <Pager
              pageIndex={pageIndex}
              pageCount={pageCount}
              canPrevious={table.getCanPreviousPage()}
              canNext={table.getCanNextPage()}
              onFirst={() => table.setPageIndex(0)}
              onPrev={() => table.previousPage()}
              onNext={() => table.nextPage()}
              onLast={() => table.setPageIndex(pageCount - 1)}
              onPage={(index) => table.setPageIndex(index)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function toColumnDef<T extends DataGridRow>(
  col: DataGridColumnProps<T>,
  index: number,
): ColumnDef<GridFeatures, T, unknown> {
  const id = columnId(col, index);
  const label =
    col.header ?? (col.property ? humanize(String(col.property)) : "");
  const size = typeof col.width === "number" ? col.width : undefined;
  const searchable = col.property != null || col.accessor != null;
  const meta = {
    align: col.align,
    nowrap: col.nowrap,
    className: col.className,
    headerClassName: col.headerClassName,
    label,
    width: col.width,
    searchable,
  };

  const cell = (ctx: {
    row: { original: T };
    getValue: () => unknown;
  }) => {
    const value = ctx.getValue();
    if (col.children) return col.children(ctx.row.original, value);
    return formatCell(value);
  };

  if (col.accessor) {
    return {
      id,
      accessorFn: col.accessor,
      header: () => label,
      cell,
      enableSorting: col.sortable !== false,
      size,
      meta,
    };
  }

  if (col.property) {
    return {
      id,
      accessorFn: (row) => (row as Record<string, unknown>)[col.property as string],
      header: () => label,
      cell,
      enableSorting: col.sortable !== false,
      size,
      meta,
    };
  }

  return {
    id,
    header: () => label,
    cell: (ctx) => col.children?.(ctx.row.original, undefined) ?? null,
    enableSorting: col.sortable === true,
    size,
    meta: { ...meta, searchable: false },
  };
}

function SortHeader<T extends DataGridRow>({
  header,
}: {
  header: Header<GridFeatures, T, unknown>;
}) {
  const sorted = header.column.getIsSorted();
  const canSort = header.column.getCanSort();
  const content = header.column.columnDef.meta?.label ?? header.column.id;
  if (!canSort) {
    return <span className="app-datagrid-header-text">{content}</span>;
  }
  return (
    <button
      type="button"
      className="app-datagrid-sort"
      onClick={header.column.getToggleSortingHandler()}
    >
      <span className="app-datagrid-header-text">{content}</span>
      <Icon
        icon={sorted === "asc" ? faSortUp : sorted === "desc" ? faSortDown : faSort}
        className={classNames("app-datagrid-sort-icon", {
          "is-active": Boolean(sorted),
        })}
      />
    </button>
  );
}

function ariaSort<T extends DataGridRow>(
  header: Header<GridFeatures, T, unknown>,
): "ascending" | "descending" | "none" | undefined {
  if (!header.column.getCanSort()) return undefined;
  const sorted = header.column.getIsSorted();
  if (sorted === "asc") return "ascending";
  if (sorted === "desc") return "descending";
  return "none";
}

function pinClass<T extends DataGridRow>(
  column: Column<GridFeatures, T, unknown>,
): string | undefined {
  const pinned = column.getIsPinned();
  if (!pinned) return undefined;
  const edge =
    pinned === "start"
      ? column.getPinnedIndex() ===
        column.table.getStartLeafColumns().length - 1
      : column.getPinnedIndex() === 0;
  return classNames("app-datagrid-pin", `app-datagrid-pin-${pinned}`, {
    "is-last-start": pinned === "start" && edge,
    "is-first-end": pinned === "end" && edge,
  });
}

function headerClassName<T extends DataGridRow>(
  header: Header<GridFeatures, T, unknown>,
): string {
  return classNames(
    pinClass(header.column),
    alignClass(header.column.columnDef.meta?.align),
    header.column.columnDef.meta?.nowrap && "text-nowrap",
    header.column.columnDef.meta?.headerClassName,
  );
}

function bodyClassName<T extends DataGridRow>(
  column: Column<GridFeatures, T, unknown>,
): string {
  return classNames(
    pinClass(column),
    alignClass(column.columnDef.meta?.align),
    column.columnDef.meta?.nowrap && "text-nowrap",
    column.columnDef.meta?.className,
  );
}

function alignClass(align?: DataGridAlign): string | undefined {
  if (align === "center") return "text-center";
  if (align === "end") return "text-end";
  if (align === "start") return "text-start";
  return undefined;
}

function cellStyle<T extends DataGridRow>(
  column: Column<GridFeatures, T, unknown>,
): CSSProperties {
  const pinned = column.getIsPinned();
  const width = column.columnDef.meta?.width;
  const widthValue =
    typeof width === "number"
      ? `${width}px`
      : typeof width === "string"
        ? width
        : pinned
          ? `${column.getSize()}px`
          : undefined;
  return {
    position: pinned ? "sticky" : undefined,
    insetInlineStart:
      pinned === "start" ? `${column.getStart("start")}px` : undefined,
    insetInlineEnd:
      pinned === "end" ? `${column.getAfter("end")}px` : undefined,
    width: widthValue,
    minWidth: widthValue,
  };
}

function Pager({
  pageIndex,
  pageCount,
  canPrevious,
  canNext,
  onFirst,
  onPrev,
  onNext,
  onLast,
  onPage,
}: {
  pageIndex: number;
  pageCount: number;
  canPrevious: boolean;
  canNext: boolean;
  onFirst: () => void;
  onPrev: () => void;
  onNext: () => void;
  onLast: () => void;
  onPage: (index: number) => void;
}) {
  return (
    <nav aria-label="Pages">
      <ul className="pagination pagination-sm mb-0">
        <li className={classNames("page-item", { disabled: !canPrevious })}>
          <button
            type="button"
            className="page-link"
            disabled={!canPrevious}
            onClick={onFirst}
            aria-label="First page"
          >
            «
          </button>
        </li>
        <li className={classNames("page-item", { disabled: !canPrevious })}>
          <button
            type="button"
            className="page-link"
            disabled={!canPrevious}
            onClick={onPrev}
            aria-label="Previous page"
          >
            ‹
          </button>
        </li>
        {pageWindow(pageIndex, pageCount).map((item, i) =>
          item === "ellipsis" ? (
            <li key={`e-${i}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li
              key={item}
              className={classNames("page-item", {
                active: item === pageIndex,
              })}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => onPage(item)}
                aria-current={item === pageIndex ? "page" : undefined}
              >
                {item + 1}
              </button>
            </li>
          ),
        )}
        <li className={classNames("page-item", { disabled: !canNext })}>
          <button
            type="button"
            className="page-link"
            disabled={!canNext}
            onClick={onNext}
            aria-label="Next page"
          >
            ›
          </button>
        </li>
        <li className={classNames("page-item", { disabled: !canNext })}>
          <button
            type="button"
            className="page-link"
            disabled={!canNext}
            onClick={onLast}
            aria-label="Last page"
          >
            »
          </button>
        </li>
      </ul>
    </nav>
  );
}

function pageWindow(
  current: number,
  pageCount: number,
  radius = 1,
): (number | "ellipsis")[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i);
  }
  const pages = new Set<number>([0, pageCount - 1]);
  for (let i = current - radius; i <= current + radius; i++) {
    if (i >= 0 && i < pageCount) pages.add(i);
  }
  const sorted = [...pages].sort((a, b) => a - b);
  const out: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) out.push("ellipsis");
    out.push(sorted[i]);
  }
  return out;
}
