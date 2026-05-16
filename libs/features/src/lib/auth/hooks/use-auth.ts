import { useState, useEffect } from 'react';
import type { SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface UseAuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
}

export function useAuth(client: SupabaseClient) {
  const [state, setState] = useState<UseAuthState>({ user: null, session: null, loading: true });

  useEffect(() => {
    client.auth.getSession().then(({ data }) => {
      setState({ user: data.session?.user ?? null, session: data.session, loading: false });
    });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      setState({ user: session?.user ?? null, session, loading: false });
    });
    return () => subscription.unsubscribe();
  }, [client]);

  const signIn = (email: string, password: string) =>
    client.auth.signInWithPassword({ email, password });

  const signUp = (email: string, password: string) =>
    client.auth.signUp({ email, password });

  const signOut = () => client.auth.signOut();

  const signInWithOAuth = (provider: 'google' | 'github') =>
    client.auth.signInWithOAuth({ provider });

  return { ...state, signIn, signUp, signOut, signInWithOAuth };
}
