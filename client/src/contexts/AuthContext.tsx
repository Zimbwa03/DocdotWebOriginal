import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Simplified user interface for built-in backend
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session on mount
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    try {
      const response = await fetch('/api/auth/session', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.log('No active session found');
      setUser(null);
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        toast({
          title: "Account Created",
          description: "Welcome to Docdot! Your account has been created successfully."
        });
        return { error: null };
      } else {
        return { error: data };
      }
    } catch (error) {
      return { error: { message: 'Network error occurred' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (response.ok) {
        setUser(data.user);
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in."
        });
        return { error: null };
      } else {
        return { error: data };
      }
    } catch (error) {
      return { error: { message: 'Network error occurred' } };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    // OAuth not implemented for built-in backend yet
    toast({
      title: "OAuth Not Available",
      description: `${provider} sign-in is not yet configured. Please use email/password.`,
      variant: "destructive"
    });
    return { error: { message: 'OAuth not implemented' } };
  };

  const signOut = async () => {
    try {
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include'
      });

      setUser(null);
      toast({
        title: "Signed Out",
        description: "You have been signed out successfully."
      });
      return { error: null };
    } catch (error) {
      return { error: { message: 'Sign out failed' } };
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user,
        loading,
        signUp,
        signIn,
        signInWithOAuth,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}