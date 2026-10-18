import {
  faCircleHalfStroke,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import { Icon } from "@/components/Icon";
import { useSettingsContext } from "@/contexts/UseContexts";
import { ColorMode, colorModeLabel, nextColorMode } from "@/models/Enums";
import { MouseEventHandler } from "react";

export function LightDarkMode() {
  const { colorMode, setColorMode } = useSettingsContext();

  const cycleColorMode: MouseEventHandler<HTMLAnchorElement> = (event) => {
    event.preventDefault();
    setColorMode(nextColorMode(colorMode));
  };

  const icon =
    colorMode === ColorMode.Dark
      ? faMoon
      : colorMode === ColorMode.Follow
        ? faCircleHalfStroke
        : faSun;

  return (
    <li id="light-dark-switch" className="nav-item mx-1">
      <a
        className="nav-link"
        id="light-dark-switch-link"
        role="button"
        title={`Color mode: ${colorModeLabel(colorMode)}`}
        onClick={cycleColorMode}
      >
        <Icon icon={icon} />
      </a>
    </li>
  );
}
