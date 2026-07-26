import { ReactNode, useEffect } from "react";
import { LayoutConfig, VariableLayoutConfig } from "../../models/Interfaces";
import { useSettingsContext } from "../../contexts/UseContexts";
import { Sidebar } from "./sidebar/Sidebar";
import { Topbar } from "./horizontal/Topbar";

type VariableLayoutProps = {
  children: ReactNode;
  title?: string;
  config: LayoutConfig;
};

export const VariableLayout = ({
  children,
  title,
  config,
}: VariableLayoutProps) => {
  const { sidebarToggled, setBodyAttribute } = useSettingsContext();

  if (!config.config || !("sidebar" in config.config)) {
    throw new Error(
      `Expected VariableLayoutConfig, but recieved SideMenuLayoutConfig or undefined`,
    );
  }
  const variableLayoutConfig: VariableLayoutConfig =
    config.config as VariableLayoutConfig;

  useEffect(() => {
    document.title = `${config.titlePrefix ?? ""}${title ?? config.defaultTitle}${config.titleSuffix ?? ""}`;
    setBodyAttribute(
      "data-navbar-include",
      variableLayoutConfig.navbar ? "true" : "false",
    );
    setBodyAttribute(
      "data-topbar-include",
      variableLayoutConfig.topbar ? "true" : "false",
    );
    setBodyAttribute(
      "data-sidebar-include",
      variableLayoutConfig.sidebar ? "true" : "false",
    );
    setBodyAttribute(
      "data-sidebar-full",
      variableLayoutConfig.sidebar && variableLayoutConfig.fullSidebar
        ? "true"
        : "false",
    );
  }, [children, title, config]);

  return (
    <div id="wrapper" className={sidebarToggled ? "sidebar-toggled" : ""}>
      {variableLayoutConfig.sidebar && (
        <Sidebar variableLayoutConfig={variableLayoutConfig} />
      )}
      {variableLayoutConfig.topbar && (
        <Topbar variableLayoutConfig={variableLayoutConfig} />
      )}

      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        {children}
      </div>
    </div>
  );
};
