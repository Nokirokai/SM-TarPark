import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// Supabase client - ONLY used for OAuth redirect flow
// All other auth goes through our server session system
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: false,
    detectSessionInUrl: true,
    persistSession: true,
    storage: window.localStorage,
  },
});

// ============= SERVER SESSION AUTH =============
// This replaces all JWT-based auth. The server manages sessions in KV store.

const SESSION_TOKEN_KEY = 'smtarpark_session_token';
const SESSION_USER_KEY = 'smtarpark_session_user';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'toll';
}

// Get stored session token
export const getSessionToken = (): string | null => {
  return localStorage.getItem(SESSION_TOKEN_KEY);
};

// Get stored user data
export const getStoredUser = (): AppUser | null => {
  const raw = localStorage.getItem(SESSION_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

// Save session to localStorage
export const saveSession = (token: string, user: AppUser): void => {
  localStorage.setItem(SESSION_TOKEN_KEY, token);
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
};

// Clear session from localStorage
export const clearSession = (): void => {
  localStorage.removeItem(SESSION_TOKEN_KEY);
  localStorage.removeItem(SESSION_USER_KEY);
};

// OAuth helpers (still uses Supabase client for redirect)
export const oauthHelpers = {
  async signInWithOAuth(provider: 'google' | 'github' | 'facebook') {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        skipBrowserRedirect: false,
      }
    });
    if (error) throw error;
    return data;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};
