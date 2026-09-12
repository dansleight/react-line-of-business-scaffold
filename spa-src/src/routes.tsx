import { Dashboard } from "./pages/Dashboard";
import { ErrorTesting } from "./pages/ErrorTesting";

export const routes: {
  path: string;
  component: React.JSX.Element;
  title: string;
}[] = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/error-testing", component: <ErrorTesting />, title: "Error Testing" },
];
