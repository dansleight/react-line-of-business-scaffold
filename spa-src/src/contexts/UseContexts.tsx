import { createContext, useContext } from "react";
import { GridBreakpoint } from "@/models/Enums";
import { Api } from "@/apiClient/Api";
import { GlobalSettingsModel, UserInfoModel } from "@/apiClient/data-contracts";
import { AccountInfo } from "@azure/msal-browser";
import { MenusConfig } from "@/models/Interfaces";

// ---- Settings Context -----------------------------------------------------------------------
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
  globalSettings: GlobalSettingsModel;
};

export const SettingsContext = createContext({} as SettingsContextType);

export const useSettingsContext = () => useContext(SettingsContext);

// ---- Identity Context -----------------------------------------------------------------------
type IdentityContextType = {
  handleLogin: () => void;
  handleLogout: () => void;
  getAccount: () => AccountInfo;
  name: string;
  username: string;
  avatarUrl: string;
};

export const IdentityContext = createContext({} as IdentityContextType);

export const useIdentityContext = () => useContext(IdentityContext);

// ---- Session Context -----------------------------------------------------------------------
type SessionContextType = {
  api: Api;
  getApiBearer: () => Promise<string | undefined>;
  userInfo: UserInfoModel;
  menusConfig: MenusConfig;
  reportApiError: (error: unknown) => void;
};

export const SessionContext = createContext({} as SessionContextType);

export const useSessionContext = () => useContext(SessionContext);
