import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  username: string;
  email: string;
  password: string;
  name: string;
  travelStyle: string;
}

interface AuthContextType {
  currentUser: { 
    username: string; 
    email: string; 
    name: string; 
    travelStyle: string 
  } | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    travelStyle: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<{ 
    username: string; 
    email: string; 
    name: string; 
    travelStyle: string 
  } | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    name: string;
    travelStyle: string;
  }) => {
    try {
      console.log('Sending registration data:', userData);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }
      
      setCurrentUser({ 
        username: responseData.username,
        email: responseData.email, 
        name: responseData.name,
        travelStyle: responseData.travelStyle
      });
      
      console.log('Registration successful:', responseData);
      
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const userData = await response.json();
      setCurrentUser({ 
        username: userData.username,
        email: userData.email, 
        name: userData.name,
        travelStyle: userData.travelStyle
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
