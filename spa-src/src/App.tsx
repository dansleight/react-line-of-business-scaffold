import "./App.css";
import "./assets/scss/theme.scss";
import { layoutConfig } from "./layoutConfig";
import { SideBar } from "./layout/sidebar";
import { TopBar } from "./layout/topbar";
import { useSettingsContext } from "./contexts/UseContexts";
import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
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
import { NotFound } from "./pages/NotFound";
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

function App() {
  const { setBodyAttribute, sidebarToggled } = useSettingsContext();

  useEffect(() => {
    if (layoutConfig.includeNavbar) {
      setBodyAttribute("data-navbar-include", "true");
    }
    if (layoutConfig.includeTopbar) {
      setBodyAttribute("data-topbar-include", "true");
    }
    if (layoutConfig.includeSidebar) {
      setBodyAttribute("data-sidebar-include", "true");
      setBodyAttribute(
        "data-sidebar-full",
        layoutConfig.sidebarFull ? "true" : "false",
      );
    }
  }, [layoutConfig]);

  return (
    <>
      <BrowserRouter basename="/">
        {/* Page Wrapper */}
        <div id="wrapper" className={sidebarToggled ? "sidebar-toggled" : ""}>
          {/* If the layout has it, render the sidebar */}
          {layoutConfig.includeSidebar && <SideBar />}

          {/* If the layout has it, render the topbar */}
          {layoutConfig.includeTopbar && <TopBar />}

          {/* Content Wrapper */}
          <div id="content-wrapper" className="d-flex flex-column">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/components-navbars" element={<Navbars />} />
              <Route path="/components-buttons" element={<Buttons />} />
              <Route path="/components-typography" element={<Typography />} />
              <Route path="/components-forms" element={<Forms />} />
              <Route path="/components-navs" element={<Navs />} />
              <Route path="/components-indicators" element={<Indicators />} />
              <Route path="/components-progress" element={<Progress />} />
              <Route path="/components-containers" element={<Containers />} />
              <Route path="/components-dialogs" element={<Dialogs />} />
              <Route path="/utilities-colors" element={<Colors />} />
              <Route path="/utilities-borders" element={<Borders />} />
              <Route path="/utilities-animations" element={<Animations />} />
              <Route path="/utilities-other" element={<Other />} />
              <Route path="/pages-login" element={<Login />} />
              <Route path="/pages-register" element={<Register />} />
              <Route
                path="/pages-forgot-password"
                element={<ForgotPassword />}
              />
              <Route path="/pages-404-page" element={<Page404 />} />
              <Route path="/pages-blank-page" element={<BlankPage />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/tables" element={<Tables />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
