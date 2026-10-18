import {
  columnFilteringFeature,
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  constructFilterFn,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  metaHelper,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
} from "@tanstack/react-table";
import { cellSearchText } from "./formatCell";
import type { DataGridColumnMeta } from "./types";

const gridFilterFn = constructFilterFn({
  ...filterFn_includesString,
  resolveDataValue: (value: unknown) => cellSearchText(value).toLowerCase(),
  resolveFilterValue: (value: unknown) =>
    String(value ?? "")
      .toLowerCase()
      .trim(),
});

/** Stable across renders. Register once at module scope. */
export const gridFeatures = tableFeatures({
  columnMeta: metaHelper<DataGridColumnMeta>(),
  columnSizingFeature,
  columnPinningFeature,
  columnVisibilityFeature,
  columnFilteringFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: gridFilterFn },
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export type GridFeatures = typeof gridFeatures;
