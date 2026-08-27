/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import type { AxiosInstance } from "axios";

interface User {
  id: string;
  name: string;
  email: string;
  plan: string;
  analysisCount: number;
}

interface AppContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  api: AxiosInstance;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export function AppProvider({ children }: { children: any }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize the axios client instance
  const api = axios.create({
    baseURL: BACKEND_URL,
  });

  // Attach token automatically to all header requests if present
  api.interceptors.request.use((config) => {
    if (token) {
      config.headers = config.headers || {};
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
      setUser(null);
    }
  }, [token]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      if (user) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_URL}/api/auth/user`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();

        if (data && (data.success || data.email || data.name || data.user)) {
          setUser(data.user || data);
        } else {
          setToken(null);
        }
      } catch (error) {
        console.error("Failed to load user session:", error);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, user]);

  // Login handler
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        toast.success("Logged in successfully! 👋");
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid credentials" };
      }
    } catch (error) {
      return { success: false, message: "Server connection failed" };
    }
  };

  // Register handler
  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        toast.success("Account created successfully! 🎉");
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed" };
      }
    } catch (error) {
      return { success: false, message: "Server connection failed" };
    }
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    toast.success("Logged out.");
  };

  return (
    <AppContext.Provider value={{ user, token, loading, api, login, register, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
