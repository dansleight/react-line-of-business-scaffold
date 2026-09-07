import { Dashboard } from "./pages/Dashboard";
import { ErrorTesting } from "./pages/ErrorTesting";

export const routes = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/error-testing", component: <ErrorTesting />, title: "Error Testing" },
];
