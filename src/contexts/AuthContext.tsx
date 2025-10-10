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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;
  const sessionTimeout = 30 * 60 * 1000; // 30 minutes in milliseconds

  useEffect(() => {
    let sessionTimer: NodeJS.Timeout;

    const resetSessionTimer = () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      
      sessionTimer = setTimeout(() => {
        console.log('Session expired due to inactivity');
        supabase.auth.signOut();
      }, sessionTimeout);
    };

    const handleUserActivity = () => {
      if (authUser) {
        resetSessionTimer();
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, true);
    });

    // Start session timer when user is authenticated
    if (authUser) {
      resetSessionTimer();
    }

    return () => {
      if (sessionTimer) clearTimeout(sessionTimer);
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity, true);
      });
    };
  }, [authUser, sessionTimeout]);

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
        console.log('Auth state changed:', event, session?.user?.email);
        setAuthUser(session?.user ?? null);
        setRetryCount(0); // Reset retry count on auth change
        
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Auto logout on window close/refresh
    const handleBeforeUnload = () => {
      supabase.auth.signOut();
    };

    // Auto logout on window focus lost (optional - can be removed if too aggressive)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Optional: logout when tab becomes hidden
        // supabase.auth.signOut();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchUserProfile = async (userId: string, attempt: number = 1) => {
    try {
      console.log(`Fetching user profile for: ${userId} (attempt ${attempt}/${maxRetries})`);
      console.log('Supabase URL:', supabase.supabaseUrl);
      
      // Test basic connectivity first
      console.log('Testing Supabase connectivity...');
      const connectivityTest = await supabase.from('profiles').select('count').limit(1);
      console.log('Connectivity test result:', connectivityTest);
      
      console.log('Starting profile query...');
      
      // Set timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => {
          console.error('Profile fetch timeout after 10 seconds');
          reject(new Error('Profile fetch timeout'));
        }, 10000)
      );
      
      console.log('Creating profile query promise...');
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('Racing promises (query vs timeout)...');
      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;
      console.log('Promise race completed. Data:', data, 'Error:', error);

      if (error) {
        console.error('Error fetching user profile:', error);
        
        // If profile doesn't exist, try to create it (only once)
        if (error.code === 'PGRST116' && attempt === 1) {
          console.log('Profile not found, attempting to create...');
          const created = await createUserProfile(userId);
          if (created) {
            // Retry fetching the newly created profile
            return await fetchUserProfile(userId, 2);
          }
        } 
        
        // For permission errors or other issues
        if (error.code === 'PGRST301' || error.message?.includes('permission')) {
          console.error('Permission denied - user not authorized');
          await supabase.auth.signOut();
          setUser(null);
          return;
        }

        // Retry logic for temporary errors
        if (attempt < maxRetries && (error.code === 'PGRST000' || error.message?.includes('timeout'))) {
          console.log(`Retrying profile fetch in 2 seconds... (${attempt}/${maxRetries})`);
          setTimeout(() => fetchUserProfile(userId, attempt + 1), 2000);
          return;
        }

        // Max retries reached or unrecoverable error
        console.error('Max retries reached or unrecoverable error, signing out');
        await supabase.auth.signOut();
        setUser(null);
      } else {
        console.log('Profile found:', data);
        
        // Verify user has admin role
        if (data.role !== 'admin') {
          console.error('User does not have admin role:', data.role);
          await supabase.auth.signOut();
          setUser(null);
          return;
        }
        
        setUser(data);
        setRetryCount(0); // Reset retry count on success
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      
      // Retry on network errors
      if (attempt < maxRetries) {
        console.log(`Network error, retrying in 3 seconds... (${attempt}/${maxRetries})`);
        setTimeout(() => fetchUserProfile(userId, attempt + 1), 3000);
        return;
      }
      
      // Max retries reached
      console.error('Max retries reached, signing out');
      await supabase.auth.signOut();
      setUser(null);
    } finally {
      if (attempt >= maxRetries || user !== null) {
        setIsLoading(false);
      }
    }
  };

  const createUserProfile = async (userId: string): Promise<boolean> => {
    try {
      const { data: authData } = await supabase.auth.getUser();
      
      if (!authData.user || !authData.user.email) {
        console.error('No authenticated user found or email missing');
        return false;
      }

      // Verify the user is properly authenticated
      if (authData.user.id !== userId) {
        console.error('User ID mismatch, potential security issue');
        return false;
      }

      console.log('Creating profile for authenticated user:', authData.user.email);

      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: authData.user.email,
            full_name: authData.user.user_metadata?.full_name || '',
            role: 'admin' // Set as admin since only admins should access this app
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        
        // Check if it's a permission error
        if (error.code === 'PGRST301' || error.message?.includes('permission')) {
          console.error('Permission denied - cannot create profile');
          return false;
        }
        
        // Check if profile already exists
        if (error.code === '23505') {
          console.log('Profile already exists, this is normal');
          return true;
        }
        
        return false;
      }

      console.log('Profile created successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      return false;
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