import { createContext, useContext } from "react";
import { GridBreakpoint } from "../models/Enums";

type SettingsContextType = {
  setBodyAttribute: (
    attribute: string,
    value: string | null | undefined,
  ) => void;
  setHtmlAttribute: (
    attribute: string,
    value: string | null | undefined,
  ) => void;
  sidebarToggled: boolean;
  setSidebarToggled: (sidebarToggled: boolean) => void;
  toggleSidebar: () => void;
  breakpoint: GridBreakpoint;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
};

export const SettingsContext = createContext({} as SettingsContextType);

export const useSettingsContext = () => useContext(SettingsContext);
