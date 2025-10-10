import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  authUser: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, try to create it for authenticated users only
        if (error.code === 'PGRST116') {
          console.log('Profile not found, attempting to create...');
          await createUserProfile(userId);
        } else {
          // For other errors, sign out the user as they shouldn't have access
          console.error('Profile access error, signing out user');
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        console.log('Profile found:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // On any unexpected error, sign out for security
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user || !authData.user.email) {
        console.error('No authenticated user found or email missing');
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      // Verify the user is properly authenticated
      if (authData.user.id !== userId) {
        console.error('User ID mismatch, potential security issue');
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || '',
            role: 'user' // Default role for new users (not admin)
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        // If we can't create a profile, the user shouldn't have access
        await supabase.auth.signOut();
        setUser(null);
        return;
      }

      console.log('Profile created successfully:', data);
      setUser(data);
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // On any error, sign out for security
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        return false;
      }

      // Don't set isLoading here - let the auth state change handler manage it
      return true;
    } catch (error) {
      console.error('Errore durante il login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setAuthUser(null);
    } catch (error) {
      console.error('Errore durante il logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, authUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve essere usato all\'interno di un AuthProvider');
  }
  return context;
}