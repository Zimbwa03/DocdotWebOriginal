import { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

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
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
        } else if (session?.user) {
          console.log('Active session found:', session.user.email);
          setUser(session.user);
          
          // Sync user with database on initial session load
          try {
            const userData = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.firstName,
              lastName: session.user.user_metadata?.lastName
            };
            
            console.log('🔄 Syncing user with database:', userData.id);
            const response = await fetch('/api/user', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(userData),
            });
            
            if (response.ok) {
              console.log('✅ User synced successfully with database');
            } else {
              console.warn('⚠️ Failed to sync user with database:', await response.text());
            }
          } catch (syncError) {
            console.error('❌ Error syncing user with database:', syncError);
          }
          
          setLoading(false);
        } else {
          console.log('No active session found');
          setLoading(false);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          setUser(session.user);
          
          // Sync user with database when they authenticate
          if (event === 'SIGNED_IN') {
            try {
              const userData = {
                id: session.user.id,
                email: session.user.email || '',
                firstName: session.user.user_metadata?.firstName,
                lastName: session.user.user_metadata?.lastName
              };
              
              console.log('🔄 Syncing user with database after sign in:', userData.id);
              const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
              });
              
              if (response.ok) {
                console.log('✅ User synced successfully with database');
              } else {
                console.warn('⚠️ Failed to sync user with database:', await response.text());
              }
            } catch (syncError) {
              console.error('❌ Error syncing user with database:', syncError);
            }
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        toast({
          title: "Sign Up Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: error };
      } else {
        setUser(data.user);
        toast({
          title: "Account Created",
          description: "Welcome to Docdot! Your account has been created successfully."
        });
        return { error: null };
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message,
        variant: "destructive"
      });
      return { error: { message: 'Network error occurred' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        toast({
          title: "Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: error };
      } else if (data.user) {
        setUser(data.user);
        toast({
          title: "Welcome Back!",
          description: "You have successfully signed in."
        });
        return { error: null };
      } else {
        // This case should ideally not happen if no error and no user
        toast({
          title: "Sign In Error",
          description: "An unexpected error occurred during sign-in.",
          variant: "destructive"
        });
        return { error: { message: 'Unexpected sign-in result' } };
      }
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message,
        variant: "destructive"
      });
      return { error: { message: 'Network error occurred' } };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'apple') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback` // Ensure this callback route exists
        }
      });

      if (error) {
        toast({
          title: "OAuth Sign In Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: error };
      }
      // The redirect should handle the user flow, so no need to setUser here.
      // The onAuthStateChange listener will pick up the changes after redirect.
      return { error: null };
    } catch (error: any) {
      toast({
        title: "OAuth Sign In Error",
        description: error.message,
        variant: "destructive"
      });
      return { error: { message: 'Network error occurred' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      setUser(null);
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive"
        });
        return { error: error };
      } else {
        toast({
          title: "Signed Out",
          description: "You have been signed out successfully."
        });
        return { error: null };
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Error",
        description: error.message,
        variant: "destructive"
      });
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