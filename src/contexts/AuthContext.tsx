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
      
      // Set a timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching user profile:', error);
        // Always create a fallback user to prevent loading loops
        const { data: authData } = await supabase.auth.getUser();
        const fallbackUser = {
          id: userId,
          email: authData.user?.email || '',
          role: 'admin' as const
        };
        console.log('Setting fallback user:', fallbackUser);
        setUser(fallbackUser);
      } else {
        console.log('Profile found:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Always create fallback user on any error
      const { data: authData } = await supabase.auth.getUser();
      const fallbackUser = {
        id: userId,
        email: authData.user?.email || '',
        role: 'admin' as const
      };
      console.log('Setting fallback user after error:', fallbackUser);
      setUser(fallbackUser);
    } finally {
      console.log('Setting isLoading to false');
      setIsLoading(false);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const email = authData.user?.email || '';
      
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email,
            full_name: null,
            role: 'admin' // Default role for now
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        // Even if profile creation fails, set a minimal user object
        setUser({
          id: userId,
          email: email,
          role: 'admin'
        });
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Fallback: create minimal user object
      const { data: authData } = await supabase.auth.getUser();
      setUser({
        id: userId,
        email: authData.user?.email || '',
        role: 'admin'
      });
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