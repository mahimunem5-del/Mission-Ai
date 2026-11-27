import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getAuthHeaders, getAuthToken, setAuthToken } from '../lib/auth';

export interface UserProfileState {
  userName: string;
  userEmail: string;
  planLabel: string;
  avatarInitial: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  updateUserName: (name: string) => Promise<void>;
  setPlanLabel: (plan: string) => void;
  logout: () => void;
}

const PLAN_STORAGE_KEY = 'ai_user_plan';
const NAME_STORAGE_KEY = 'ai_user_name';

const AuthProfileContext = createContext<UserProfileState>({
  userName: 'Munem Mahi',
  userEmail: 'munem.mahi@example.com',
  planLabel: 'Free plan',
  avatarInitial: 'M',
  isAuthenticated: false,
  isLoading: false,
  refreshProfile: async () => {},
  updateUserName: async () => {},
  setPlanLabel: () => {},
  logout: () => {}
});

function formatPlanLabel(raw: string | null): string {
  const val = (raw || 'Free').trim();
  if (val.toLowerCase().includes('plan')) return val;
  return `${val} plan`;
}

export const AuthProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>(() => {
    try {
      return window.localStorage.getItem(NAME_STORAGE_KEY) || 'Munem Mahi';
    } catch {
      return 'Munem Mahi';
    }
  });
  const [userEmail, setUserEmail] = useState<string>('munem.mahi@example.com');
  const [planLabel, setPlanLabelState] = useState<string>(() => {
    try {
      return formatPlanLabel(window.localStorage.getItem(PLAN_STORAGE_KEY));
    } catch {
      return 'Free plan';
    }
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getAuthToken()));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    setIsAuthenticated(Boolean(token));
    setIsLoading(true);
    try {
      const res = await fetch('/api/profile', {
        headers: getAuthHeaders()
      });
      if (!res.ok) return;
      const body = await res.json();
      const profile = body?.data;
      if (profile) {
        if (profile.full_name) {
          setUserName(profile.full_name);
          try {
            window.localStorage.setItem(NAME_STORAGE_KEY, profile.full_name);
          } catch {
            // Ignore
          }
        }
        if (profile.email) setUserEmail(profile.email);
        setIsAuthenticated(true);
      }
    } catch {
      // Keep default/cached profile when offline or unauthenticated
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const updateUserName = useCallback(async (name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setUserName(clean);
    try {
      window.localStorage.setItem(NAME_STORAGE_KEY, clean);
    } catch {
      // Ignore
    }
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ full_name: clean })
      });
    } catch {
      // Ignore if offline/unauthenticated
    }
  }, []);

  const setPlanLabel = useCallback((plan: string) => {
    const normalized = plan.replace(/\s+plan$/i, '').trim() || 'Free';
    try {
      window.localStorage.setItem(PLAN_STORAGE_KEY, normalized);
    } catch {
      // Ignore
    }
    setPlanLabelState(formatPlanLabel(normalized));
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setUserEmail('');
  }, []);

  const avatarInitial = (userName.trim()[0] || 'M').toUpperCase();

  return (
    <AuthProfileContext.Provider
      value={{
        userName,
        userEmail,
        planLabel,
        avatarInitial,
        isAuthenticated,
        isLoading,
        refreshProfile,
        updateUserName,
        setPlanLabel,
        logout
      }}
    >
      {children}
    </AuthProfileContext.Provider>
  );
};

export function useAuthProfile(): UserProfileState {
  return useContext(AuthProfileContext);
}
