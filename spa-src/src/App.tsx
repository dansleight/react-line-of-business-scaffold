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
import { msalConfig } from "./appConfig";
import {
  AuthenticationResult,
  EventMessage,
  EventType,
  PublicClientApplication,
} from "@azure/msal-browser";
import {
  AuthenticatedTemplate,
  MsalProvider,
  UnauthenticatedTemplate,
} from "@azure/msal-react";
import { IdentityProvider } from "./contexts/IdentityContext";
import { SessionProvider } from "./contexts/SessionContext";
import { LoadingWrapper } from "./components/LoadingWrapper";
import { useSettingsContext } from "./contexts/UseContexts";

function App() {
  const [sidebarMenu, setSidebarMenu] = useState<MenuItem[]>([]);
  const [navbarMenu, setNavbarMenu] = useState<MenuItem[]>([]);
  const { globalSettings } = useSettingsContext();

  const msalConfigFull = {
    ...msalConfig,
    redirectUri: window.location.origin,
  };

  if (globalSettings.msalSettings !== null) {
    msalConfigFull.auth.clientId = globalSettings.msalSettings.clientId;
    msalConfigFull.auth.authority = globalSettings.msalSettings.authority;
  }
  const msalInstance = new PublicClientApplication(msalConfigFull);

  msalInstance.addEventCallback((event: EventMessage) => {
    if (
      msalInstance?.getAllAccounts().length > 0 &&
      event.eventType === EventType.LOGIN_SUCCESS &&
      event.payload
    ) {
      const payload = event.payload as AuthenticationResult;
      const account = payload.account;
      msalInstance?.setActiveAccount(account);
    }
  });

  useEffect(() => {
    setSidebarMenu(getUserMenuItems(sidebarMenuBase, ["Admin"]));
    setNavbarMenu(getUserMenuItems(genericMenuBase, ["Admin"]));
  }, [genericMenuBase, sidebarMenuBase]);

  return (
    <>
      <MsalProvider instance={msalInstance}>
        <BrowserRouter basename="/">
          <IdentityProvider messageWrapper={LoadingWrapper}>
            <AuthenticatedTemplate>
              <SessionProvider messageWrapper={LoadingWrapper}>
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
              </SessionProvider>
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
              <em>Unauthenticated, please refresh.</em>
            </UnauthenticatedTemplate>
          </IdentityProvider>
        </BrowserRouter>
      </MsalProvider>
    </>
  );
}

export default App;
