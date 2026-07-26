import { ReactNode, useEffect } from "react";
import { LayoutConfig, SideMenuLayoutConfig } from "../../models/Interfaces";
import { SideMenu } from "./SideMenu";
import { useSettingsContext } from "../../contexts/UseContexts";
import { TextColor } from "../../models/Enums";
import { XsMenu } from "./XsMenu";

type SidebarLayoutProps = {
  children: ReactNode;
  title?: string;
  config: LayoutConfig;
};

export const SidebarLayout = ({
  children,
  title,
  config,
}: SidebarLayoutProps) => {
  const { setBodyAttribute } = useSettingsContext();
  if (!config.config) {
    throw new Error("Expected SideMenuLayoutConfig but recieved undefined");
  } else {
    const themeIn: boolean = "theme" in config.config;
    if (!themeIn)
      throw new Error(
        "Expected SideMenuLayoutConfig, but recieved something else",
      );
  }

  const sideMenuLayoutConfig: SideMenuLayoutConfig = {
    border: false,
    shadow: false,
    inactiveClass: TextColor.Muted,
    ...config.config,
  } as SideMenuLayoutConfig;

  useEffect(() => {
    document.title = `${config.titlePrefix ?? ""}${title ?? config.defaultTitle}${config.titleSuffix ?? ""}`;
    setBodyAttribute("data-topmenu-include", "true");
  }, [children, title, config]);

  return (
    <div id="wrapper">
      <XsMenu />
      <SideMenu sideMenuLayoutConfig={sideMenuLayoutConfig} />

      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        {children}
      </div>
    </div>
  );
};
