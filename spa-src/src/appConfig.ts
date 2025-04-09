import { GlobalSettingsModel } from "./apiClient/data-contracts";

export const msalConfig = {
  auth: {
    clientId: "451a8bf4-764e-45d0-966a-2f74fc7b244a",
    authority:
      "https://login.microsoftonline.com/0b0909e0-dd06-4f45-95c2-2d440471413d",
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

// not sure if we need this or not, consider that we'll probably use gravatar by default, rather than reach out to the graph endpoint for the avatar, and we should have the user info in the claims
export const loginRequest = {
  scopes: ["User.Read"],
};

export const webApiConfig = {
  origin: import.meta.env.DEV
    ? import.meta.env.VITE_API_ORIGIN && import.meta.env.VITE_API_ORIGIN != ""
      ? import.meta.env.VITE_API_ORIGIN
      : "http://localhost:5041"
    : "",
};

export const defaultGlobalSettings: GlobalSettingsModel = {
  applicationMode: "Development",
  msalSettings: null,
};
