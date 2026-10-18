import React, { useEffect, useId, useMemo, useRef } from "react";
import classNames from "classnames";
import { Dropdown } from "bootstrap";
import { AppIcon, Icon } from "./Icon";

const SLOT = Symbol.for("app.noteCard.slot");
type NoteCardSlot = "header" | "body";

type Slotted<P> = ((props: P) => React.ReactNode) & {
  [SLOT]?: NoteCardSlot;
};

function markSlot<P>(
  component: (props: P) => React.ReactNode,
  slot: NoteCardSlot,
): Slotted<P> {
  const slotted = component as Slotted<P>;
  slotted[SLOT] = slot;
  return slotted;
}

function isHeaderChild(child: React.ReactElement): boolean {
  const type = child.type as { [SLOT]?: NoteCardSlot };
  return type?.[SLOT] === "header";
}

export type NoteCardMenuAction = {
  type?: "item";
  label: string;
  action: () => void;
  icon?: AppIcon;
  disabled?: boolean;
  variant?: "danger";
};

export type NoteCardMenuEntry =
  | NoteCardMenuAction
  | { type: "separator" }
  | "separator";

export type NoteCardProps = {
  title?: string;
  children?: React.ReactNode;
  className?: string;
  dense?: boolean;
  menuItems?: NoteCardMenuEntry[];
};

function isSeparator(
  item: NoteCardMenuEntry,
): item is "separator" | { type: "separator" } {
  return item === "separator" || item.type === "separator";
}

export function NoteCard({
  title,
  children,
  className,
  dense,
  menuItems,
}: NoteCardProps) {
  const { headerTools, bodyParts } = useMemo(() => {
    const headerTools: React.ReactElement[] = [];
    const bodyParts: React.ReactNode[] = [];
    React.Children.forEach(children, (child) => {
      if (!React.isValidElement(child)) {
        if (child != null && child !== false) bodyParts.push(child);
        return;
      }
      if (isHeaderChild(child)) headerTools.push(child);
      else bodyParts.push(child);
    });
    return { headerTools, bodyParts };
  }, [children]);

  const hasMenu = Boolean(menuItems && menuItems.length > 0);

  return (
    <div
      className={classNames("card", "note-card", "rounded-3", className, {
        "note-card--dense": dense,
      })}
    >
      <div className="card-header">
        <div className="card-header-title">{title ?? ""}</div>
        <div className="card-header-tools">
          {headerTools.map((item, index) => (
            <React.Fragment key={item.key ?? `header-tool-${index}`}>
              {item}
            </React.Fragment>
          ))}
          {hasMenu ? <NoteCardMenu items={menuItems!} /> : null}
        </div>
      </div>
      {bodyParts.map((part, index) => (
        <React.Fragment key={`body-${index}`}>{part}</React.Fragment>
      ))}
    </div>
  );
}

function NoteCardEllipsis() {
  return (
    <svg
      className="note-card-ellipsis"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

type NoteCardMenuProps = {
  items: NoteCardMenuEntry[];
};

function NoteCardMenu({ items }: NoteCardMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toggle = rootRef.current?.querySelector<HTMLElement>(
      '[data-bs-toggle="dropdown"]',
    );
    if (!toggle) return;
    const dropdown = Dropdown.getOrCreateInstance(toggle);
    return () => dropdown.dispose();
  }, []);

  return (
    <div className="dropdown" ref={rootRef}>
      <button
        className="btn btn-sm btn-link"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        aria-label="More actions"
      >
        <NoteCardEllipsis />
      </button>
      <ul className="dropdown-menu dropdown-menu-end">
        {items.map((item, index) => (
          <li key={`menu-item-${index}`}>
            {isSeparator(item) ? (
              <hr className="dropdown-divider" />
            ) : (
              <button
                type="button"
                className={classNames("dropdown-item", {
                  "text-danger": item.variant === "danger",
                })}
                disabled={item.disabled}
                onClick={item.action}
              >
                {item.icon && (
                  <Icon icon={item.icon} className="me-2" size="sm" />
                )}
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export type NoteCardSwitchProps = {
  label: string;
  on: boolean;
  toggle: () => void;
  disabled?: boolean;
  className?: string;
};

const NoteCardSwitch = markSlot(function NoteCardSwitch({
  label,
  on,
  toggle,
  disabled,
  className,
}: NoteCardSwitchProps) {
  const id = useId();
  return (
    <div className={classNames("form-check", "form-switch", className)}>
      <input
        id={id}
        className="form-check-input"
        type="checkbox"
        role="switch"
        checked={on}
        disabled={disabled}
        onChange={toggle}
      />
      <label className="form-check-label" htmlFor={id}>
        {label}
      </label>
    </div>
  );
}, "header");

export type NoteCardButtonProps = {
  icon: AppIcon;
  action: () => void;
  title?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const NoteCardButton = markSlot(function NoteCardButton({
  icon,
  action,
  title,
  disabled,
  className,
  "aria-label": ariaLabel,
}: NoteCardButtonProps) {
  return (
    <button
      type="button"
      className={classNames("btn", "btn-sm", "btn-link", className)}
      title={title}
      aria-label={ariaLabel ?? title}
      disabled={disabled}
      onClick={action}
    >
      <Icon size="sm" icon={icon} />
    </button>
  );
}, "header");

export type NoteCardToolsProps = {
  children: React.ReactNode;
  className?: string;
};

const NoteCardTools = markSlot(function NoteCardTools({
  children,
  className,
}: NoteCardToolsProps) {
  return (
    <div className={classNames("note-card-extra-tools", className)}>
      {children}
    </div>
  );
}, "header");

export type NoteCardBodyProps = {
  children: React.ReactNode;
  title?: string;
  flush?: boolean;
  className?: string;
};

function NoteCardBody({
  children,
  title,
  flush,
  className,
}: NoteCardBodyProps) {
  return (
    <div className={classNames("card-body", flush && "p-0", className)}>
      {title && <h4 className="card-title">{title}</h4>}
      {children}
    </div>
  );
}

NoteCard.Button = NoteCardButton;
NoteCard.Switch = NoteCardSwitch;
NoteCard.Tools = NoteCardTools;
NoteCard.Body = NoteCardBody;

export default NoteCard;
