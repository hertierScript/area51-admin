"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthUser, Role } from "@/types/database";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isKitchen: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const stored = localStorage.getItem("admin_session");
      if (stored) {
        const session = JSON.parse(stored);
        // Use the stored session directly without verifying against database
        // The session is set by the login API which already verified credentials
        setUser({
          id: session.id,
          email: session.email,
          name: session.name,
          role: session.role,
        });
      }
    } catch (error) {
      console.error("Session check error:", error);
      localStorage.removeItem("admin_session");
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      // Verify password via API route
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || "Invalid credentials" };
      }

      const authUser: AuthUser = {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: result.user.role || null,
      };

      localStorage.setItem("admin_session", JSON.stringify(authUser));
      setUser(authUser);
      return {};
    } catch (error) {
      console.error("Login error:", error);
      return { error: "An error occurred during login" };
    }
  }

  async function logout() {
    localStorage.removeItem("admin_session");
    setUser(null);
    router.push("/login");
  }

  const isAdmin = user?.role?.name === "admin";
  const isKitchen = user?.role?.name === "kitchen";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAdmin, isKitchen }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
