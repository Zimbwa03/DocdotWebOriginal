// Replaced Supabase with built-in Replit PostgreSQL backend
// This file is kept for compatibility but redirects to backend auth

console.log('✅ Authentication now handled by built-in Replit backend');

// Mock auth client for compatibility
export const supabase = {
  auth: {
    getSession: async () => {
      // Check with backend for current session
      try {
        const response = await fetch('/api/auth/session');
        const session = response.ok ? await response.json() : null;
        console.log('Auth session:', session ? 'Active' : 'No session');
        return { data: { session }, error: null };
      } catch (error) {
        console.log('Auth session: No session');
        return { data: { session: null }, error: null };
      }
    },
    onAuthStateChange: (callback: any) => {
      // Simplified auth state management
      console.log('Auth state change listener registered');
      return {
        data: {
          subscription: {
            unsubscribe: () => console.log('Auth listener unsubscribed')
          }
        }
      };
    },
    signUp: async (credentials: { email: string; password: string }) => {
      try {
        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const data = await response.json();
        return response.ok ? { data, error: null } : { data: null, error: data };
      } catch (error) {
        return { data: null, error };
      }
    },
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      try {
        const response = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });
        const data = await response.json();
        return response.ok ? { data, error: null } : { data: null, error: data };
      } catch (error) {
        return { data: null, error };
      }
    },
    signOut: async () => {
      try {
        const response = await fetch('/api/auth/signout', { method: 'POST' });
        return { error: null };
      } catch (error) {
        return { error };
      }
    }
  }
};