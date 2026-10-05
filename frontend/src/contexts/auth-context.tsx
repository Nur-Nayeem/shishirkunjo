"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@/types";
import { authApi } from "@/lib/api";
import { getSessionId } from "@/lib/utils";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "sk_token";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const persist = useCallback((t: string | null, u: User | null) => {
    setToken(t);
    setUser(u);
    if (typeof window !== "undefined") {
      if (t) localStorage.setItem(TOKEN_KEY, t);
      else localStorage.removeItem(TOKEN_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const t =
      token ||
      (typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null);
    if (!t) {
      persist(null, null);
      return;
    }
    try {
      const res = await authApi.me(t);
      persist(t, res.data ?? null);
    } catch {
      persist(null, null);
    }
  }, [token, persist]);

  useEffect(() => {
    (async () => {
      try {
        const t =
          typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
        if (t) {
          const res = await authApi.me(t);
          persist(t, res.data ?? null);
        }
      } catch {
        persist(null, null);
      } finally {
        setLoading(false);
      }
    })();
  }, [persist]);

  const login = useCallback(
    async (email: string, password: string) => {
      const sessionId = getSessionId();
      const res = await authApi.login({ email, password, sessionId });
      const t = res.data?.accessToken ?? null;
      const u = res.data?.user ?? null;
      persist(t, u);
    },
    [persist]
  );

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      password: string;
      phone?: string;
    }) => {
      const res = await authApi.register(data);
      const t = res.data?.accessToken ?? null;
      const u = res.data?.user ?? null;
      persist(t, u);
    },
    [persist]
  );

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout(token);
    } catch {
      /* ignore */
    }
    persist(null, null);
  }, [token, persist]);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout, refreshUser }),
    [user, token, loading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
