import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../lib/api';
import { User } from '../types/index';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: { firstName: string; lastName: string; email: string; password: string; phone: string }) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users data for fallback during development
const mockUsers: Record<string, User> = {
  'admin@hr360.com': {
    id: '1',
    email: 'admin@hr360.com',
    firstName: 'System',
    lastName: 'Admin',
    role: 'admin',
    department: 'IT',
    position: 'System Administrator',
    joinDate: '2024-01-01',
    salary: 100000,
    isActive: true,
  },
  'hr@hr360.com': {
    id: '2',
    email: 'hr@hr360.com',
    firstName: 'HR',
    lastName: 'Manager',
    role: 'hr',
    department: 'Human Resources',
    position: 'HR Manager',
    joinDate: '2024-01-01',
    salary: 80000,
    isActive: true,
  },
  'employee@hr360.com': {
    id: '3',
    email: 'employee@hr360.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'employee',
    department: 'Engineering',
    position: 'Software Engineer',
    joinDate: '2024-01-01',
    salary: 70000,
    isActive: true,
  },
  'candidate@hr360.com': {
    id: '4',
    email: 'candidate@hr360.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'candidate',
    department: 'Engineering',
    position: 'Frontend Developer',
    joinDate: '2024-01-01',
    salary: 65000,
    isActive: true,
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('hr360_token');
      if (token && token.startsWith('mock-token-')) {
        // Handle mock token for development
        const email = token.replace('mock-token-', '');
        const mockUser = mockUsers[email];
        if (mockUser) {
          setUser(mockUser);
        } else {
          localStorage.removeItem('hr360_token');
        }
      } else if (token) {
        try {
          const userData = await api.auth.verifyToken(token);
          setUser(userData);
        } catch {
          // Token is invalid, remove it
          localStorage.removeItem('hr360_token');
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Check for mock login first (for development)
    const mockUser = mockUsers[email];
    if (mockUser && password === 'password') {
      setUser(mockUser);
      localStorage.setItem('hr360_token', 'mock-token-' + email);
      setIsLoading(false);
      return true;
    }

    // Try API login
    try {
      const result = await api.auth.login(email, password);
      setUser(result.user);
      localStorage.setItem('hr360_token', result.token);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: { firstName: string; lastName: string; email: string; password: string; phone: string }): Promise<boolean> => {
    setIsLoading(true);

    // Check if email already exists in mock users
    if (mockUsers[userData.email]) {
      setIsLoading(false);
      return false;
    }

    // Create new mock user for development
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: 'candidate',
      department: 'Candidate',
      position: 'Job Seeker',
      joinDate: new Date().toISOString().split('T')[0],
      salary: 0,
      isActive: true,
    };

    // Add to mock users
    mockUsers[userData.email] = newUser;

    // Don't auto-login after signup - user should login manually
    setIsLoading(false);
    return true;

    // For production, uncomment this:
    /*
    try {
      const result = await api.auth.signup(userData);
      // Don't auto-login after signup - user should login manually
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Signup failed:', error);
      setIsLoading(false);
      return false;
    }
    */
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hr360_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
