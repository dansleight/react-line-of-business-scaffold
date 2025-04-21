import { createContext, useContext } from "react";
import { GridBreakpoint } from "../models/Enums";
import { MenuItem } from "../models/Interfaces";
import { Api } from "../apiClient/Api";
import { GlobalSettingsModel } from "../apiClient/data-contracts";

// ---- Settings Context -----------------------------------------------------------------------
type SettingsContextType = {
  setBodyAttribute: (
    attribute: string,
    value: string | null | undefined
  ) => void;
  setHtmlAttribute: (
    attribute: string,
    value: string | null | undefined
  ) => void;
  sidebarToggled: boolean;
  setSidebarToggled: (sidebarToggled: boolean) => void;
  toggleSidebar: () => void;
  breakpoint: GridBreakpoint;
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  globalSettings: GlobalSettingsModel;
};

export const SettingsContext = createContext({} as SettingsContextType);

export const useSettingsContext = () => useContext(SettingsContext);

// ---- Identity Context -----------------------------------------------------------------------
type IdentityContextType = {
  handleLogin: () => void;
  handleLogout: () => void;
  name: string;
  username: string;
};

export const IdentityContext = createContext({} as IdentityContextType);

export const useIdentityContext = () => useContext(IdentityContext);

// ---- Session Context -----------------------------------------------------------------------
type SessionContextType = {
  api: Api;
  menuItems: MenuItem[];
  getApiBearer: () => Promise<string | undefined>;
};

export const SessionContext = createContext({} as SessionContextType);

export const useSessionContext = () => useContext(SessionContext);
