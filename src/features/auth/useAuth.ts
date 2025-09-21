'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, AuthState, LoginCredentials, RegisterData } from './types';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthState(prev => ({ ...prev, error: error.message, loading: false }));
          return;
        }

        if (session?.user) {
          // Fetch user profile from your users table
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || '',
            role: profile?.role || 'agent',
            avatar_url: profile?.avatar_url,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          };

          setAuthState({ user, loading: false, error: null });
        } else {
          setAuthState({ user: null, loading: false, error: null });
        }
      } catch (error) {
        setAuthState({
          user: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication error',
        });
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: profile?.name || session.user.user_metadata?.name || '',
            role: profile?.role || 'agent',
            avatar_url: profile?.avatar_url,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at,
          };

          setAuthState({ user, loading: false, error: null });
        } else {
          setAuthState({ user: null, loading: false, error: null });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role || 'agent',
          }
        }
      });

      if (error) {
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: error.message 
        }));
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({ 
        ...prev, 
        loading: false, 
        error: errorMessage 
      }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setAuthState(prev => ({ ...prev, error: error.message }));
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
  };
}