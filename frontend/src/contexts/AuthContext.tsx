import { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
  currentUser: { 
    username: string; 
    email: string; 
    name: string; 
    travelStyle: string;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, travelStyle: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<{ 
    username: string; 
    email: string; 
    name: string; 
    travelStyle: string;
  } | null>(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  const signup = async (username: string, email: string, password: string, travelStyle: string) => {
    try {
      console.log('Sending registration data to FastAPI:', { username, email, password, travelStyle });
      
      const userData = {
        username,
        email,
        password,
        name: username,
        travel_style: travelStyle
      };

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      }

      const userDataResponse = await response.json();
      
      setCurrentUser({ 
        username: userDataResponse.username,
        email: userDataResponse.email, 
        name: userDataResponse.name || userDataResponse.username,
        travelStyle: userDataResponse.travel_style || userDataResponse.travelStyle
      });
      
      console.log('Registration successful:', userDataResponse);
      
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
        throw new Error(errorData.detail || errorData.message || 'Login failed');
      }

      const userData = await response.json();
      setCurrentUser({ 
        username: userData.username,
        email: userData.email, 
        name: userData.name || userData.username,
        travelStyle: userData.travel_style || userData.travelStyle
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
    <AuthContext.Provider value={{ currentUser, login, signup, logout }}>
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
