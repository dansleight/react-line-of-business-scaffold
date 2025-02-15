import {
  faChartArea,
  faFolder,
  faGauge,
  faB,
  faTable,
  faWrench,
  faGear,
} from "@fortawesome/free-solid-svg-icons";
import { MenuItem } from "./models/Interfaces";

/*
------------------------------------------------------------------------------------------------------
Menu Configuration
  Each of the components included in the layoutConfig require menus, unless you are hardcoding them.
  Creating the menus in sections so the can be organized differently for different purposes may behelpful.
    - 


------------------------------------------------------------------------------------------------------
*/
const dashboard: MenuItem = { path: "/", label: "Dashboard", icon: faGauge };
const bootstrap: MenuItem = {
  path: "/bootstrap",
  label: "Bootstrap",
  icon: faB,
  items: [
    { path: "/bootstrap-index", label: "Bootstrap" },
    { path: "/bootstrap-backgrounds", label: "Background Colors" },
    { path: "/bootstrap-text", label: "Text" },
    { path: "/bootstrap-buttons", label: "Buttons" },
    { path: "/bootstrap-typography", label: "Typography" },
    { path: "/bootstrap-forms", label: "Forms" },
    { path: "/bootstrap-navs", label: "Navs" },
    { path: "/bootstrap-indicators", label: "Indicators" },
    { path: "/bootstrap-progress", label: "Progress" },
    { path: "/bootstrap-containers", label: "Containers" },
    { path: "/bootstrap-dialogs", label: "Dialogs" },
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
const admin: MenuItem = {
  path: "/admin",
  label: "Admin",
  icon: faGear,
  roles: "Admin",
};

export const genericMenuBase: MenuItem[] = [
  dashboard,
  { group: true, label: "Interface" },
  bootstrap,
  utilities,
  { group: true, label: "Addons" },
  pages,
  charts,
  tables,
  admin,
];

export const sidebarMenuBase: MenuItem[] = [
  dashboard,
  {
    group: true,
    label: "Interface",
    items: [bootstrap, utilities],
  },
  {
    group: true,
    label: "Addons",
    items: [pages, charts, tables],
  },
  admin,
];
