import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
  password: string;
  name: string;
  travel_style: string;
}

interface AuthContextType {
  currentUser: { 
    username: string; 
    email: string; 
    name: string; 
    travel_style: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    travel_style: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<{ 
    username: string; 
    email: string; 
    name: string; 
    travel_style: string;
  } | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    travel_style: string;
  }) => {
    try {
      console.log('Sending registration data to FastAPI:', userData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const userDataResponse = await response.json();
      
      setCurrentUser({ 
        username: userDataResponse.username,
        email: userDataResponse.email, 
        name: userDataResponse.name,
        travel_style: userDataResponse.travel_style
      });
      
      console.log('Registration successful:', userDataResponse);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const userData = await response.json();
      setCurrentUser({ 
        username: userData.username,
        email: userData.email, 
        name: userData.name,
        travel_style: userData.travel_style
      });
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
