import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User as AuthUser } from '@supabase/supabase-js';

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

  // 🔹 Recupera e mantiene la sessione
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Errore nel recupero sessione:', error);
        if (mounted) setIsLoading(false);
        return;
      }

      const session = data.session;
      if (session?.user) {
        setAuthUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        if (mounted) setIsLoading(false);
      }
    };

    loadSession();

    // 🔹 Listener per eventi auth
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Evita di ricaricare se è lo stesso utente
          if (!authUser || authUser.id !== session?.user?.id) {
            setAuthUser(session?.user ?? null);
            if (session?.user) await fetchUserProfile(session.user.id);
          }
        }

        if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // 🔹 Recupera profilo dal DB
  const fetchUserProfile = async (userId: string) => {
    console.log('Fetching user profile for ID:', userId);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Errore fetch profilo:', error);
      setUser(null);
    } else {
      setUser(data);
    }
    setIsLoading(false);
  };

  // 🔹 Login utente
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Errore login:', error);
      return false;
    }

    if (data.session?.user) {
      setAuthUser(data.session.user);
      await fetchUserProfile(data.session.user.id);
    }
    return true;
  };

  // 🔹 Logout utente
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAuthUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, authUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return context;
}
