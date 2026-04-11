import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../Services/apiClient';

// ─── TIPOS ────────────────────────────────────────────────────────────────────

export type AppRole = 
  | "Administrador"
  | "Calidad"
  | "Auditor"
  | "Compras"
  | "RecepcionAlmacen";

interface User {
  nombre: string;
  perfil: AppRole;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  displayName: string;
  email: string;
  roles: AppRole[];
  initials: string;
  hasRole: (role: AppRole | AppRole[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// ─── CONTEXTO ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── HELPER ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();
}

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser({ nombre: parsed.nombre, perfil: parsed.perfil });
      } catch (e) {
        console.error('Error parsing stored user', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const response = await apiClient.post('/api/auth/login', { username, password });
    const { token, nombre, perfil } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ nombre, perfil }));
    setUser({ nombre, perfil });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const hasRole = useCallback((role: AppRole | AppRole[]): boolean => {
    if (!user?.perfil) return false;
    const required = Array.isArray(role) ? role : [role];
    return required.includes(user.perfil);
  }, [user]);

  const displayName = user?.nombre || '';
  const email = ''; // El backend no devuelve email por defecto; podrías agregarlo si lo tienes
  const roles = user?.perfil ? [user.perfil] : [];
  const initials = getInitials(displayName);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    displayName,
    email,
    roles,
    initials,
    hasRole,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─── ROLE GUARD (opcional) ────────────────────────────────────────────────────

interface RoleGuardProps {
  roles: AppRole | AppRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ roles, fallback = null, children }) => {
  const { hasRole } = useAuth();
  return hasRole(roles) ? <>{children}</> : <>{fallback}</>;
};