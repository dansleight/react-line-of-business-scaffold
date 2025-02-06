import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faLaughWink } from "@fortawesome/free-solid-svg-icons";
import { useSettingsContext } from "../../contexts/UseContexts";
import { TopbarSearch } from "./components/TopbarSearch";
import { SearchDropdown } from "./components/SearchDropdown";
import { Alerts } from "./components/Alerts";
import { Messages } from "./components/Messages";
import { UserInfo } from "./components/UserInfo";
import { layoutConfig } from "../../layoutConfig";
import classNames from "classnames";
import { LightDarkMode } from "./components/LightDarkMode";
import { useEffect, useState } from "react";

export const TopBar = () => {
  const { toggleSidebar, darkMode } = useSettingsContext();
  const [topbarClass, setTopbarClass] = useState<string>("");

  useEffect(() => {
    if (!darkMode) setTopbarClass(layoutConfig.topbarTheme);
    else setTopbarClass(layoutConfig.topbarDarkTheme);
  }, [darkMode, layoutConfig]);

  return (
    <nav
      className={classNames(
        "navbar navbar-expand topbar mb-4 static-top " + topbarClass,
        {},
      )}
    >
      {/* 
        Conditions where the brand should show up:
        - All sizes when there is no sidebar 
        - SM and XS when there is a sidebar */}
      <div
        className={classNames(
          "topbar-brand-icon d-flex align-items-center justify-content-center",
          {
            "d-md-none": layoutConfig.includeSidebar,
          },
        )}
      >
        <div className="rotate-n-15 my-lg-0 mw-100">
          <FontAwesomeIcon icon={faLaughWink} size="2x" />
        </div>
      </div>

      {/* Create space when the topbar-brand-icon is visible, since it is absolute positioned  */}
      <div
        className={classNames("topbar-brand-icon-spacer", {
          "d-md-none": layoutConfig.includeSidebar,
        })}
      ></div>

      {/* Sidebar Toggle (Topbar)
          Conditions where the toggle should show:
          - all sizes when there is a sidebar
          - SM an XS when there is a navbar, maybe MD as well, based on need
          ** should be its own component if there is no sidebar or navbar, and there is still a desire to have it
      */}
      {layoutConfig.includeNavbar ||
        (layoutConfig.includeSidebar && (
          <button
            id="sidebarToggleTop"
            className={classNames("btn btn-link rounded-circle ms-2", {
              "d-md-none": !layoutConfig.includeSidebar,
            })}
            onClick={toggleSidebar}
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
        ))}

      {/* Topbar Search */}
      <div className="d-none d-lg-inline-block me-auto ms-lg-3 my-lg-0 mw-100">
        <TopbarSearch />
      </div>
      {/* Topbar Navbar */}
      <ul className="navbar-nav ms-auto">
        {/* Nav Item - Search Dropdown (Visible Only MD and smaller) */}
        <SearchDropdown />

        {/* Nav Item - Alerts */}
        <Alerts />

        {/* Nav Item - Messages */}
        <Messages />

        {/* Nav Item - Light Dark Mode */}
        <LightDarkMode />

        <div className="topbar-divider d-none d-sm-block"></div>

        {/* Nav Item - User Information */}
        <UserInfo />
      </ul>
    </nav>
  );
};
