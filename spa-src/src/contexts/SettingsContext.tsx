import { ReactNode, useEffect, useState } from "react";
import { GridBreakpoint, gridBreakpoints } from "../models/Enums";
import { SettingsContext } from "./UseContexts";
import useCookie from "react-use-cookie";

type SettingsProviderProps = {
  children: ReactNode;
};

export function SettingsProvider({ children }: SettingsProviderProps) {
  const [sidebarToggled, setSidebarToggled] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [darkModeCookie, setDarkModeCookie] = useCookie("darkmode", "false");

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
    setHtmlAttribute("data-bs-theme", darkMode ? "dark" : "light");
    if (darkModeCookie != (darkMode ? "true" : "false"))
      setDarkModeCookie(darkMode ? "true" : "false");
  }, [darkMode]);

  useEffect(() => {
    if (darkModeCookie === "true") setDarkMode(true);
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

  return (
    <SettingsContext.Provider
      value={{
        setBodyAttribute,
        setHtmlAttribute,
        sidebarToggled,
        setSidebarToggled,
        toggleSidebar,
        breakpoint,
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
