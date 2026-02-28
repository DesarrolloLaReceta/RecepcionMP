import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./Styles/index.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

async function bootstrap() {
  if (isMock) {
    // ── Modo desarrollo: sin MSAL ────────────────────────────────────────
    const { MockAuthProvider } = await import("./Auth/mockAuth");

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <MockAuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MockAuthProvider>
      </React.StrictMode>
    );
  } else {
    // ── Modo producción: Entra ID ────────────────────────────────────────
    const { MsalProvider } = await import("@azure/msal-react");
    const { msalInstance } = await import("./Services/apiClient");

    await msalInstance.initialize();
    await msalInstance.handleRedirectPromise();

    const { AuthProvider } = await import("./Auth/AuthContext");

    ReactDOM.createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <MsalProvider instance={msalInstance}>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </MsalProvider>
      </React.StrictMode>
    );
  }
}

bootstrap();