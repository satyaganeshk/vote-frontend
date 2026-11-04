import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { User, Role, AuthResponse, VoterLoginPayload, CredentialLoginPayload } from '../models';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  loginVoter: (payload: VoterLoginPayload) => Promise<{ success: boolean; error?: string }>;
  loginCredential: (payload: CredentialLoginPayload) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'election_auth_token';
const USER_KEY = 'election_auth_user';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = sessionStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const logoutTimerRef = useRef<number | null>(null);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // Decode JWT expiry and set auto-logout timer
  const scheduleAutoLogout = useCallback((jwtToken: string) => {
    if (logoutTimerRef.current) {
      window.clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    try {
      const parts = jwtToken.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp) {
          const expiresAtMs = payload.exp * 1000;
          const timeoutMs = expiresAtMs - Date.now();
          if (timeoutMs <= 0) {
            logout();
            return;
          }
          logoutTimerRef.current = window.setTimeout(() => {
            logout();
          }, timeoutMs);
        }
      }
    } catch (err) {
      console.error('Failed to parse token expiry', err);
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      scheduleAutoLogout(token);
    }
    return () => {
      if (logoutTimerRef.current) {
        window.clearTimeout(logoutTimerRef.current);
      }
    };
  }, [token, scheduleAutoLogout]);

  const handleAuthSuccess = (data: AuthResponse) => {
    sessionStorage.setItem(TOKEN_KEY, data.token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    scheduleAutoLogout(data.token);
  };

  // Voter login with Voter ID and PIN
  const loginVoter = async (payload: VoterLoginPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/voter-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return { success: false, error: 'Invalid voter ID or PIN. Please check and try again.' };
      }

      const data: AuthResponse = await res.json();
      handleAuthSuccess(data);
      return { success: true };
    } catch {
      return { success: false, error: 'Invalid voter ID or PIN. Please check and try again.' };
    }
  };

  // Admin / Candidate login with Email and Password
  const loginCredential = async (payload: CredentialLoginPayload): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        return { success: false, error: 'Invalid email or password. Please check and try again.' };
      }

      const data: AuthResponse = await res.json();
      handleAuthSuccess(data);
      return { success: true };
    } catch {
      return { success: false, error: 'Invalid email or password. Please check and try again.' };
    }
  };

  // Re-fetches the current user from the backend, so state like hasVoted
  // reflects the database rather than an optimistic local guess.
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) return;
      const data: { user: User } = await res.json();
      setUser(data.user);
      sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
    } catch (err) {
      console.error('Failed to refresh session user', err);
    }
  }, [token, logout]);

  const role = user ? user.role : null;
  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        loginVoter,
        loginCredential,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
