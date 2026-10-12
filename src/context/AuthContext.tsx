import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  toggleFavorite: (vehicleId: string) => Promise<void>;
  isFavorite: (vehicleId: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('crystal_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
      } else {
        localStorage.removeItem('crystal_token');
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.warn('Could not fetch user profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('crystal_token', data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Identifiants invalides.' };
    } catch (err: any) {
      return { success: false, error: 'Erreur réseau lors de la connexion.' };
    }
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('crystal_token', data.token);
        return { success: true };
      }
      return { success: false, error: data.error || 'Erreur lors de la création.' };
    } catch (err: any) {
      return { success: false, error: 'Erreur réseau lors de l’inscription.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('crystal_token');
    setToken(null);
    setUser(null);
  };

  const toggleFavorite = async (vehicleId: string) => {
    if (!token || !user) return;
    try {
      const res = await fetch(`/api/v1/auth/favorites/${vehicleId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.favorites) {
        setUser({ ...user, favorites: data.favorites });
      }
    } catch (e) {
      console.warn('Favorite toggle error:', e);
    }
  };

  const isFavorite = (vehicleId: string): boolean => {
    return !!user?.favorites?.includes(vehicleId);
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        toggleFavorite,
        isFavorite,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
