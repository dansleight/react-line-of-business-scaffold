import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import { ComponentType, CSSProperties } from "react";

const NAMED_SIZES: Record<string, string> = {
  xs: "0.75em",
  sm: "0.875em",
  lg: "1.25em",
  xl: "1.5em",
  "2x": "2em",
};

export type IconSize = keyof typeof NAMED_SIZES | number | (string & {});

/** Component-per-icon packs (Lucide, Phosphor, custom SVGs). Loose so optional libraries type-check without being installed. */
export type IconComponent = ComponentType<any>;

export type AppIcon = IconDefinition | IconComponent;

type IconOwnProps = {
  icon: AppIcon;
  className?: string;
  size?: IconSize;
  fixedWidth?: boolean;
  spin?: boolean;
  title?: string;
  color?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-hidden"?: boolean | "true" | "false";
};

export type IconProps = IconOwnProps & Record<string, unknown>;

export function isFaIcon(icon: AppIcon): icon is IconDefinition {
  return (
    typeof icon === "object" &&
    icon !== null &&
    "prefix" in icon &&
    "iconName" in icon &&
    "icon" in icon
  );
}

function resolveSize(size: IconSize | undefined): string {
  if (size == null) return "1em";
  if (typeof size === "number") return `${size}px`;
  if (size in NAMED_SIZES) return NAMED_SIZES[size];
  return size;
}

export function Icon({
  icon,
  className,
  size,
  fixedWidth,
  spin,
  title,
  color,
  style,
  "aria-label": ariaLabel,
  "aria-hidden": ariaHidden,
  ...rest
}: IconProps) {
  const fontSize = resolveSize(size);
  const labelled = Boolean(ariaLabel || title);
  const hidden = ariaHidden ?? (labelled ? undefined : true);

  let graphic;
  if (isFaIcon(icon)) {
    graphic = <FontAwesomeIcon icon={icon} />;
  } else {
    const Comp = icon;
    graphic = (
      <Comp size="1em" color={color ?? "currentColor"} aria-hidden {...rest} />
    );
  }

  return (
    <i
      className={classNames("app-icon", className, {
        "app-icon--fw": fixedWidth,
        "app-icon--spin": spin,
      })}
      style={{ fontSize, color, ...style }}
      title={title}
      aria-label={ariaLabel}
      aria-hidden={hidden}
      role={labelled ? "img" : undefined}
    >
      {graphic}
    </i>
  );
}
