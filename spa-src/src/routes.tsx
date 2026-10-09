import { About } from "./pages/About";
import { Dashboard } from "./pages/Dashboard";
import { ErrorTesting } from "./pages/ErrorTesting";
import { Jwt } from "./pages/Jwt";
import { Backgrounds } from "./pages/samples/Backgrounds";
import { Buttons } from "./pages/samples/Buttons";
import { Containers } from "./pages/samples/Containers";
import { Dialogs } from "./pages/samples/Dialogs";
import { Forms } from "./pages/samples/Forms";
import { Indicators } from "./pages/samples/Indicators";
import { Navs } from "./pages/samples/Navs";
import { Progress } from "./pages/samples/Progress";
import { Tables } from "./pages/samples/Tables";
import { ThemeGallery } from "./pages/samples/ThemeGallery";
import { Typography } from "./pages/samples/Typography";

export const routes: {
  path: string;
  component: React.JSX.Element;
  title: string;
}[] = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/about", component: <About />, title: "About" },
  { path: "/jwt", component: <Jwt />, title: "JWT Token Info" },
  { path: "/error-testing", component: <ErrorTesting />, title: "Error Testing" },
  { path: "/samples/gallery", component: <ThemeGallery />, title: "Theme Lab" },
  { path: "/samples/buttons", component: <Buttons />, title: "Buttons" },
  {
    path: "/samples/backgrounds",
    component: <Backgrounds />,
    title: "Backgrounds",
  },
  {
    path: "/samples/typography",
    component: <Typography />,
    title: "Typography",
  },
  { path: "/samples/forms", component: <Forms />, title: "Forms" },
  {
    path: "/samples/indicators",
    component: <Indicators />,
    title: "Indicators",
  },
  { path: "/samples/navs", component: <Navs />, title: "Navs" },
  { path: "/samples/tables", component: <Tables />, title: "Tables" },
  { path: "/samples/dialogs", component: <Dialogs />, title: "Dialogs" },
  { path: "/samples/progress", component: <Progress />, title: "Progress" },
  {
    path: "/samples/containers",
    component: <Containers />,
    title: "Containers",
  },
];
