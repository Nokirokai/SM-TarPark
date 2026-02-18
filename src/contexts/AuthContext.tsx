import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AppUser,
  getSessionToken,
  getStoredUser,
  saveSession,
  clearSession,
  oauthHelpers,
} from '../utils/supabaseClient';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AppUser>;
  signInWithOAuth: (provider: 'google' | 'github' | 'facebook') => Promise<void>;
  signUp: (email: string, password: string, userData: { name: string; role: string; [key: string]: any }) => Promise<void>;
  signOut: () => Promise<void>;
  exchangeOAuthToken: (supabaseAccessToken: string) => Promise<AppUser>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount, check for existing session
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const token = getSessionToken();
      const storedUser = getStoredUser();

      if (!token || !storedUser) {
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // Verify session is still valid on server
      try {
        const { user: serverUser } = await authAPI.me();
        if (mounted) {
          setUser(serverUser);
          // Update local storage in case server has newer data
          saveSession(token, serverUser);
        }
      } catch {
        // Session expired or invalid - clear local storage
        console.log('Session expired, clearing local state');
        clearSession();
        if (mounted) {
          setUser(null);
        }
      }

      if (mounted) {
        setLoading(false);
      }
    };

    checkSession();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AppUser> => {
    try {
      const { token, user: serverUser } = await authAPI.login(email, password);
      saveSession(token, serverUser);
      setUser(serverUser);
      return serverUser;
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'facebook') => {
    try {
      await oauthHelpers.signInWithOAuth(provider);
      // User will be redirected to OAuth provider
      // They'll return via /auth/callback where we exchange the token
    } catch (error) {
      console.error('OAuth sign in error:', error);
      throw error;
    }
  };

  const exchangeOAuthToken = async (supabaseAccessToken: string): Promise<AppUser> => {
    try {
      const { token, user: serverUser } = await authAPI.exchangeOAuthToken(supabaseAccessToken);
      saveSession(token, serverUser);
      setUser(serverUser);
      return serverUser;
    } catch (error) {
      console.error('OAuth exchange error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: { name: string; role: string; [key: string]: any }) => {
    try {
      await authAPI.signup(email, password, userData);
      // After signup, sign in the user
      await signIn(email, password);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout API error (non-critical):', error);
    }
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signInWithOAuth,
      signUp,
      signOut,
      exchangeOAuthToken,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // During HMR, context might be temporarily undefined
    // Return a safe default instead of throwing
    const isDev = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';
    if (isDev) {
      console.warn('useAuth called outside AuthProvider (possibly during HMR)');
      return {
        user: null,
        loading: true,
        signIn: async () => { throw new Error('AuthProvider not ready'); },
        signInWithOAuth: async () => { throw new Error('AuthProvider not ready'); },
        signUp: async () => { throw new Error('AuthProvider not ready'); },
        signOut: async () => { throw new Error('AuthProvider not ready'); },
        exchangeOAuthToken: async () => { throw new Error('AuthProvider not ready'); },
      } as AuthContextType;
    }
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}