import { NextRequest, NextResponse } from 'next/server';
import { getEarningsSummary } from '@/lib/stores/paymentStore';

/**
 * GET /api/payments/earnings?userId=xxx
 * Get earnings summary for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const earnings = getEarningsSummary(userId);

    return NextResponse.json({ earnings });
  } catch (error) {
    console.error('[EARNINGS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings' },
      { status: 500 }
    );
  }
}
