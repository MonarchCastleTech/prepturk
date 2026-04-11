'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  language: string;
  is_active: boolean;
  totp_enabled: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
  display_name?: string;
  language?: string;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

const noopAsync = async () => {};

const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  login: noopAsync,
  register: noopAsync,
  logout: () => {},
  isLoading: false,
  isAuthenticated: false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <AuthContext.Provider value={defaultAuthContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  return ctx;
}
