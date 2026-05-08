import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { authApi, profileApi, type UserProfile } from '../api/services';
import { storage } from '../api/storage';
import type { UserRole } from '@/shared/types/navigation';

type AuthState = {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: UserProfile | null;
  role: UserRole | null;
};

type AuthContextType = AuthState & {
  login: (user: UserProfile, role: UserRole) => void;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateUser: (data: Partial<UserProfile>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isAuthenticated: false,
    user: null,
    role: null,
  });

  // On app start — restore session from storage
  useEffect(() => {
    (async () => {
      try {
        const [token, profile, role] = await Promise.all([
          storage.getAccessToken(),
          storage.getUserProfile<UserProfile>(),
          storage.getUserRole(),
        ]);

        if (token && profile && role) {
          setState({
            isLoading: false,
            isAuthenticated: true,
            user: profile,
            role: role as UserRole,
          });
        } else {
          setState((s) => ({ ...s, isLoading: false }));
        }
      } catch {
        // Storage unavailable — start fresh
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const login = useCallback((user: UserProfile, role: UserRole) => {
    setState({ isLoading: false, isAuthenticated: true, user, role });
  }, []);

  const logout = useCallback(async () => {
    const accessToken = await storage.getAccessToken();
    await storage.clearAll();
    setState({ isLoading: false, isAuthenticated: false, user: null, role: null });
    void authApi.logout(accessToken);
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const token = await storage.getAccessToken();
      if (!token) return;
      const profile = await profileApi.get();
      await storage.setUserProfile(profile);
      setState((s) => ({ ...s, user: profile }));
    } catch (err: any) {
      // Session expired — force logout
      if (err?.message === 'SESSION_EXPIRED') {
        await storage.clearAll();
        setState({ isLoading: false, isAuthenticated: false, user: null, role: null });
      }
      // Other errors: silently fail — use cached profile
    }
  }, []);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshProfile();
      }
    });
    // Poll every 30s while active so admin updates show up in the app without being too aggressive.
    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        void refreshProfile();
      }
    }, 30000);
    return () => {
      sub.remove();
      clearInterval(interval);
    };
  }, [refreshProfile]);

  const updateUser = useCallback((data: Partial<UserProfile>) => {
    setState((s) => {
      const updated = s.user ? { ...s.user, ...data } : null;
      if (updated) storage.setUserProfile(updated);
      return { ...s, user: updated };
    });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshProfile, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
