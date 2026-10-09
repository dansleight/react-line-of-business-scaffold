import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { SettingsProvider } from "./contexts/SettingsContext.tsx";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import { ToastHost } from "./components/ToastHost.tsx";
import { LoadingWrapper } from "./components/LoadingWrapper.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider messageWrapper={LoadingWrapper}>
      <ToastProvider>
        <App />
        <ToastHost />
      </ToastProvider>
    </SettingsProvider>
  </StrictMode>,
);
