import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, UserData } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  userId: string | null;
  token: string | null;
  phoneNumber: string | null;
  setPhoneNumber: (phone: string) => void;
  requestCode: (number: string) => Promise<{ success: boolean; message: string }>;
  login: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'breakerbot_token';
const PHONE_KEY = 'breakerbot_phone';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const verifyToken = useCallback(async (storedToken: string) => {
    try {
      const response = await api.auth.verify(storedToken);
      if (response.success && response.valid) {
        setToken(storedToken);
        setUserId(response.userId || null);
        setUser(response.user || null);
        setIsAuthenticated(true);
        return true;
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
    }
    return false;
  }, []);

  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      const storedPhone = localStorage.getItem(PHONE_KEY);
      
      if (storedPhone) {
        setPhoneNumber(storedPhone);
      }

      if (storedToken) {
        await verifyToken(storedToken);
      }
      
      setIsLoading(false);
    };

    init();
  }, [verifyToken]);

  const requestCode = async (number: string): Promise<{ success: boolean; message: string }> => {
    try {
      const fullNumber = number.replace(/\D/g, '');
      setPhoneNumber(fullNumber);
      localStorage.setItem(PHONE_KEY, fullNumber);
      
      const response = await api.auth.getCode(fullNumber);
      return {
        success: response.success,
        message: response.message || 'Código enviado com sucesso!',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao solicitar código',
      };
    }
  };

  const login = async (code: string): Promise<{ success: boolean; message: string }> => {
    if (!phoneNumber) {
      return { success: false, message: 'Número de telefone não encontrado' };
    }

    try {
      const response = await api.auth.login(phoneNumber, code);
      
      if (response.success && response.token) {
        localStorage.setItem(TOKEN_KEY, response.token);
        setToken(response.token);
        setUserId(response.userId || null);
        setUser(response.user || null);
        setIsAuthenticated(true);
        
        return {
          success: true,
          message: 'Login realizado com sucesso!',
        };
      }
      
      return {
        success: false,
        message: response.message || 'Erro ao fazer login',
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao fazer login',
      };
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await api.auth.logout(token);
      } catch {
        // Ignore logout errors
      }
    }
    
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUserId(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    if (!userId) return;
    
    try {
      const response = await api.users.get(userId);
      if (response.success && response.user) {
        setUser(response.user);
      }
    } catch {
      // Ignore refresh errors
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        userId,
        token,
        phoneNumber,
        setPhoneNumber,
        requestCode,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
