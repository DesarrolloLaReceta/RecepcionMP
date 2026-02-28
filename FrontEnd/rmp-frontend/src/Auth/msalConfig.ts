import { type Configuration, type PopupRequest, LogLevel } from "@azure/msal-browser";

// ─── CONFIGURACIÓN ENTRA ID ──────────────────────────────────────────────────
// Reemplaza estos valores con los de tu App Registration en Azure Portal
// Azure Portal → Entra ID → App Registrations → Tu App

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || "TU_CLIENT_ID",
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || "TU_TENANT_ID"}`,
    redirectUri: import.meta.env.VITE_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: window.location.origin
  },
  cache: {
    cacheLocation: "sessionStorage" // sessionStorage más seguro que localStorage
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (import.meta.env.DEV) {
          switch (level) {
            case LogLevel.Error:   console.error("[MSAL]", message); break;
            case LogLevel.Warning: console.warn("[MSAL]", message);  break;
            case LogLevel.Info:    console.info("[MSAL]", message);  break;
            case LogLevel.Verbose: console.debug("[MSAL]", message); break;
          }
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Warning : LogLevel.Error,
    },
  },
};

// ─── SCOPES ──────────────────────────────────────────────────────────────────
// El scope de tu API backend expuesto en Entra ID
// Azure Portal → App Registration (backend) → Expose an API → Add a scope

export const apiScopes = [
  import.meta.env.VITE_API_SCOPE || "api://TU_API_CLIENT_ID/access_as_user",
];

export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email", ...apiScopes],
};

export const silentRequest = {
  scopes: apiScopes,
};

// ─── ROLES DEL SISTEMA (deben coincidir con los claims de Entra ID) ───────────
export const AppRoles = {
  Administrador: "Administrador",
  Calidad:       "Calidad",
  Recepcion:     "Recepcion",
  Compras:       "Compras",
  Auditor:       "Auditor",
} as const;

export type AppRole = (typeof AppRoles)[keyof typeof AppRoles];