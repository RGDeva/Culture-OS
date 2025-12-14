import { NextRequest, NextResponse } from 'next/server'
import { 
  calculateTotalEarnings, 
  calculateMonthlyEarnings,
  getEarningsBreakdown,
  getUserEarnings 
} from '@/lib/stores/orderStore'

/**
 * GET /api/orders/earnings?userId=xxx
 * Get earnings summary from orders
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    const totalEarned = calculateTotalEarnings(userId)
    const thisMonth = calculateMonthlyEarnings(userId)
    const breakdown = getEarningsBreakdown(userId)
    const recentOrders = getUserEarnings(userId).slice(0, 10)

    return NextResponse.json({
      totalEarned,
      thisMonth,
      breakdown,
      recentOrders,
    })
  } catch (error) {
    console.error('[ORDERS_EARNINGS_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    )
  }
}
