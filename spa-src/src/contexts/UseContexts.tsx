import { createContext, ReactNode, useContext } from "react";
import { ColorMode, GridBreakpoint } from "@/models/Enums";
import { Api } from "@/apiClient/Api";
import {
  GlobalSettingsModel,
  LookupType,
  UserInfoModel,
} from "@/apiClient/data-contracts";
import { AccountInfo } from "@azure/msal-browser";
import { MenusConfig } from "@/models/Interfaces";
import LookupClass from "@/models/LookupClass";

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
  colorMode: ColorMode;
  setColorMode: (colorMode: ColorMode) => void;
  darkMode: boolean;
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

// ---- LookupContext Context -----------------------------------------------------------------------
type LookupContextType = {
  lookups: Record<string, LookupClass>;
  display: (lookupType: LookupType, id?: number | null) => ReactNode;
};

export const LookupContext = createContext({} as LookupContextType);

export const useLookupContext = () => useContext(LookupContext);

// ---- Toast Context -----------------------------------------------------------------------
export type ToastAccent = "primary" | "success" | "info" | "warning" | "danger";

export type ToastOptions = {
  /** Auto-dismiss after `toastTimeoutMs`. Default true. */
  timeout?: boolean;
  accent?: ToastAccent;
};

type ToastContextType = {
  notify: (message: string, options?: ToastOptions) => string;
  dismiss: (id: string) => void;
};

export const ToastContext = createContext({} as ToastContextType);

export const useToast = () => useContext(ToastContext);
