/**
 * AuthContext.tsx — Interfaz unificada de autenticación.
 *
 * En DEV  (VITE_USE_MOCK_AUTH=true): MockAuthProvider (mockAuth.tsx) provee
 *                                    directamente a AuthContext — sin MSAL.
 * En PROD / staging:                 MsalAuthProvider usa Entra ID (Azure AD).
 *
 * Todos los componentes importan siempre desde este archivo:
 *   import { useAuth, AuthProvider, RoleGuard } from "../Auth/AuthContext"
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
} from "react";
import {
  useMsal,
  useIsAuthenticated,
  useAccount,
} from "@azure/msal-react";
import {
  InteractionRequiredAuthError,
  type AccountInfo,
} from "@azure/msal-browser";
import { silentRequest, loginRequest, type AppRole } from "./msalConfig";

// ─── INTERFAZ DEL CONTEXTO ────────────────────────────────────────────────────

export interface AuthContextValue {
  account:          AccountInfo | { name: string; username: string } | null;
  isAuthenticated:  boolean;
  isLoading:        boolean;
  displayName:      string;
  email:            string;
  roles:            string[];
  initials:         string;
  hasRole:          (role: AppRole | AppRole[]) => boolean;
  getAccessToken:   () => Promise<string>;
  login:            () => Promise<void>;
  logout:           () => void;
}

/**
 * Contexto exportado para que MockAuthProvider pueda proveer
 * al mismo contexto sin duplicar la interfaz.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── HOOK PÚBLICO ─────────────────────────────────────────────────────────────

/**
 * Hook principal de autenticación — funciona igual en dev (mock) y prod (MSAL).
 *
 * @throws Si se usa fuera de `<AuthProvider>` o `<MockAuthProvider>`.
 *
 * @example
 * const { displayName, roles, hasRole, logout } = useAuth();
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error(
      "useAuth debe usarse dentro de <AuthProvider> o <MockAuthProvider>"
    );
  }
  return ctx;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map(n => n[0])
    .join("")
    .toUpperCase();
}

// ─── PROVIDER REAL (MSAL / Entra ID) ─────────────────────────────────────────

function MsalAuthProvider({ children }: { children: React.ReactNode }) {
  const { instance, inProgress } = useMsal();
  const isAuthenticated           = useIsAuthenticated();
  const account                   = useAccount(instance.getActiveAccount() ?? {});
  const isLoading                 = inProgress !== "none";

  const roles: string[] = useMemo(() => {
    const claims = account?.idTokenClaims as Record<string, unknown> | undefined;
    const r      = claims?.["roles"];
    return Array.isArray(r) ? (r as string[]) : [];
  }, [account]);

  const displayName = account?.name     ?? account?.username ?? "";
  const email       = account?.username ?? "";
  const initials    = getInitials(displayName);

  const hasRole = useCallback(
    (role: AppRole | AppRole[]) => {
      const req = Array.isArray(role) ? role : [role];
      return req.some(r => roles.includes(r));
    },
    [roles]
  );

  const getAccessToken = useCallback(async (): Promise<string> => {
    const active = instance.getActiveAccount();
    if (!active) throw new Error("No hay cuenta activa.");
    try {
      const res = await instance.acquireTokenSilent({
        ...silentRequest,
        account: active,
      });
      return res.accessToken;
    } catch (err) {
      if (err instanceof InteractionRequiredAuthError) {
        const res = await instance.acquireTokenPopup({
          ...loginRequest,
          account: active,
        });
        return res.accessToken;
      }
      throw err;
    }
  }, [instance]);

  const login = useCallback(async () => {
    await instance.loginRedirect(loginRequest);
  }, [instance]);

  const logout = useCallback(() => {
    instance.logoutRedirect({ postLogoutRedirectUri: window.location.origin });
  }, [instance]);

  // Establece la cuenta activa si aún no está definida
  React.useEffect(() => {
    const accounts = instance.getAllAccounts();
    if (accounts.length > 0 && !instance.getActiveAccount()) {
      instance.setActiveAccount(accounts[0]);
    }
  }, [instance]);

  return (
    <AuthContext.Provider
      value={{
        account,
        isAuthenticated,
        isLoading,
        displayName,
        email,
        roles,
        initials,
        hasRole,
        getAccessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── PROVIDER EXPORTADO ───────────────────────────────────────────────────────
// Usado en PRODUCCIÓN — main.tsx lo monta dentro de <MsalProvider>.
// En desarrollo, main.tsx monta <MockAuthProvider> directamente.

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <MsalAuthProvider>{children}</MsalAuthProvider>;
}

// ─── ROLE GUARD ───────────────────────────────────────────────────────────────

interface RoleGuardProps {
  roles:     AppRole | AppRole[];
  fallback?: React.ReactNode;
  children:  React.ReactNode;
}

/**
 * Renderiza `children` solo si el usuario tiene al menos uno de los roles.
 * Útil para ocultar secciones de UI sin redirigir.
 *
 * @example
 * <RoleGuard roles={[AppRoles.Calidad, AppRoles.Administrador]}>
 *   <BotonLiberar />
 * </RoleGuard>
 */
export function RoleGuard({ roles, fallback = null, children }: RoleGuardProps) {
  const { hasRole } = useAuth();
  return hasRole(roles) ? <>{children}</> : <>{fallback}</>;
}