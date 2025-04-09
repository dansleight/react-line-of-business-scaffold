import { Dashboard } from "./pages/Dashboard";
import { Buttons } from "./pages/bootstrap/Buttons";
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
import { Typography } from "./pages/bootstrap/Typography";
import { Forms } from "./pages/components/Forms";
import { Navs } from "./pages/components/Navs";
import { Indicators } from "./pages/components/Indicators";
import { Progress } from "./pages/components/Progress";
import { Containers } from "./pages/components/Containers";
import { Dialogs } from "./pages/components/Dialogs";
import { Backgrounds } from "./pages/bootstrap/Backgrounds";
import { Text } from "./pages/bootstrap/Text";
import { General } from "./pages/bootstrap/General";
import { Chat } from "./pages/Chat";

export const routes = [
  { path: "/", component: <Dashboard />, title: "Dashboard" },
  { path: "/bootstrap-index", component: <General />, title: "Bootstrap" },
  { path: "/bootstrap-backgrounds", component: <Backgrounds />, title: "Background Colors" },
  { path: "/bootstrap-text", component: <Text />, title: "Text" },
  { path: "/bootstrap-buttons", component: <Buttons />, title: "Buttons" },
  { path: "/bootstrap-typography", component: <Typography />, title: "Typography" },
  { path: "/bootstrap-forms", component: <Forms />, title: "Forms" },
  { path: "/bootstrap-navs", component: <Navs />, title: "Navs" },
  { path: "/bootstrap-indicators", component: <Indicators />, title: "Indicators" },
  { path: "/bootstrap-progress", component: <Progress />, title: "Progress" },
  { path: "/bootstrap-containers", component: <Containers />, title: "Containers" },
  { path: "/bootstrap-dialogs", component: <Dialogs />, title: "Dialogs" },
  { path: "/utilities-colors", component: <Colors />, title: "Colors" },
  { path: "/utilities-borders", component: <Borders />, title: "Borders" },
  { path: "/utilities-animations", component: <Animations />, title: "Animations" },
  { path: "/utilities-other", component: <Other />, title: "Others" },
  { path: "/pages-login", component: <Login />, title: "Login" },
  { path: "/pages-register", component: <Register />, title: "Register" },
  { path: "/pages-forgot-password", component: <ForgotPassword />, title: "Forgot Password" },
  { path: "/pages-404-page", component: <Page404 />, title: "404" },
  { path: "/pages-blank-page", component: <BlankPage />, title: "Blank" },
  { path: "/charts", component: <Charts />, title: "Charts" },
  { path: "/tables", component: <Tables />, title: "Tables" },
  { path: "/chat", component: <Chat />, title: "Chat" },
];
