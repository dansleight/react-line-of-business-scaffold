import { useEffect, useMemo } from "react";
import "simplebar-react/dist/simplebar.min.css";
import { NavLink, useLocation } from "react-router-dom";
import { useSettingsContext } from "@/contexts/UseContexts";
import classNames from "classnames";
import { GridBreakpoint } from "@/models/Enums";
import { SideMenuLayoutConfig } from "@/models/Interfaces";
import { Logo } from "@/components/Logo";
import { MainMenu } from "./MainMenu";
import { UserMenu } from "./UserMenu";

interface SideMenuProps {
  sideMenuLayoutConfig: SideMenuLayoutConfig;
}

export const SideMenu = ({ sideMenuLayoutConfig }: SideMenuProps) => {
  const { sidebarToggled, setSidebarToggled, breakpoint, darkMode } =
    useSettingsContext();

  const location = useLocation();

  useEffect(() => {
    if (breakpoint < GridBreakpoint.sm && sidebarToggled) {
      setSidebarToggled(false);
    }
  }, [location]);

  const sideMenuClass: string = useMemo(() => {
    return darkMode
      ? sideMenuLayoutConfig.darkTheme
      : sideMenuLayoutConfig.theme;
  }, [darkMode, sideMenuLayoutConfig]);

  return (
    <div
      className={classNames(
        "sidemenu d-sm-flex flex-column justify-content-between h-100" +
          sideMenuClass,
        {
          shadow: sideMenuLayoutConfig.shadow,
          toggled: sidebarToggled,
          "border-end": sideMenuLayoutConfig.border,
        },
      )}
      id="layout-sidemenu"
    >
      <div className="bs-wrapper">
        <div id="sidemenu" className="flex-column nav">
          <NavLink
            className={`nav-link dropdown-item ${sideMenuLayoutConfig.logoClass ?? ""}`}
            to="/"
            data-discover="true"
          >
            <div className="text-center mt-1">
              <Logo size={32} />
            </div>
          </NavLink>
          <MainMenu sideMenuLayoutConfig={sideMenuLayoutConfig} />
        </div>
      </div>

      <div className="bs-wrapper mb-2">
        <div id="usermenu" className="flex-column nav">
          <UserMenu />
        </div>
      </div>
    </div>
  );
};
