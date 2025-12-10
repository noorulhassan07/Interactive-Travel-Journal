// frontend/src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  travelStyle: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, travelStyle: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const API_BASE_URL = "http://localhost:8000";

  const signup = async (username: string, email: string, password: string, travelStyle: string) => {
    const payload = {
      username,
      email,
      password,
      name: username,
      travel_style: travelStyle,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.message || "Registration failed");
      }

      const data = await res.json();

      setCurrentUser({
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        travelStyle: data.travel_style || travelStyle,
      });
      console.log("Registration successful:", data);

    } catch (error: any) {
      console.error("Signup error:", error.message || error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.message || "Login failed");
      }

      const data = await res.json();
      setCurrentUser({
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        travelStyle: data.travel_style || "",
      });

    } catch (error: any) {
      console.error("Login error:", error.message || error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
