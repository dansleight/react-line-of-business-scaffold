import { Dashboard } from "./pages/Dashboard";
import { Buttons } from "./pages/components/Buttons";
import { Colors } from "./pages/utilities/Colors";
import { Borders } from "./pages/utilities/Borders";
import { Animations } from "./pages/utilities/Animations";
import { Other } from "./pages/utilities/Other";
import { Login } from "./pages/pages/Login";
import { Register } from "./pages/pages/Register";
import { ForgotPassword } from "./pages/pages/ForgotPassword";
import { Page404 } from "./pages/pages/404Page";
import { BlankPage } from "./pages/pages/BlankPage";
import { Charts } from "./pages/Charts";
import { Tables } from "./pages/Tables";
import { Typography } from "./pages/components/Typography";
import { Forms } from "./pages/components/Forms";
import { Navbars } from "./pages/components/Navbars";
import { Navs } from "./pages/components/Navs";
import { Indicators } from "./pages/components/Indicators";
import { Progress } from "./pages/components/Progress";
import { Containers } from "./pages/components/Containers";
import { Dialogs } from "./pages/components/Dialogs";

export const routes = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/components-navbars", component: <Navbars />, title: "Dashboard" },
  { path: "/components-buttons", component: <Buttons />, title: "Dashboard" },
  { path: "/components-typography", component: <Typography />, title: "Dashboard" },
  { path: "/components-forms", component: <Forms />, title: "Dashboard" },
  { path: "/components-navs", component: <Navs />, title: "Dashboard" },
  { path: "/components-indicators", component: <Indicators />, title: "Dashboard" },
  { path: "/components-progress", component: <Progress />, title: "Dashboard" },
  { path: "/components-containers", component: <Containers />, title: "Dashboard" },
  { path: "/components-dialogs", component: <Dialogs />, title: "Dashboard" },
  { path: "/utilities-colors", component: <Colors />, title: "Dashboard" },
  { path: "/utilities-borders", component: <Borders />, title: "Dashboard" },
  { path: "/utilities-animations", component: <Animations />, title: "Dashboard" },
  { path: "/utilities-other", component: <Other />, title: "Dashboard" },
  { path: "/pages-login", component: <Login />, title: "Dashboard" },
  { path: "/pages-register", component: <Register />, title: "Dashboard" },
  { path: "/pages-forgot-password", component: <ForgotPassword />, title: "Dashboard" },
  { path: "/pages-404-page", component: <Page404 />, title: "Dashboard" },
  { path: "/pages-blank-page", component: <BlankPage />, title: "Dashboard" },
  { path: "/charts", component: <Charts />, title: "Dashboard" },
  { path: "/tables", component: <Tables />, title: "Dashboard" },
];
