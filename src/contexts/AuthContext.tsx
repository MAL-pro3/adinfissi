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

  // ==============================================================
  // 🔹 Effetto principale: gestione sessione persistente e refresh
  // ==============================================================
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      setIsLoading(true);

      // ✅ Avvia il refresh automatico del token
      supabase.auth.startAutoRefresh();

      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Errore nel recupero sessione:', error);
        if (mounted) setIsLoading(false);
        return;
      }

      const session = data.session;

      if (session?.user) {
        console.log('Sessione trovata, utente:', session.user.id);
        setAuthUser(session.user);
        await fetchUserProfile(session.user.id);
      } else {
        console.log('Nessuna sessione trovata');
        if (mounted) setIsLoading(false);
      }
    };

    loadSession();

    // ✅ Listener eventi auth (login, logout, refresh)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (!authUser || authUser.id !== session?.user?.id) {
            setAuthUser(session?.user ?? null);
            if (session?.user) await fetchUserProfile(session.user.id);
          }
        }

        if (event === 'SIGNED_OUT') {
          console.log('Utente disconnesso');
          setAuthUser(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // ✅ Cleanup alla disconnessione del componente
    return () => {
      mounted = false;
      supabase.auth.stopAutoRefresh();
      listener.subscription.unsubscribe();
    };
  }, []);

  // ==============================================================
  // 🔹 Recupera profilo utente da Supabase (tabella profiles)
  // ==============================================================
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
      console.log('Profilo caricato:', data);
      setUser(data);
    }

    setIsLoading(false);
  };

  // ==============================================================
  // 🔹 Login utente con email e password
  // ==============================================================
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Errore login:', error);
      return false;
    }

    if (data.session?.user) {
      console.log('Login riuscito:', data.session.user.id);
      setAuthUser(data.session.user);
      await fetchUserProfile(data.session.user.id);
    }
    return true;
  };

  // ==============================================================
  // 🔹 Logout utente
  // ==============================================================
  const logout = async () => {
    await supabase.auth.signOut();
    supabase.auth.stopAutoRefresh();
    setUser(null);
    setAuthUser(null);
  };

  // ==============================================================
  // 🔹 Provider React Context
  // ==============================================================
  return (
    <AuthContext.Provider value={{ user, authUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ==============================================================
 // 🔹 Hook personalizzato per usare il contesto Auth
// ==============================================================
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve essere usato dentro AuthProvider');
  return context;
}
