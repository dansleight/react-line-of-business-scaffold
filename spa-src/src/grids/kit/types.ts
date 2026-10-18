import { ReactNode } from "react";

/** Row objects the grid can bind. Matches TanStack `RowData`. */
export type DataGridRow = Record<string, any>;

export type DataGridAlign = "start" | "center" | "end";

/** `true` pins to the start (left in LTR). */
export type DataGridFrozen = boolean | "left" | "right";

/** Stack into definition lists below this Bootstrap breakpoint. */
export type DataGridStacked = false | "sm" | "md" | "lg";

export type DataGridColumnProps<T extends DataGridRow = DataGridRow> = {
  /** Typed field on each row. Intellisense comes from `dataGrid<T>()`. */
  property?: keyof T & string;
  /** Computed value when the cell is not a direct field. */
  accessor?: (row: T) => unknown;
  /** Required when there is no `property` (action columns, etc.). */
  id?: string;
  header?: ReactNode;
  frozen?: DataGridFrozen;
  /** Default true when the column has a `property` or `accessor`. */
  sortable?: boolean;
  hidden?: boolean;
  align?: DataGridAlign;
  width?: number | string;
  nowrap?: boolean;
  className?: string;
  headerClassName?: string;
  children?: (row: T, value: unknown) => ReactNode;
};

export type DataGridProps<T extends DataGridRow = DataGridRow> = {
  data: T[];
  getRowId?: (row: T, index: number) => string;
  children?: ReactNode;
  /**
   * Auto-column subset when no `<Grid.Column />` children are given.
   * Omit to render a column for every own property on the rows.
   */
  properties?: (keyof T & string)[];
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Page length, or `false` to show every row. Default 25. */
  pageSize?: number | false;
  pageSizeOptions?: number[];
  striped?: boolean;
  hover?: boolean;
  size?: "sm";
  /** Default `md`. Cards replace the table under this breakpoint. */
  stacked?: DataGridStacked;
  empty?: ReactNode;
  className?: string;
  /** Accessible name for the table. */
  caption?: string;
};

export type DataGridColumnMeta = {
  align?: DataGridAlign;
  nowrap?: boolean;
  className?: string;
  headerClassName?: string;
  label?: ReactNode;
  width?: number | string;
  searchable?: boolean;
};
