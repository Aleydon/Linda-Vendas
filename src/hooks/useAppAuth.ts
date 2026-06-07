import { RealtimeChannel, User } from '@supabase/supabase-js';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';

import { Profile } from '@/context/types';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

interface UseAppAuthProps {
  onLogin: (userId: string) => void;
  onLogout: () => void;
}

export function useAppAuth({ onLogin, onLogout }: UseAppAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const isAdmin = profile?.role === 'admin';

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      if (!data) {
        console.warn('Profile not found for user:', userId);
        setProfile(null);
        return;
      }

      setProfile(data as Profile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: 'linda-vendas'
      });

      console.log('Redirect URL configurada:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (error) throw error;

      if (data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        console.log('Auth Result Type:', result.type);

        if (result.type === 'success' && result.url) {
          const urlObj = new URL(result.url);

          const hashParams = new URLSearchParams(urlObj.hash.substring(1));
          const queryParams = new URLSearchParams(urlObj.search);

          const access_token =
            hashParams.get('access_token') || queryParams.get('access_token');
          const refresh_token =
            hashParams.get('refresh_token') || queryParams.get('refresh_token');

          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token
            });

            if (sessionError) throw sessionError;
            console.log('Login efetuado com sucesso!');
          } else {
            console.error(
              'Tokens não encontrados na URL de retorno. URL recebida:',
              result.url
            );
          }
        }
      }
    } catch (error) {
      console.error('Erro ao fazer login com o Google:', error);
      throw error;
    }
  };

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await fetchProfile(user.id);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    let profileSubscription: RealtimeChannel | null = null;

    const setupProfileSubscription = (userId: string) => {
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }

      profileSubscription = supabase
        .channel(`public:profiles:id=eq.${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${userId}`
          },
          payload => {
            console.log('Perfil atualizado em tempo real:', payload.new);
            setProfile(payload.new as Profile);
          }
        )
        .subscribe();
    };

    // Check session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        void fetchProfile(currentUser.id);
        setupProfileSubscription(currentUser.id);
        onLogin(currentUser.id);
      } else {
        setLoadingProfile(false);
        onLogout();
      }
    });

    // Handle auth state changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        void fetchProfile(currentUser.id);
        setupProfileSubscription(currentUser.id);
        onLogin(currentUser.id);
      } else {
        if (profileSubscription) {
          supabase.removeChannel(profileSubscription);
          profileSubscription = null;
        }
        setProfile(null);
        setLoadingProfile(false);
        onLogout();
      }
    });

    return () => {
      subscription.unsubscribe();
      if (profileSubscription) {
        supabase.removeChannel(profileSubscription);
      }
    };
  }, []);

  return {
    user,
    profile,
    isAdmin,
    loadingProfile,
    signInWithGoogle,
    signOut,
    updateProfile
  };
}
