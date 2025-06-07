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
      
      // If user is signed in, sync profile data
      if (session?.user) {
        syncUserProfile(session.user);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN' && session?.user) {
          await syncUserProfile(session.user);
          toast({
            title: "Welcome to Docdot!",
            description: "You have successfully signed in.",
          });
        } else if (event === 'SIGNED_OUT') {
          localStorage.removeItem('profileSetupComplete');
          toast({
            title: "Signed out",
            description: "You have been signed out successfully.",
          });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [toast]);

  const syncUserProfile = async (user: any) => {
    try {
      // Create or update user profile in database
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.firstName || user.user_metadata?.first_name,
          lastName: user.user_metadata?.lastName || user.user_metadata?.last_name,
        }),
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.profileCompleted) {
          localStorage.setItem('profileSetupComplete', 'true');
        }
        
        // Initialize user analytics and badge system automatically
        await initializeUserData(user.id);
      }
    } catch (error) {
      console.error('Error syncing user profile:', error);
    }
  };

  const initializeUserData = async (userId: string) => {
    try {
      // Ensure user has stats entry (will be populated as they take quizzes)
      const statsResponse = await fetch(`/api/user-stats/${userId}`);
      
      if (!statsResponse.ok) {
        // Create empty stats entry - will be populated with real data as user takes quizzes
        await dbStorage.updateUserStats(userId, false, 0, 0);
      }
      
      // Refresh leaderboard to ensure user appears (even with 0 stats initially)
      await fetch('/api/refresh-user-stats', { method: 'POST' });
      
      console.log('User data initialized - will populate with actual quiz performance');
    } catch (error) {
      console.error('Error initializing user data:', error);
    }
  };

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
