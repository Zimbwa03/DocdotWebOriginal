import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithOAuth: (provider: 'google' | 'apple') => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          toast({
            title: "Welcome to Docdot!",
            description: "You have successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/home`
        }
      });

      if (error) {
        console.error('Supabase sign up error:', error);
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message || "Failed to connect to authentication service",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We've sent you a verification link to complete your registration.",
        });
      }

      return { error };
    } catch (networkError) {
      console.error('Network error during sign up:', networkError);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Unable to connect to authentication service. Please check your internet connection.",
      });
      return { error: networkError as any };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase sign in error:', error);
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message || "Failed to connect to authentication service",
        });
      }

      return { error };
    } catch (networkError) {
      console.error('Network error during sign in:', networkError);
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: "Unable to connect to authentication service. Please check your internet connection.",
      });
      return { error: networkError as any };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    });

    if (error) {
      toast({
        variant: "destructive",
        title: `${provider} sign in failed`,
        description: error.message,
      });
    }

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithOAuth,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
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
