import { About } from "./pages/About";
import { Dashboard } from "./pages/Dashboard";
import { ErrorTesting } from "./pages/ErrorTesting";
import { Jwt } from "./pages/Jwt";

export const routes: {
  path: string;
  component: React.JSX.Element;
  title: string;
}[] = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/about", component: <About />, title: "About" },
  { path: "/jwt", component: <Jwt />, title: "JWT Token Info" },
  { path: "/error-testing", component: <ErrorTesting />, title: "Error Testing" },
];
