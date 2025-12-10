import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface User {
  _id?: string;
  id?: string; 
  username: string;
  email: string;
  name: string;
  travelStyle: string;
  isAdmin?: boolean;  
}

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, travelStyle: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const API_BASE_URL = "http://localhost:8000";

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        setIsAdmin(user.isAdmin === true);
      } catch (error) {
        console.error("Failed to parse user from localStorage:", error);
      }
    }
  }, []);

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

      const userData: User = {
        _id: data._id || data.id,
        id: data.id || data._id,
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        travelStyle: data.travel_style || travelStyle,
        isAdmin: data.isAdmin || false,
      };

      setCurrentUser(userData);
      setIsAdmin(userData.isAdmin || false);
      localStorage.setItem("user", JSON.stringify(userData));
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
      
      const userData: User = {
        _id: data._id || data.id,
        id: data.id || data._id,
        username: data.username,
        email: data.email,
        name: data.name || data.username,
        travelStyle: data.travel_style || "",
        isAdmin: data.isAdmin || false,
      };

      setCurrentUser(userData);
      setIsAdmin(userData.isAdmin || false);
      
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", data.token || data.access_token);
      
      if (userData.isAdmin) {
        localStorage.setItem("isAdmin", "true");
      }

    } catch (error: any) {
      console.error("Login error:", error.message || error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      signup, 
      logout,
      isAdmin 
    }}>
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
