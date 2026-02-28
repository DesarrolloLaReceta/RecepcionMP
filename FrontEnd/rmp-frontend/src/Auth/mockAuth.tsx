/**
 * mockAuth.tsx — Provider de autenticación simulada para desarrollo local.
 *
 * Provee directamente a AuthContext (de AuthContext.tsx) para que useAuth()
 * funcione igual que en producción sin cambiar ningún componente.
 *
 * Activar con: VITE_USE_MOCK_AUTH=true en .env.local
 * ⚠️  NO incluir en builds de producción.
 */

import React, { createContext, useContext, useState } from "react";
import { AuthContext, type AuthContextValue } from "./AuthContext";
import { AppRoles, type AppRole } from "./msalConfig";

// ─── USUARIOS DE PRUEBA ───────────────────────────────────────────────────────

export const MOCK_USERS = [
  {
    id:          "usr-001",
    displayName: "Carlos Mendoza",
    email:       "c.mendoza@empresa.com",
    roles:       [AppRoles.Administrador] as AppRole[],
    initials:    "CM",
  },
  {
    id:          "usr-002",
    displayName: "Laura Gómez",
    email:       "l.gomez@empresa.com",
    roles:       [AppRoles.Calidad] as AppRole[],
    initials:    "LG",
  },
  {
    id:          "usr-003",
    displayName: "Andrés Torres",
    email:       "a.torres@empresa.com",
    roles:       [AppRoles.Recepcion] as AppRole[],
    initials:    "AT",
  },
  {
    id:          "usr-004",
    displayName: "Patricia Silva",
    email:       "p.silva@empresa.com",
    roles:       [AppRoles.Compras] as AppRole[],
    initials:    "PS",
  },
  {
    id:          "usr-005",
    displayName: "Javier Ruiz",
    email:       "j.ruiz@empresa.com",
    roles:       [AppRoles.Auditor] as AppRole[],
    initials:    "JR",
  },
];

export type MockUser = (typeof MOCK_USERS)[number];

// ─── CONTEXTO INTERNO (solo para setMockUser) ─────────────────────────────────
// Separado de AuthContext para que MockLoginPage pueda acceder a setMockUser
// sin romper la interfaz pública de AuthContextValue.

interface MockInternalValue {
  currentUser: MockUser | null;
  setMockUser: (user: MockUser) => void;
}

const MockInternalContext = createContext<MockInternalValue | null>(null);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  const isAuthenticated = currentUser !== null;

  const hasRole = (role: AppRole | AppRole[]): boolean => {
    if (!currentUser) return false;
    const required = Array.isArray(role) ? role : [role];
    return required.some((r) => currentUser.roles.includes(r));
  };

  const getAccessToken = async (): Promise<string> =>
    `mock-token-${currentUser?.id ?? "anonymous"}-${Date.now()}`;

  const login  = async () => { /* MockLoginPage maneja el login */ };
  const logout = () => setCurrentUser(null);

  // Valor que provee al AuthContext público — misma interfaz que producción
  const authValue: AuthContextValue = {
    account:         currentUser
                       ? { name: currentUser.displayName, username: currentUser.email }
                       : null,
    isAuthenticated,
    isLoading:       false,
    displayName:     currentUser?.displayName ?? "",
    email:           currentUser?.email       ?? "",
    roles:           currentUser?.roles       ?? [],
    initials:        currentUser?.initials    ?? "",
    hasRole,
    getAccessToken,
    login,
    logout,
  };

  return (
    // AuthContext: el contexto público que usan todos los componentes vía useAuth()
    <AuthContext.Provider value={authValue}>
      {/* MockInternalContext: solo lo consume MockLoginPage para setMockUser */}
      <MockInternalContext.Provider value={{ currentUser, setMockUser: setCurrentUser }}>
        {children}
      </MockInternalContext.Provider>
    </AuthContext.Provider>
  );
}

// ─── HOOK INTERNO (solo MockLoginPage) ───────────────────────────────────────

export function useMockAuth(): MockInternalValue {
  const ctx = useContext(MockInternalContext);
  if (!ctx) throw new Error("useMockAuth debe usarse dentro de <MockAuthProvider>");
  return ctx;
}