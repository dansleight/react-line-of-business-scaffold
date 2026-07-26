import {
  faCubesStacked,
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
const widgets: MenuItem = {
  path: "/widgets",
  label: "Widgets",
  icon: faCubesStacked,
};
const main: MenuItem = {
  path: "/main",
  label: "Main",
  icon: faDumpsterFire,
  items: [
    {
      path: "/main/sub1",
      label: "Sub One",
    },
    {
      path: "/main/sub2",
      label: "Sub Two",
    },
    {
      path: "/main/sub3",
      label: "Sub Three",
    },
  ],
};

export const menusConfig: MenusConfig = {
  mainMenu: [dashboard, widgets, errorTesting, main],
};
