import { IconDefinition } from "@fortawesome/fontawesome-common-types";
import {
  LayoutType,
  NavbarTheme,
  SidebarTheme,
  SideMenuTheme,
  TextColor,
  TopbarTheme,
} from "./Enums";

export interface MenuProps {
  menuItems: MenuItem[];
}

export interface MenuItem {
  path?: string;
  label: string;
  icon?: IconDefinition;
  items?: MenuItem[];
  group?: boolean;
  roles?: string | string[];
}

export interface MenusConfig {
  mainMenu: MenuItem[];
  altMenu?: MenuItem[];
}

export interface VariableLayoutConfig {
  sidebar: boolean;
  sidebarTheme: SidebarTheme;
  sidebarDarkTheme: SidebarTheme;
  fullSidebar: boolean;

  topbar: boolean;
  topbarTheme: TopbarTheme;
  topbarDarkTheme: TopbarTheme;

  navbar: boolean;
  navbarTheme: NavbarTheme;
  navbarDarkTheme: NavbarTheme;
}

export interface SideMenuLayoutConfig {
  theme: SideMenuTheme;
  darkTheme: SideMenuTheme;
  border?: boolean;
  shadow?: boolean;
  inactiveClass?: string | TextColor;
  activeClass?: string | TextColor;
  logoClass?: string | TextColor;
}

export interface LayoutConfig {
  type: LayoutType;

  config?: VariableLayoutConfig | SideMenuLayoutConfig;

  defaultTitle?: string;
  titlePrefix?: string;
  titleSuffix?: string;
}
