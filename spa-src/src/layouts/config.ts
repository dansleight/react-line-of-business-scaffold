import {
  LayoutType,
  NavbarTheme,
  SidebarTheme,
  SideMenuTheme,
  TextColor,
  TopbarTheme,
} from "@/models/Enums";
import {
  LayoutConfig,
  SideMenuLayoutConfig,
  VariableLayoutConfig,
} from "@/models/Interfaces";

export const vLayoutConfig: LayoutConfig = {
  type: LayoutType.Variable,
  config: {
    sidebar: true,
    sidebarTheme: SidebarTheme.Primary,
    sidebarDarkTheme: SidebarTheme.Primary,
    fullSidebar: false,

    topbar: true,
    topbarTheme: TopbarTheme.Tertiary,
    topbarDarkTheme: TopbarTheme.Dark,

    navbar: false,
    navbarTheme: NavbarTheme.Light,
    navbarDarkTheme: NavbarTheme.Dark,
  } as VariableLayoutConfig,

  defaultTitle: "Scaffold",
  titleSuffix: " - Scaffold",
};

export const smLayoutConfig: LayoutConfig = {
  type: LayoutType.SideMenu,
  config: {
    theme: SideMenuTheme.Body,
    darkTheme: SideMenuTheme.Deep,
    logoClass: TextColor.Primary,
    activeClass: TextColor.BgBody,
    inactiveClass: TextColor.Tertiary,
    border: false,
    shadow: false,
  } as SideMenuLayoutConfig,
  defaultTitle: "Scaffold",
  titleSuffix: " - Scaffold",
};

export const layoutConfig = smLayoutConfig;
