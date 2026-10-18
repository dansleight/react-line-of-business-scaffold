import { ReactNode } from "react";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:[T\s]|$)/;

export function humanize(key: string): string {
  const spaced = key
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) return "";
  return spaced.replace(/^\w/, (c) => c.toUpperCase());
}

export function formatCell(value: unknown): ReactNode {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return Number.isFinite(value) ? value.toLocaleString() : "—";
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "—" : value.toLocaleDateString();
  }
  if (typeof value === "string") {
    if (ISO_DATE.test(value)) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleDateString();
    }
    return value;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "—";
    }
  }
  return String(value);
}

/** Haystack used by the grid search box. */
export function cellSearchText(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "boolean") return value ? "yes true" : "no false";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : value.toLocaleDateString();
  }
  if (typeof value === "string") {
    if (ISO_DATE.test(value)) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return `${value} ${parsed.toLocaleDateString()}`;
      }
    }
    return value;
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "";
    }
  }
  return String(value);
}
