import {
  useSessionContext,
  useSettingsContext,
} from "../../../contexts/UseContexts";
import { BarSearch } from "./components/BarSearch";
import { SearchDropdown } from "./components/SearchDropdown";
import { Alerts } from "./components/Alerts";
import { Messages } from "./components/Messages";
import { UserInfo } from "./components/UserInfo";
import { LightDarkMode } from "./components/LightDarkMode";
import classNames from "classnames";
import { useMemo } from "react";
import { Brand } from "./components/Brand";
import { DropMenu } from "./components/DropMenu";
import { VariableLayoutConfig } from "../../../models/Interfaces";

interface TopbarProps {
  variableLayoutConfig: VariableLayoutConfig;
}

export const Topbar = ({ variableLayoutConfig }: TopbarProps) => {
  const { darkMode } = useSettingsContext();
  const { menusConfig } = useSessionContext();
  const { altMenu } = menusConfig;

  const topbarClass: string = useMemo(() => {
    return darkMode
      ? variableLayoutConfig.topbarDarkTheme
      : variableLayoutConfig.topbarTheme;
  }, [darkMode, variableLayoutConfig]);

  return (
    <nav
      id="layout-topbar"
      className={classNames(
        "horizontal-bar navbar navbar-expand static-top " + topbarClass,
        {},
      )}
    >
      {/* 
        Conditions where the brand should show up:
        - All sizes when there is no sidebar 
        - SM and XS when there is a sidebar */}
      <Brand
        className={classNames(
          darkMode
            ? variableLayoutConfig.sidebarDarkTheme
            : variableLayoutConfig.sidebarTheme,
          {
            "d-md-none": variableLayoutConfig.sidebar,
          },
        )}
        sidebar={variableLayoutConfig.sidebar}
      />

      {/* Create space when the navbar-brand-icon is visible, since it is absolute positioned  */}
      <div
        className={classNames("hbar-brand-icon-spacer", {
          "d-md-none": variableLayoutConfig.sidebar,
        })}
      ></div>
      {/* Sidebar Toggle (navbar)
          Conditions where the toggle should show:
          - all sizes when there is a sidebar
          - SM an XS when there is a navbar, maybe MD as well, based on need
          ** should be its own component if there is no sidebar or navbar, and there is still a desire to have it
      */}
      {variableLayoutConfig.sidebar && variableLayoutConfig.fullSidebar && (
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

        {altMenu && (
          <DropMenu
            id="topbar-sidebar-menu-items"
            menuitems={altMenu}
            className="d-md-none"
          />
        )}
      </ul>
    </nav>
  );
};
