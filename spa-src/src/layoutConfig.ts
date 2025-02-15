import { NavbarTheme, SidebarTheme, TopbarTheme } from "./models/Enums";
import { LayoutConfig } from "./models/Interfaces";

/*
------------------------------------------------------------------------------------------------------
Layout Configuration
 - sideBar: indicates whether to include a sidebar or leave it
 - sideBarFull: indicates whether the sidebar is full-height, or starts below the topbar and/or navbar
 - topBar: indicates whether to include a topbar

 NOTE: The active sidebar theme will inform the brand background
------------------------------------------------------------------------------------------------------
*/
export const layoutConfig: LayoutConfig = {
  includeSidebar: false,
  sidebarTheme: SidebarTheme.Tertiary,
  sidebarDarkTheme: SidebarTheme.Deep,
  sidebarFull: false,

  includeTopbar: true,
  topbarTheme: TopbarTheme.Deep,
  topbarDarkTheme: TopbarTheme.Deep,

  includeNavbar: true,
  navbarTheme: NavbarTheme.Primary,
  navbarDarkTheme: NavbarTheme.Dark,

  defaultTitle: "Scaffold",
  titleSuffix: " - Scaffold",
} as LayoutConfig;
