import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient } from '../Services/apiClient';

// ─── TIPOS ACTUALIZADOS PARA ACTIVE DIRECTORY ─────────────────────────────────

// Ahora AppRole usa los nombres de tus grupos de AD
export type AppRole = 
  | "App_Recepcion_LE"
  | "App_Calidad_LE"
  | "Sistemas_LE"
  | "Auditoria_LE"
  | "Compras_LE";

interface User {
  nombre: string;
  grupos: string[]; // Cambiamos 'perfil' por el array de grupos del AD
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  displayName: string;
  email: string;
  roles: string[]; // Lista de grupos activos
  initials: string;
  hasRole: (role: AppRole | AppRole[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(n => n.length > 0)
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
        // Recuperamos nombre y la lista de grupos
        setUser({ nombre: parsed.nombre, grupos: parsed.grupos || [] });
      } catch (e) {
        console.error('Error al parsear el usuario almacenado', e);
        localStorage.clear();
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    // La API ahora devuelve: { token, nombre, perfil, grupos }
    const response = await apiClient.post('/api/auth/login', { username, password });
    const { token, nombre, grupos } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ nombre, grupos }));
    
    setUser({ nombre, grupos });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const hasRole = useCallback((role: AppRole | AppRole[]): boolean => {
    if (!user?.grupos) return false;
    const required = Array.isArray(role) ? role : [role];
    // Verificamos si el usuario tiene al menos uno de los grupos requeridos del AD
    return required.some(r => user.grupos.includes(r));
  }, [user]);

  const displayName = user?.nombre || '';
  const email = ''; 
  const roles = user?.grupos || [];
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

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};