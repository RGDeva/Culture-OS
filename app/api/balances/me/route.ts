export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'

// In-memory balances store (mock data)
const mockBalances: Record<string, Record<string, { availableCents: number; pendingCents: number }>> = {}

// GET /api/balances/me - get balances for current user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 401 }
      )
    }

    // Return mock balances or empty
    const userBalances = mockBalances[userId] || {
      USD: { availableCents: 0, pendingCents: 0 }
    }

    const balancesByCurrency: Record<string, { availableCents: number; pendingCents: number; totalCents: number }> = {}
    
    for (const [currency, balance] of Object.entries(userBalances)) {
      balancesByCurrency[currency] = {
        availableCents: balance.availableCents,
        pendingCents: balance.pendingCents,
        totalCents: balance.availableCents + balance.pendingCents,
      }
    }

    return NextResponse.json({ balances: balancesByCurrency })
  } catch (error) {
    console.error('[BALANCES] Error fetching balances:', error)
    return NextResponse.json(
      { error: 'Failed to fetch balances' },
      { status: 500 }
    )
  }
}
