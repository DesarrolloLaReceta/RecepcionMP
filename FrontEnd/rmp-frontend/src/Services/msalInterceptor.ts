import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { msalConfig, silentRequest, loginRequest } from "../Auth/msalConfig";
import { apiClient } from "./apiClient";

export let msalInstance: PublicClientApplication | null = null;

export function initMsal() {
  msalInstance = new PublicClientApplication(msalConfig);
  apiClient.interceptors.request.use(
    async (config) => {
      if (!msalInstance) return config;
      const account = msalInstance.getActiveAccount();
      if (!account) return config;

      try {
        const result = await msalInstance.acquireTokenSilent({
          ...silentRequest,
          account,
        });
        config.headers["Authorization"] = `Bearer ${result.accessToken}`;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          await msalInstance.acquireTokenRedirect(loginRequest);
        }
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        msalInstance?.loginRedirect(loginRequest);
      }
      if (error.response?.status === 403) {
        console.warn("[API] Acceso denegado — rol insuficiente");
      }
      return Promise.reject(error);
    }
  );
}