import {
  faDumpsterFire,
  faExclamationTriangle,
  faGauge,
} from "@fortawesome/free-solid-svg-icons";
import { MenuItem, MenusConfig } from "./models/Interfaces";

const dashboard: MenuItem = { path: "/", label: "Dashboard", icon: faGauge };
const errorTesting: MenuItem = {
  path: "/error-testing",
  label: "Error Testing",
  icon: faExclamationTriangle,
};
const main: MenuItem = {
  path: "/main",
  label: "Main",
  icon: faDumpsterFire,
  items: [
    {
      path: "/main/sub1",
      label: "For Admins",
      roles: "admin",
    },
    {
      path: "/main/sub2",
      label: "For Developors",
      roles: "developer",
    },
    {
      path: "/main/sub3",
      label: "Sub Three",
    },
  ],
};

export const menusConfig: MenusConfig = {
  mainMenu: [dashboard, errorTesting, main],
};
