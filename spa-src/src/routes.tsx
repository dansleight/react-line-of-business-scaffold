import { ComponentType, lazy, type LazyExoticComponent } from "react";

/** Dynamic import for a named page export so the screen is its own chunk. */
export function lazyPage<M extends Record<string, unknown>>(
  loader: () => Promise<M>,
  exportName: keyof M & string,
): LazyExoticComponent<ComponentType> {
  return lazy(async () => {
    const mod = await loader();
    return { default: mod[exportName] as ComponentType };
  });
}

export const routes: {
  path: string;
  Component: LazyExoticComponent<ComponentType>;
  title: string;
}[] = [
  { path: "/", Component: lazyPage(() => import("./pages/Dashboard"), "Dashboard"), title: "Dashboard" },
  { path: "/about", Component: lazyPage(() => import("./pages/About"), "About"), title: "About" },
  { path: "/jwt", Component: lazyPage(() => import("./pages/Jwt"), "Jwt"), title: "JWT Token Info" },
  { path: "/error-testing", Component: lazyPage(() => import("./pages/ErrorTesting"), "ErrorTesting"), title: "Error Testing" },
  { path: "/samples/gallery", Component: lazyPage(() => import("./pages/samples/ThemeGallery"), "ThemeGallery"), title: "Theme Lab" },
  { path: "/samples/buttons", Component: lazyPage(() => import("./pages/samples/Buttons"), "Buttons"), title: "Buttons" },
  { path: "/samples/backgrounds", Component: lazyPage(() => import("./pages/samples/Backgrounds"), "Backgrounds"), title: "Backgrounds" },
  { path: "/samples/typography", Component: lazyPage(() => import("./pages/samples/Typography"), "Typography"), title: "Typography" },
  { path: "/samples/forms", Component: lazyPage(() => import("./pages/samples/Forms"), "Forms"), title: "Forms" },
  { path: "/samples/icons", Component: lazyPage(() => import("./pages/samples/Icons"), "Icons"), title: "Icons" },
  { path: "/samples/indicators", Component: lazyPage(() => import("./pages/samples/Indicators"), "Indicators"), title: "Indicators" },
  { path: "/samples/navs", Component: lazyPage(() => import("./pages/samples/Navs"), "Navs"), title: "Navs" },
  { path: "/samples/tables", Component: lazyPage(() => import("./pages/samples/Tables"), "Tables"), title: "Tables" },
  { path: "/samples/datagrid", Component: lazyPage(() => import("./pages/samples/DataGrid"), "DataGridSample"), title: "Data Grid" },
  { path: "/samples/dialogs", Component: lazyPage(() => import("./pages/samples/Dialogs"), "Dialogs"), title: "Dialogs" },
  { path: "/samples/progress", Component: lazyPage(() => import("./pages/samples/Progress"), "Progress"), title: "Progress" },
  { path: "/samples/containers", Component: lazyPage(() => import("./pages/samples/Containers"), "Containers"), title: "Containers" },
];
