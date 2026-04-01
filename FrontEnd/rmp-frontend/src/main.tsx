import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./Styles/index.css";

const isMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

async function bootstrap() {
  if (isMock) {
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
    const { MsalProvider } = await import("@azure/msal-react");
    const { initMsal, msalInstance } = await import("./Services/msalInterceptor");
    initMsal();
    if (!msalInstance) throw new Error("MSAL instance not initialized");
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