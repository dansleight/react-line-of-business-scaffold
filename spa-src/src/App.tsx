import "./App.css";
import "./assets/scss/theme.scss";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { NotFound } from "./pages/NotFound";
import { routes } from "./routes";
import { Layout } from "./layout/Layout";
import { useEffect, useState } from "react";
import { MenuItem } from "./models/Interfaces";
import { getUserMenuItems } from "./models/Utilities";
import { genericMenuBase, sidebarMenuBase } from "./menuConfig";

function App() {
  const [sidebarMenu, setSidebarMenu] = useState<MenuItem[]>([]);
  const [navbarMenu, setNavbarMenu] = useState<MenuItem[]>([]);

  useEffect(() => {
    setSidebarMenu(getUserMenuItems(sidebarMenuBase, ["Admin"]));
    setNavbarMenu(getUserMenuItems(genericMenuBase, ["Admin"]));
  }, [genericMenuBase, sidebarMenuBase]);

  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          {routes.map((route, idx) => (
            <Route
              path={route.path}
              key={idx}
              element={
                <Layout
                  title={route.title}
                  sidebarMenu={sidebarMenu}
                  navbarMenu={navbarMenu}
                >
                  {route.component}
                </Layout>
              }
            />
          ))}
          <Route
            path="*"
            element={
              <Layout
                title="Not Found"
                sidebarMenu={sidebarMenu}
                navbarMenu={navbarMenu}
              >
                <NotFound />
              </Layout>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
