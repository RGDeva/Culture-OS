import { NextRequest, NextResponse } from 'next/server'
import { createOnrampSession } from '@/lib/zkp2p'
import { PrivyClient } from '@privy-io/server-auth'

const privy = new PrivyClient(
  process.env.NEXT_PUBLIC_PRIVY_APP_ID!,
  process.env.PRIVY_APP_SECRET!
)

/**
 * POST /api/zkp2p/onramp
 * Create a new zkp2p on-ramp session
 * 
 * Body: { amountUsd: number, memo?: string }
 * 
 * Returns: Zkp2pOnrampSession with payment instructions
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user via Privy
    const authToken = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let user
    try {
      const verifiedClaims = await privy.verifyAuthToken(authToken)
      user = verifiedClaims
    } catch (error) {
      console.error('[ONRAMP_API] Auth verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await request.json()
    const { amountUsd, memo } = body

    if (!amountUsd || typeof amountUsd !== 'number') {
      return NextResponse.json(
        { error: 'amountUsd is required and must be a number' },
        { status: 400 }
      )
    }

    // Validate amount range
    if (amountUsd < 1 || amountUsd > 5000) {
      return NextResponse.json(
        { error: 'Amount must be between $1 and $5000' },
        { status: 400 }
      )
    }

    // 3. Get user's Base wallet address from Privy
    // The user object from Privy contains wallet information
    const userWalletAddress = (user as any).wallet?.address || (user as any).linkedAccounts?.find(
      (account: any) => account.type === 'wallet'
    )?.address

    if (!userWalletAddress) {
      return NextResponse.json(
        { error: 'No wallet address found. Please connect a wallet first.' },
        { status: 400 }
      )
    }

    console.log('[ONRAMP_API] Creating session for user:', {
      userId: user.userId,
      wallet: userWalletAddress,
      amount: amountUsd,
    })

    // 4. Create on-ramp session via zkp2p
    const session = await createOnrampSession({
      userWalletAddress,
      amountUsd,
      memo,
    })

    // TODO: Store session in database for tracking
    // TODO: Associate session with user ID for history

    console.log('[ONRAMP_API] Session created successfully:', session.id)

    // 5. Return session info to client
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        amountUsd: session.amountUsd,
        paymentInstructions: session.paymentInstructions,
        createdAt: session.createdAt,
      },
    })
  } catch (error: any) {
    console.error('[ONRAMP_API] Error creating session:', error)
    
    // Return generic error to client, log details server-side
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create on-ramp session. Please try again.',
      },
      { status: 500 }
    )
  }
}
