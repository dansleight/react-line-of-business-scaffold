import type { ReactNode } from "react";
import {
  faEdit,
  faFolderOpen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/Icon";
import type {
  DataGridAlign,
  DataGridColumnProps,
  DataGridFrozen,
  DataGridRow,
} from "./types";

/** Called with the row when the button is clicked. */
export type RowAction<T> = (row: T) => void;

/**
 * Per-row decision. `forRow` builds one. The grid calls it while painting.
 * Return a handler, `null` for a disabled button, or `undefined` to hide it.
 * Do not run the action here.
 */
export type RowActionDecider<T> = {
  forRow: (row: T) => RowAction<T> | null | undefined;
};

/**
 * Omit the prop to hide the button. `null` shows it disabled.
 * A function runs on click. `forRow(...)` decides per row.
 */
export type RowActionProp<T> = RowAction<T> | RowActionDecider<T> | null;

export type RowActions<T> = {
  openAction?: RowAction<T> | null;
  editAction?: RowAction<T> | null;
  deleteAction?: RowAction<T> | null;
};

export type DataGridActionsProps<T extends DataGridRow> = {
  id?: string;
  header?: ReactNode;
  align?: DataGridAlign;
  frozen?: DataGridFrozen;
  /** Button size. Default `sm`. */
  size?: "xs" | "sm" | "lg";
  openAction?: RowActionProp<T>;
  editAction?: RowActionProp<T>;
  deleteAction?: RowActionProp<T>;
  /**
   * Per-row actions. A field that is present replaces the matching prop.
   * The value is already decided: a handler, `null`, or `undefined`.
   */
  children?: (row: T) => RowActions<T>;
};

export function forRow<T>(
  decide: (row: T) => RowAction<T> | null | undefined,
): RowActionDecider<T> {
  return { forRow: decide };
}

export function resolveRowAction<T>(
  action: RowActionProp<T> | undefined,
  row: T,
): RowAction<T> | null | undefined {
  if (action == null || typeof action === "function") return action;
  return action.forRow(row);
}

export function actionsForRow<T extends DataGridRow>(
  props: DataGridActionsProps<T>,
  row: T,
): RowActions<T> {
  const override = props.children?.(row);
  return {
    openAction: pick(override, "openAction", props.openAction, row),
    editAction: pick(override, "editAction", props.editAction, row),
    deleteAction: pick(override, "deleteAction", props.deleteAction, row),
  };
}

function pick<T extends DataGridRow, K extends keyof RowActions<T>>(
  override: RowActions<T> | undefined,
  key: K,
  prop: RowActionProp<T> | undefined,
  row: T,
): RowAction<T> | null | undefined {
  if (override && key in override) return override[key];
  return resolveRowAction(prop, row);
}

export function actionsToColumn<T extends DataGridRow>(
  props: DataGridActionsProps<T>,
): DataGridColumnProps<T> {
  return {
    id: props.id ?? "actions",
    header: props.header ?? "",
    sortable: false,
    align: props.align ?? "end",
    frozen: props.frozen,
    nowrap: true,
    children: (row) => {
      const actions = actionsForRow(props, row);
      return (
        <GridActionButtons
          size={props.size}
          openAction={bind(actions.openAction, row)}
          editAction={bind(actions.editAction, row)}
          deleteAction={bind(actions.deleteAction, row)}
        />
      );
    },
  };
}

function bind<T>(
  action: RowAction<T> | null | undefined,
  row: T,
): (() => void) | null | undefined {
  if (action == null) return action;
  return () => action(row);
}

const BUTTONS = [
  {
    key: "openAction",
    label: "Open",
    icon: faFolderOpen,
    tone: "primary",
  },
  { key: "editAction", label: "Edit", icon: faEdit, tone: "success" },
  { key: "deleteAction", label: "Delete", icon: faTrash, tone: "danger" },
] as const;

export function GridActionButtons({
  size = "sm",
  openAction,
  editAction,
  deleteAction,
}: {
  size?: "xs" | "sm" | "lg";
  openAction?: (() => void) | null;
  editAction?: (() => void) | null;
  deleteAction?: (() => void) | null;
}) {
  const actions = { openAction, editAction, deleteAction };
  return (
    <div style={{ marginTop: "-.25rem", marginBottom: "-.25rem" }}>
      {BUTTONS.map(({ key, label, icon, tone }) => {
        const action = actions[key];
        if (action) {
          return (
            <button
              key={key}
              type="button"
              className={`btn btn-${size} btn-outline-${tone} border-0`}
              aria-label={label}
              onClick={action}
            >
              <Icon
                className={tone === "primary" ? "text-primary" : undefined}
                icon={icon}
              />
            </button>
          );
        }
        if (action === null) {
          return (
            <button
              key={key}
              type="button"
              className={`btn btn-${size} btn-outline-secondary border-0`}
              aria-label={label}
              disabled
            >
              <Icon icon={icon} />
            </button>
          );
        }
        return null;
      })}
    </div>
  );
}
