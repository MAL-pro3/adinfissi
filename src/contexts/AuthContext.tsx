import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { User as SupabaseAuthUser, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  authUser: SupabaseAuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rete di sicurezza: oltre questo tempo l'app NON resta mai bloccata in caricamento.
const SESSION_SAFETY_TIMEOUT_MS = 8000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authUser, setAuthUser] = useState<SupabaseAuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ==============================================================
  // 🔹 Recupera profilo utente da Supabase (tabella profiles)
  //    - Non solleva mai eccezioni: in caso di errore usa un profilo
  //      minimo derivato dall'utente autenticato, così l'utente non
  //      resta bloccato fuori dall'area riservata.
  // ==============================================================
  const fetchUserProfile = useCallback(async (authenticatedUser: SupabaseAuthUser): Promise<void> => {
    const fallbackUser: User = {
      id: authenticatedUser.id,
      email: authenticatedUser.email ?? '',
      full_name:
        (authenticatedUser.user_metadata?.full_name as string | undefined) ??
        authenticatedUser.email ??
        '',
      role: 'user',
    };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authenticatedUser.id)
        .maybeSingle();

      if (error) {
        console.error('Errore fetch profilo:', error.message);
        setUser(fallbackUser);
        return;
      }

      setUser((data as User) ?? fallbackUser);
    } catch (err) {
      console.error('Eccezione fetch profilo:', err);
      setUser(fallbackUser);
    }
  }, []);

  // Applica la sessione corrente (utente + profilo)
  const applySession = useCallback(
    async (session: Session | null): Promise<void> => {
      setAuthUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user);
      } else {
        setUser(null);
      }
    },
    [fetchUserProfile],
  );

  // ==============================================================
  // 🔹 Effetto principale: ripristino sessione persistente
  //
  // onAuthStateChange è l'UNICA fonte di verità: emette INITIAL_SESSION
  // all'avvio, poi SIGNED_IN / TOKEN_REFRESHED / SIGNED_OUT.
  // In questo modo NON chiamiamo più supabase.auth.getSession() in
  // parallelo (era questa la causa del blocco infinito in StrictMode).
  // ==============================================================
  useEffect(() => {
    let mounted = true;

    const safetyTimer = window.setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, SESSION_SAFETY_TIMEOUT_MS);

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        // ⚠️ Il callback di onAuthStateChange viene eseguito mentre Supabase
        // tiene il lock interno: NON va reso async. Spostiamo il lavoro
        // (chiamate di rete) fuori dal callback con setTimeout.
        window.setTimeout(() => {
          if (!mounted) return;
          void applySession(session).finally(() => {
            if (mounted) setIsLoading(false);
          });
        }, 0);
      }

      if (event === 'SIGNED_OUT') {
        setAuthUser(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      window.clearTimeout(safetyTimer);
      listener.subscription.unsubscribe();
    };
  }, [applySession]);

  // ==============================================================
  // 🔹 Login utente con email e password
  // ==============================================================
  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Errore login:', error.message);
      return false;
    }

    if (data.session?.user) {
      setAuthUser(data.session.user);
      await fetchUserProfile(data.session.user);
      setIsLoading(false);
    }
    return true;
  };

  // ==============================================================
  // 🔹 Logout utente
  // ==============================================================
  const logout = async () => {
    await supabase.auth.signOut();
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
