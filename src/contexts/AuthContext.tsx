
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getUserByEmail, authenticate } from '@/data/agents';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'agent';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem('musiliUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing stored user data');
        localStorage.removeItem('musiliUser');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('Attempting login with:', email, password);
      
      // Simple mock authentication
      const authenticatedUser = authenticate(email, password);
      console.log('Authentication result:', authenticatedUser);
      
      if (authenticatedUser) {
        const { password: _, ...userWithoutPassword } = authenticatedUser;
        setUser(userWithoutPassword);
        localStorage.setItem('musiliUser', JSON.stringify(userWithoutPassword));
        
        toast({
          title: "Login Successful",
          description: `Welcome back, ${authenticatedUser.name}!`,
        });
        
        // Navigate based on role
        setTimeout(() => {
          if (authenticatedUser.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else if (authenticatedUser.role === 'agent') {
            window.location.href = '/agent/dashboard';
          }
        }, 1000);
        
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('musiliUser');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
