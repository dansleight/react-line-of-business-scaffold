import {
  faGauge,
  faExclamationTriangle,
  faCubesStacked,
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
// const admin: MenuItem = {
//   path: "/admin",
//   label: "Admin",
//   icon: faGear,
//   roles: "Admin",
// };
const errorTesting: MenuItem = {
  path: "/error-testing",
  label: "Error Testing",
  icon: faExclamationTriangle,
};
const widgets: MenuItem = {
  path: "/widgets",
  label: "Widgets",
  icon: faCubesStacked,
};

export const genericMenuBase: MenuItem[] = [
  dashboard,
  widgets,
  errorTesting,
];

export const sidebarMenuBase: MenuItem[] = genericMenuBase;
