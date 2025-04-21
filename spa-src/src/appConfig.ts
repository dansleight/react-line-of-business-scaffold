import { GlobalSettingsModel } from "./apiClient/data-contracts";

export const msalConfig = {
  auth: {
    clientId: "1a3be136-ad1b-4479-824e-4b58d533f67b",
    authority:
      "https://login.microsoftonline.com/1dd101d9-5fe4-4226-b1a3-310d6e0a392d",
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
