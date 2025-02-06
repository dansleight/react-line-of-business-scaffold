import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import { NavbarTheme, SidebarTheme, TopbarTheme } from "./Enums";

export interface LayoutConfig {
  includeSidebar: boolean;
  sidebarTheme: SidebarTheme;
  sidebarDarkTheme: SidebarTheme;
  sidebarFull: boolean;

  includeTopbar: boolean;
  topbarTheme: TopbarTheme;
  topbarDarkTheme: TopbarTheme;

  includeNavbar: boolean;
  navbarTheme: NavbarTheme;
  navbarDarkTheme: NavbarTheme;
}

export interface MenuItem {
  path?: string;
  label: string;
  shortLabel?: string;
  icon?: IconDefinition;
  items?: MenuItem[];
  group?: boolean;
  colCount?: number;
}
