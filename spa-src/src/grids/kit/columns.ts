import {
  Children,
  Fragment,
  isValidElement,
  type FunctionComponent,
  type ReactNode,
} from "react";
import { humanize } from "./formatCell";
import type { DataGridColumnProps, DataGridFrozen, DataGridRow } from "./types";

export function columnId<T extends DataGridRow>(
  col: DataGridColumnProps<T>,
  index: number,
): string {
  if (col.id) return col.id;
  if (col.property) return String(col.property);
  return `col-${index}`;
}

export function parseColumnChildren<T extends DataGridRow>(
  children: ReactNode,
  Column: FunctionComponent<DataGridColumnProps<T>>,
): DataGridColumnProps<T>[] {
  const defs: DataGridColumnProps<T>[] = [];

  const visit = (node: ReactNode) => {
    Children.forEach(node, (child) => {
      if (!isValidElement(child)) return;
      if (child.type === Fragment) {
        visit((child.props as { children?: ReactNode }).children);
        return;
      }
      if (child.type === Column) {
        defs.push(child.props as DataGridColumnProps<T>);
      }
    });
  };

  visit(children);
  return defs;
}

export function autoColumns<T extends DataGridRow>(
  data: T[],
  properties?: (keyof T & string)[],
): DataGridColumnProps<T>[] {
  const keys = properties ?? collectKeys(data);
  return keys.map((property) => ({
    property,
    header: humanize(property),
  }));
}

function collectKeys<T extends DataGridRow>(data: T[]): (keyof T & string)[] {
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const row of data) {
    if (!row || typeof row !== "object") continue;
    for (const key of Object.keys(row)) {
      const value = (row as Record<string, unknown>)[key];
      if (typeof value === "function") continue;
      if (seen.has(key)) continue;
      seen.add(key);
      keys.push(key);
    }
  }
  return keys as (keyof T & string)[];
}

export function pinRegion(
  frozen: DataGridFrozen | undefined,
): "start" | "end" | false {
  if (frozen === true || frozen === "left") return "start";
  if (frozen === "right") return "end";
  return false;
}

export function defaultRowId<T extends DataGridRow>(row: T, index: number): string {
  if (row && typeof row === "object") {
    const rec = row as Record<string, unknown>;
    for (const key of ["id", "Id", "key", "Key"] as const) {
      const value = rec[key];
      if (value != null && value !== "") return String(value);
    }
  }
  return String(index);
}
