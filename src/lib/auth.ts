/**
 * lib/auth.ts
 * Logika autentikasi — Google OAuth via Supabase
 */
import { createClient } from '@/lib/supabase/client';

/** Login dengan Google OAuth */
export async function signInWithGoogle(): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });

  if (error) throw new Error(error.message);
}

/** Logout */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

/** Ambil user yang sedang login (browser) */
export async function getCurrentUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
