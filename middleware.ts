import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPrivyClient } from './lib/privy'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const token = request.cookies.get('privy-token')?.value

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/api/auth', '/', '/_next', '/favicon.ico'];
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next()
  }

  // Check if Privy is configured
  if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID || !process.env.PRIVY_APP_SECRET) {
    console.warn('Privy not configured, allowing access')
    return NextResponse.next()
  }

  // If no auth token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify the token with Privy. Avoid any DB or server-only SDK calls in middleware.
    const privy = getPrivyClient()
    await privy.verifyAuthToken(token)

    // If verification passes, allow the request to continue.
    return NextResponse.next()
  } catch (error) {
    console.error('Auth error:', error)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', path)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
