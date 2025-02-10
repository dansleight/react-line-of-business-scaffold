import { ReactNode, useEffect } from "react";
import { useSettingsContext } from "../contexts/UseContexts";
import { layoutConfig } from "../layoutConfig";
import { Sidebar } from "../layout/sidebar";
import { Topbar } from "./Topbar";
import { Navbar } from "./Navbar";

type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export const Layout = ({ children, title }: LayoutProps) => {
  const { sidebarToggled, setBodyAttribute } = useSettingsContext();

  useEffect(() => {
    document.title = title ? "Scaffold: " + title : "Scaffold";
    setBodyAttribute(
      "data-navbar-include",
      layoutConfig.includeNavbar ? "true" : "false",
    );
    setBodyAttribute(
      "data-topbar-include",
      layoutConfig.includeTopbar ? "true" : "false",
    );
    setBodyAttribute(
      "data-sidebar-include",
      layoutConfig.includeSidebar ? "true" : "false",
    );
    setBodyAttribute(
      "data-sidebar-full",
      layoutConfig.includeSidebar && layoutConfig.sidebarFull
        ? "true"
        : "false",
    );
  }, [layoutConfig, children, title]);

  return (
    <div id="wrapper" className={sidebarToggled ? "sidebar-toggled" : ""}>
      {layoutConfig.includeSidebar && <Sidebar />}
      {layoutConfig.includeTopbar && <Topbar />}
      {layoutConfig.includeNavbar && <Navbar />}

      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        {children}
      </div>
    </div>
  );
};
