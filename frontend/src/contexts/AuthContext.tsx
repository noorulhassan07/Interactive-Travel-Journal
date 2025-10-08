import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  password: string;
  name: string; // you can add other info per user
}

interface AuthContextType {
  currentUser: { email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Dummy users ---
const dummyUsers: User[] = [
  { email: 'adam@gmail.com', password: 'adam123', name: 'Adam' },
  { email: 'eve@gmail.com', password: 'eve123', name: 'Eve' },
  { email: 'john@gmail.com', password: 'john123', name: 'John' },
  { email: 'alice@gmail.com', password: 'alice123', name: 'Alice' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);

  const login = async (email: string, password: string) => {
    const user = dummyUsers.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser({ email: user.email, name: user.name });
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
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
