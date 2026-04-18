import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/pricing'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options))
            } catch {}
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Session is now set via cookies — redirect within the same tab
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
      const redirectUrl = new URL(next, appUrl)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Something went wrong — send to login with error hint
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || origin
  return NextResponse.redirect(new URL('/login?error=verification_failed', appUrl))
}
