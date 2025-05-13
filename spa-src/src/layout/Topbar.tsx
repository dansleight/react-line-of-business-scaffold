import { useSettingsContext } from "../contexts/UseContexts";
import { BarSearch } from "./horizontalcomponents/BarSearch";
import { SearchDropdown } from "./horizontalcomponents/SearchDropdown";
import { Alerts } from "./horizontalcomponents/Alerts";
import { Messages } from "./horizontalcomponents/Messages";
import { UserInfo } from "./horizontalcomponents/UserInfo";
import { LightDarkMode } from "./horizontalcomponents/LightDarkMode";
import { layoutConfig } from "../layoutConfig";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { Brand } from "./horizontalcomponents/Brand";
import { DropMenu } from "./horizontalcomponents/DropMenu";
import { ToggleSidebarSvg } from "../components/ToggleSidebarSvg";
import { GridBreakpoint } from "../models/Enums";
import { MenuProps } from "../models/Interfaces";

export const Topbar = ({ menuItems }: MenuProps) => {
  const { darkMode, breakpoint } = useSettingsContext();
  const [topbarClass, setTopbarClass] = useState<string>("");

  useEffect(() => {
    if (!darkMode) setTopbarClass(layoutConfig.topbarTheme);
    else setTopbarClass(layoutConfig.topbarDarkTheme);
  }, [darkMode, layoutConfig]);

  return (
    <nav
      id="layout-topbar"
      className={classNames(
        "horizontal-bar navbar navbar-expand static-top " + topbarClass,
        {}
      )}
    >
      {/* 
        Conditions where the brand should show up:
        - All sizes when there is no sidebar 
        - SM and XS when there is a sidebar */}
      <Brand
        className={classNames(
          darkMode ? layoutConfig.sidebarDarkTheme : layoutConfig.sidebarTheme,
          {
            "d-md-none": layoutConfig.includeSidebar,
          }
        )}
      />

      {/* Create space when the navbar-brand-icon is visible, since it is absolute positioned  */}
      <div
        className={classNames("hbar-brand-icon-spacer", {
          "d-md-none": layoutConfig.includeSidebar,
        })}
      ></div>
      {/* Sidebar Toggle (navbar)
          Conditions where the toggle should show:
          - all sizes when there is a sidebar
          - SM an XS when there is a navbar, maybe MD as well, based on need
          ** should be its own component if there is no sidebar or navbar, and there is still a desire to have it
      */}
      {layoutConfig.includeSidebar && layoutConfig.sidebarFull && (
        <div style={{ width: "1rem" }}></div>
      )}
      {/* Topbar Search */}
      <div className="d-none d-md-inline-block ms-3">
        <BarSearch />
      </div>
      {/* Right Nav */}
      <ul className="navbar-nav ms-auto">
        {/* Nav Item - Search Dropdown (Visible Only MD and smaller) */}
        <SearchDropdown className="d-md-none" />

        {/* Nav Item - Alerts */}
        <Alerts />

        {/* Nav Item - Messages */}
        <Messages />

        {/* Nav Item - Light Dark Mode */}
        <LightDarkMode />

        <div className="hbar-divider d-none d-sm-block"></div>

        {/* Nav Item - User Information */}
        <UserInfo />

        <DropMenu
          id="topbar-sidebar-menu-items"
          menuitems={menuItems}
          className="d-md-none"
        />
      </ul>
    </nav>
  );
};
