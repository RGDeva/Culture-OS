/**
 * Privy Server-Side Authentication for Next.js Route Handlers
 * 
 * Implements secure server-side verification of Privy authentication tokens.
 * Never relies on client-provided user IDs in production.
 */

import { NextRequest } from 'next/server'
import { PrivyClient } from '@privy-io/server-auth'

// Initialize Privy client (singleton)
let privyClient: PrivyClient | null = null

function getPrivyClient(): PrivyClient {
  if (privyClient) return privyClient

  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const appSecret = process.env.PRIVY_APP_SECRET

  if (!appId || !appSecret) {
    throw new Error('Privy credentials not configured. Set NEXT_PUBLIC_PRIVY_APP_ID and PRIVY_APP_SECRET')
  }

  privyClient = new PrivyClient(appId, appSecret)
  return privyClient
}

/**
 * Extract Privy access token from request
 * Checks Authorization header and privy-access-token cookie
 */
function extractPrivyToken(req: NextRequest): string | null {
  // Check Authorization header (Bearer token)
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Check privy-access-token cookie
  const tokenCookie = req.cookies.get('privy-access-token')?.value
  if (tokenCookie) {
    return tokenCookie
  }

  return null
}

/**
 * Verify Privy authentication and return user ID
 * 
 * @param req - Next.js request object
 * @returns Privy user ID if authenticated, null otherwise
 */
export async function getPrivyUserId(req: NextRequest): Promise<string | null> {
  // DEV-ONLY: Allow bypass with x-dev-user-id header in non-production
  if (process.env.NODE_ENV !== 'production') {
    const devUserId = req.headers.get('x-dev-user-id')
    if (devUserId) {
      console.log(`[Auth] DEV MODE: Using x-dev-user-id: ${devUserId}`)
      return devUserId
    }
  }

  // Extract token from request
  const token = extractPrivyToken(req)
  if (!token) {
    return null
  }

  try {
    // Verify token with Privy server
    const client = getPrivyClient()
    const verifiedClaims = await client.verifyAuthToken(token)
    
    // Extract user ID from verified claims
    const userId = verifiedClaims.userId
    
    if (!userId) {
      console.error('[Auth] Verified token but no userId in claims')
      return null
    }

    console.log(`[Auth] Authenticated Privy user: ${userId}`)
    return userId

  } catch (error) {
    console.error('[Auth] Token verification failed:', error)
    return null
  }
}

/**
 * Require Privy authentication - throws if not authenticated
 * 
 * @param req - Next.js request object
 * @returns Privy user ID
 * @throws Error if not authenticated
 */
export async function requirePrivyUser(req: NextRequest): Promise<string> {
  const userId = await getPrivyUserId(req)
  
  if (!userId) {
    throw new Error('UNAUTHORIZED')
  }

  return userId
}

/**
 * Get Privy user details (optional - for additional user info)
 * 
 * @param userId - Privy user ID
 * @returns User object from Privy
 */
export async function getPrivyUser(userId: string) {
  try {
    const client = getPrivyClient()
    const user = await client.getUser(userId)
    return user
  } catch (error) {
    console.error('[Auth] Failed to get Privy user:', error)
    return null
  }
}

/**
 * Check if Privy is properly configured
 */
export function isPrivyConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_PRIVY_APP_ID &&
    process.env.PRIVY_APP_SECRET
  )
}
