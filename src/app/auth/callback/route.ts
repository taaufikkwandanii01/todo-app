import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Handler OAuth callback dari Supabase.
 * Supabase redirect ke /auth/callback?code=xxx setelah login Google berhasil.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/todos';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Gagal → redirect ke login dengan pesan error
  return NextResponse.redirect(`${origin}/auth/login?error=oauth_failed`);
}
