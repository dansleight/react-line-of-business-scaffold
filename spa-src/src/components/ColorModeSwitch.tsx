import classNames from "classnames";
import { ColorMode, colorModeLabel, colorModes } from "@/models/Enums";
import { useSettingsContext } from "@/contexts/UseContexts";

export function ColorModeSwitch() {
  const { colorMode, setColorMode } = useSettingsContext();

  return (
    <div className="btn-group" role="group" aria-label="Color mode">
      {colorModes.map((mode: ColorMode) => (
        <button
          key={mode}
          type="button"
          className={classNames("btn btn-sm", {
            active: colorMode === mode,
            "btn-primary": colorMode === mode,
            "btn-secondary": colorMode !== mode,
          })}
          aria-pressed={colorMode === mode}
          onClick={() => setColorMode(mode)}
        >
          {colorModeLabel(mode)}
        </button>
      ))}
    </div>
  );
}
