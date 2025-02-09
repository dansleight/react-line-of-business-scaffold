import { NavbarTheme, SidebarTheme, TopbarTheme } from "./models/Enums";
import {
  faChartArea,
  faFolder,
  faGauge,
  faGear,
  faTable,
  faWrench,
} from "@fortawesome/free-solid-svg-icons";
import { LayoutConfig, MenuItem } from "./models/Interfaces";

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
  includeSidebar: true,
  sidebarTheme: SidebarTheme.Tertiary,
  sidebarDarkTheme: SidebarTheme.Deep,
  sidebarFull: false,

  includeTopbar: true,
  topbarTheme: TopbarTheme.Light,
  topbarDarkTheme: TopbarTheme.Primary,

  includeNavbar: true,
  navbarTheme: NavbarTheme.Primary,
  navbarDarkTheme: NavbarTheme.Tertiary,
} as LayoutConfig;

/*
------------------------------------------------------------------------------------------------------
Menu Configuration
  Each of the components included in the layoutConfig require menus, unless you are hardcoding them.
  Creating the menus in sections so the can be organized differently for different purposes may behelpful.
    - 


------------------------------------------------------------------------------------------------------
*/
const dashboard: MenuItem = { path: "/", label: "Dashboard", icon: faGauge };
const components: MenuItem = {
  path: "/components",
  label: "Components",
  icon: faGear,
  items: [
    { path: "/components-navbars", label: "Navbars" },
    { path: "/components-buttons", label: "Buttons" },
    { path: "/components-typography", label: "Typography" },
    { path: "/components-forms", label: "Forms" },
    { path: "/components-navs", label: "Navs" },
    { path: "/components-indicators", label: "Indicators" },
    { path: "/components-progress", label: "Progress" },
    { path: "/components-containers", label: "Containers" },
    { path: "/components-dialogs", label: "Dialogs" },
  ],
};
const utilities: MenuItem = {
  path: "/utilities",
  label: "Utilities",
  icon: faWrench,
  items: [
    { path: "/utilities-colors", label: "Colors" },
    { path: "/utilities-borders", label: "Borders" },
    { path: "/utilities-animations", label: "Animations" },
    { path: "/utilities-other", label: "Other" },
  ],
};
const pages: MenuItem = {
  path: "/pages",
  label: "Pages",
  icon: faFolder,
  items: [
    { label: "Login Screens:", group: true },
    { path: "/pages-login", label: "Login" },
    { path: "/pages-register", label: "Register" },
    { path: "/pages-forgot-password", label: "Forgot Password" },
    { label: "Other Pages:", group: true },
    { path: "/pages-404-page", label: "404 Page" },
    { path: "/pages-blank-page", label: "Blank Page" },
  ],
};
const charts: MenuItem = {
  path: "/charts",
  label: "Charts",
  icon: faChartArea,
};
const tables: MenuItem = { path: "/tables", label: "Tables", icon: faTable };

export const genericMenu: MenuItem[] = [
  dashboard,
  { group: true, label: "Interface" },
  components,
  utilities,
  { group: true, label: "Addons" },
  pages,
  charts,
  tables,
];

export const sidebarMenu: MenuItem[] = [
  dashboard,
  {
    group: true,
    label: "Interface",
    items: [components, utilities],
  },
  {
    group: true,
    label: "Addons",
    items: [pages, charts, tables],
  },
];
