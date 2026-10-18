import {
  faExclamationTriangle,
  faGauge,
  faPalette,
} from "@fortawesome/free-solid-svg-icons";
import { MenuItem, MenusConfig } from "./models/Interfaces";

const dashboard: MenuItem = { path: "/", label: "Dashboard", icon: faGauge };
const errorTesting: MenuItem = {
  path: "/error-testing",
  label: "Error Testing",
  icon: faExclamationTriangle,
};
const themeLab: MenuItem = {
  path: "/samples",
  label: "Theme Lab",
  icon: faPalette,
  items: [
    { path: "/samples/gallery", label: "Overview" },
    { path: "/samples/icons", label: "Icons" },
    { path: "/samples/buttons", label: "Buttons" },
    { path: "/samples/backgrounds", label: "Backgrounds" },
    { path: "/samples/typography", label: "Typography" },
    { path: "/samples/forms", label: "Forms" },
    { path: "/samples/indicators", label: "Indicators" },
    { path: "/samples/navs", label: "Navs" },
    { path: "/samples/tables", label: "Tables" },
    { path: "/samples/datagrid", label: "Data Grid" },
    { path: "/samples/dialogs", label: "Dialogs" },
    { path: "/samples/progress", label: "Progress" },
    { path: "/samples/containers", label: "Containers" },
  ],
};

export const menusConfig: MenusConfig = {
  mainMenu: [dashboard, themeLab, errorTesting],
};
