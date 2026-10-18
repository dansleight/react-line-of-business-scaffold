import { ComponentType, ReactNode, useEffect, useState } from "react";
import {
  ColorMode,
  GridBreakpoint,
  gridBreakpoints,
} from "@/models/Enums";
import { SettingsContext } from "./UseContexts";
import { GlobalSettingsModel } from "@/apiClient/data-contracts";
import { defaultGlobalSettings, webApiConfig } from "@/appConfig";
import { Api } from "@/apiClient/Api";
import React from "react";

const colorModeKey = "colormode";
const legacyDarkModeKey = "darkmode";

function prefersDark(): boolean {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function readColorMode(): ColorMode {
  try {
    const stored = localStorage.getItem(colorModeKey);
    if (
      stored === ColorMode.Light ||
      stored === ColorMode.Dark ||
      stored === ColorMode.Follow
    ) {
      return stored;
    }
    const legacy = localStorage.getItem(legacyDarkModeKey);
    if (legacy === "true") return ColorMode.Dark;
    if (legacy === "false") return ColorMode.Light;
  } catch {
    // storage may be unavailable
  }
  return ColorMode.Follow;
}

function resolveDarkMode(mode: ColorMode): boolean {
  if (mode === ColorMode.Dark) return true;
  if (mode === ColorMode.Light) return false;
  return prefersDark();
}

type SettingsProviderProps = {
  children: ReactNode;
  messageWrapper?: ComponentType<{ children: ReactNode }>;
};

export function SettingsProvider({
  children,
  messageWrapper,
}: SettingsProviderProps) {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettingsModel>(
    defaultGlobalSettings as GlobalSettingsModel,
  );
  const [loaded, setLoaded] = useState<boolean | undefined>(undefined);
  const [sidebarToggled, setSidebarToggled] = useState<boolean>(false);
  const [colorMode, setColorMode] = useState<ColorMode>(readColorMode);
  const [darkMode, setResolvedDarkMode] = useState<boolean>(() =>
    resolveDarkMode(readColorMode()),
  );

  const toggleSidebar = () => setSidebarToggled(!sidebarToggled);

  const setBodyAttribute = (
    attribute: string,
    value: string | null | undefined,
  ) => {
    if (document.body) {
      if (!value || value.trim() == "")
        document.body.removeAttribute(attribute);
      else document.body.setAttribute(attribute, value);
    }
  };

  const setHtmlAttribute = (
    attribute: string,
    value: string | null | undefined,
  ) => {
    if (document.documentElement) {
      if (!value || value.trim() == "")
        document.documentElement.removeAttribute(attribute);
      else document.documentElement.setAttribute(attribute, value);
    }
  };

  useEffect(() => {
    // console.log(webApiConfig.origin);
    const api = new Api({ baseUrl: webApiConfig.origin });

    const getSettings = async () => {
      api
        .settingsGet()
        .then((res) => {
          setGlobalSettings(res.data);
          setLoaded(true);
        })
        .catch((e) => {
          console.error(e);
          setGlobalSettings(defaultGlobalSettings as GlobalSettingsModel);
          setLoaded(false);
        });
    };
    getSettings();
  }, []);

  useEffect(() => {
    if (
      loaded &&
      globalSettings.buildNumber &&
      globalSettings.buildNumber.trim() != "" &&
      __APP_VERSION__ !== globalSettings.buildNumber
    ) {
      const lastAttempt = localStorage.getItem("lastVersionCheck");
      const now = Date.now();

      if (!lastAttempt || now - parseInt(lastAttempt, 10) > 60000) {
        // 1 minute cooldown
        localStorage.setItem("lastVersionCheck", now.toString());
        window.location.reload();
      }
    }
  }, [globalSettings.buildNumber]);

  useEffect(() => {
    const apply = () => {
      const dark = resolveDarkMode(colorMode);
      setResolvedDarkMode(dark);
      setHtmlAttribute("data-bs-theme", dark ? "dark" : "light");
    };
    apply();
    try {
      localStorage.setItem(colorModeKey, colorMode);
      localStorage.removeItem(legacyDarkModeKey);
    } catch {
      // storage may be unavailable
    }
    if (colorMode !== ColorMode.Follow) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [colorMode]);

  useEffect(() => {
    // establish some defaults for page loading
    // we could load the layoutConfig here and instantiate it, however
    // we don't know if the developer will want a server-side implementation
    // so we're just clearing them. The App for now will load the
    // layoutConfig and establish the attributes
    setBodyAttribute("data-topbar", undefined);
    setBodyAttribute("data-navbar", undefined);
    setBodyAttribute("data-sidebar", undefined);
  }, []);

  // Wanting to track the screen size, and surface it as a context property
  const [breakpoint, setBreakpoint] = useState<GridBreakpoint>(
    gridBreakpoints[0],
  );

  useEffect(() => {
    let currentBp: GridBreakpoint = GridBreakpoint.xs;
    const calcBreakpoint = () => {
      const innerWidth: number = window.innerWidth;
      let bp: GridBreakpoint = gridBreakpoints[0];
      for (let i = 1; i < gridBreakpoints.length; i++) {
        if (innerWidth < gridBreakpoints[i]) break;
        bp = gridBreakpoints[i];
      }
      if (bp !== currentBp) {
        currentBp = bp;
        setBreakpoint(bp);
      }
    };

    window.addEventListener("resize", calcBreakpoint);
    calcBreakpoint();

    return () => window.removeEventListener("resize", calcBreakpoint);
  }, []);

  const Wrapper = messageWrapper ?? React.Fragment;

  return (
    <SettingsContext.Provider
      value={{
        setBodyAttribute,
        setHtmlAttribute,
        sidebarToggled,
        setSidebarToggled,
        toggleSidebar,
        breakpoint,
        colorMode,
        setColorMode,
        darkMode,
        globalSettings,
      }}
    >
      {loaded === undefined ? (
        <Wrapper>
          <em>Retrieving settings from the server...</em>
        </Wrapper>
      ) : loaded === false ? (
        <div className="text-center">
          <h3 className="text-danger">Failed to load settings...</h3>
          <p>
            I'm sorry, I was unable to get the necessary settings from the
            server in order to continue.
          </p>
          <p>
            Consider waiting a few minutes and trying to refresh. If the problem
            persists, contact support.
          </p>
        </div>
      ) : (
        <>{children}</>
      )}
    </SettingsContext.Provider>
  );
}
