import { Dashboard } from "./pages/Dashboard";
import { Widgets } from "./pages/Widgets";
import { ErrorTesting } from "./pages/ErrorTesting";

export const routes = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/widgets", component: <Widgets />, title: "Widgets" },
  { path: "/error-testing", component: <ErrorTesting />, title: "Error Testing" },
];
