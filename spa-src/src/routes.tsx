import { About } from "./pages/About";
import { Dashboard } from "./pages/Dashboard";
import { ErrorTesting } from "./pages/ErrorTesting";

export const routes: {
  path: string;
  component: React.JSX.Element;
  title: string;
}[] = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/about", component: <About />, title: "About" },
  { path: "/error-testing", component: <ErrorTesting />, title: "Error Testing" },
];
