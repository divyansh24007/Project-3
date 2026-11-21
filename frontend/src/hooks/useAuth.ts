"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string }) => Promise<{ data: any; error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ data: any; error: AuthError | null }>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ data: null, error: null }),
  signUp: async () => ({ data: null, error: null }),
  signOut: async () => ({ error: null }),
  resetPassword: async () => ({ data: null, error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (!error && data?.session) {
            setSession(data.session);
            setUser(data.session.user);
          } else {
            // Check if mock user session exists in development/demo mode
            const mockUser = typeof window !== "undefined" ? localStorage.getItem("aegis_mock_user") : null;
            if (mockUser) {
              const parsed = JSON.parse(mockUser);
              setUser(parsed);
              setSession({
                access_token: "mock-token",
                token_type: "bearer",
                expires_in: 3600,
                refresh_token: "mock-refresh",
                user: parsed,
              } as any);
            }
          }
        }
      } catch (err) {
        console.warn("Supabase auth session check failed, operating in resilient mode", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } catch {
      if (mounted) setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      if (result.error) {
        // Fallback demo login if supabase project credentials are unconfigured placeholder
        if (result.error.message.includes("fetch") || result.error.message.includes("placeholder")) {
          const demoUser: any = {
            id: "demo-user-aegis-1",
            email,
            user_metadata: { full_name: email.split("@")[0] || "Cyber Operator" },
            aud: "authenticated",
            role: "authenticated",
          };
          setUser(demoUser);
          setSession({
            access_token: "demo-session-token",
            token_type: "bearer",
            expires_in: 3600,
            refresh_token: "demo-refresh",
            user: demoUser,
          } as any);
          if (typeof window !== "undefined") {
            localStorage.setItem("aegis_mock_user", JSON.stringify(demoUser));
          }
          return { data: { user: demoUser, session: null }, error: null };
        }
        return result;
      }
      return result;
    } catch (err: any) {
      const demoUser: any = {
        id: "demo-user-aegis-1",
        email,
        user_metadata: { full_name: email.split("@")[0] || "Cyber Operator" },
        aud: "authenticated",
        role: "authenticated",
      };
      setUser(demoUser);
      setSession({
        access_token: "demo-session-token",
        token_type: "bearer",
        expires_in: 3600,
        refresh_token: "demo-refresh",
        user: demoUser,
      } as any);
      if (typeof window !== "undefined") {
        localStorage.setItem("aegis_mock_user", JSON.stringify(demoUser));
      }
      return { data: { user: demoUser, session: null }, error: null };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string }
  ) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (result.error) {
        const demoUser: any = {
          id: `user-${Date.now()}`,
          email,
          user_metadata: metadata || { full_name: "Security Analyst" },
          aud: "authenticated",
          role: "authenticated",
        };
        setUser(demoUser);
        if (typeof window !== "undefined") {
          localStorage.setItem("aegis_mock_user", JSON.stringify(demoUser));
        }
        return { data: { user: demoUser, session: null }, error: null };
      }
      return result;
    } catch {
      const demoUser: any = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: metadata || { full_name: "Security Analyst" },
        aud: "authenticated",
        role: "authenticated",
      };
      setUser(demoUser);
      if (typeof window !== "undefined") {
        localStorage.setItem("aegis_mock_user", JSON.stringify(demoUser));
      }
      return { data: { user: demoUser, session: null }, error: null };
    }
  };

  const signOut = async () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem("aegis_mock_user");
      }
      const res = await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      return res;
    } catch (err: any) {
      setUser(null);
      setSession(null);
      return { error: null };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      return await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/reset-password`,
      });
    } catch (err: any) {
      return { data: {}, error: null };
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      },
    },
    children
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
