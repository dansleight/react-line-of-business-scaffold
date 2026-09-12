import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { useSessionContext, useSettingsContext } from "@/contexts/UseContexts";
import classNames from "classnames";
import { useEffect, useMemo, useRef } from "react";
import { Brand } from "./components/Brand";
import { Link } from "react-router-dom";
import { faQuestionCircle } from "@fortawesome/free-regular-svg-icons";
import { Dropdown } from "bootstrap";
import { HMenu } from "./components/HMenu";
import { DropMenu } from "./components/DropMenu";
import { VariableLayoutConfig } from "@/models/Interfaces";

interface NavbarProps {
  variableLayoutConfig: VariableLayoutConfig;
}

export const Navbar = ({ variableLayoutConfig }: NavbarProps) => {
  const { toggleSidebar, darkMode } = useSettingsContext();
  const dropdownsCreated = useRef<boolean>(false);
  const { menusConfig } = useSessionContext();
  const { mainMenu } = menusConfig;

  const navbarClass: string = useMemo(() => {
    return darkMode
      ? variableLayoutConfig.navbarDarkTheme
      : variableLayoutConfig.navbarTheme;
  }, [darkMode, variableLayoutConfig]);

  useEffect(() => {
    if (dropdownsCreated.current) return;
    dropdownsCreated.current = true;
    const dropdownTargets = document.querySelectorAll(
      "#layout-navbar .dropdown",
    );
    [...dropdownTargets].map((target) => Dropdown.getOrCreateInstance(target));
  }, []);

  return (
    <nav
      id="layout-navbar"
      className={classNames(
        "horizontal-bar navbar navbar-expand navbar static-top " + navbarClass,
        {},
      )}
    >
      {/* 
            Conditions where the brand should show up:
            - All sizes when there is no sidebar 
            - SM and XS when there is a sidebar */}
      {!variableLayoutConfig.topbar && (
        <>
          <Brand
            className={classNames("nav-only", {
              "d-md-none": variableLayoutConfig.sidebar,
            })}
            sidebar={variableLayoutConfig.sidebar}
          />
          {/* Create space when the topbar-brand-icon is visible, since it is absolute positioned  */}
          <div
            className={classNames("hbar-brand-icon-spacer", {
              "d-md-none": variableLayoutConfig.sidebar,
            })}
          ></div>

          {/* Sidebar Toggle (Topbar)
              Conditions where the toggle should show:
              - all sizes when there is a sidebar
              - SM an XS when there is a navbar, maybe MD as well, based on need
              ** should be its own component if there is no sidebar or navbar, and there is still a desire to have it
              */}
          {(variableLayoutConfig.navbar || variableLayoutConfig.sidebar) && (
            <button
              className={classNames(
                "sidebar-toggle-hbar btn btn-link rounded-circle ms-2",
                {
                  "d-md-none": !variableLayoutConfig.sidebar,
                },
              )}
              onClick={toggleSidebar}
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
          )}
        </>
      )}

      {/* ********************************************************************************************************************
      Menu Items
      */}
      <HMenu sm menuitems={mainMenu} />

      {/* ******************************************************************************************************************** */}

      {/* Right Side Items, not automatically in the responsive menu, you'll need to manage these yourself.
        This default scaffold will move surface help in the topbar when the navbar hides.
      */}
      <ul className="navbar-nav ms-auto">
        <li className="nav-item mx-1">
          <Link to={"/help"} className="nav-link">
            <FontAwesomeIcon icon={faQuestionCircle} />
          </Link>
        </li>
        <DropMenu id="test" menuitems={mainMenu} className="d-lg-none" />
      </ul>
    </nav>
  );
};
