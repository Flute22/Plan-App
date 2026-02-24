import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// ─── Types ───────────────────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  userRole: 'admin' | 'user' | null;
}

interface AuthContextValue extends AuthState {
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getUserRole(user: User | null): 'admin' | 'user' | null {
  if (!user) return null;
  return user.user_metadata?.role === 'admin' ? 'admin' : 'user';
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
    userRole: null,
  });

  // Restore session on mount & listen for auth changes
  useEffect(() => {
    if (!supabase) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      const role = getUserRole(user);
      setState({
        user,
        session,
        loading: false,
        isAdmin: role === 'admin',
        userRole: role,
      });
    });

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const user = session?.user ?? null;
        const role = getUserRole(user);
        setState({
          user,
          session,
          loading: false,
          isAdmin: role === 'admin',
          userRole: role,
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── Sign Up (regular users only — admin is seeded) ───────────────────
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    if (!supabase) return { error: { message: 'Supabase is not configured' } as AuthError };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: 'user' },
      },
    });

    return { error };
  }, []);

  // ── Sign In ──────────────────────────────────────────────────────────────
  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: { message: 'Supabase is not configured' } as AuthError };

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  }, []);

  // ── Sign Out ─────────────────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  }, []);

  // ── Reset Password (sends email) ────────────────────────────────────────
  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) return { error: { message: 'Supabase is not configured' } as AuthError };

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password`,
    });

    return { error };
  }, []);

  // ── Update Password (after reset) ───────────────────────────────────────
  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) return { error: { message: 'Supabase is not configured' } as AuthError };

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    return { error };
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, signUp, signIn, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
