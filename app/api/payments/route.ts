import { NextRequest, NextResponse } from 'next/server';
import { getAllPayments, getUserPaymentHistory } from '@/lib/stores/paymentStore';

/**
 * GET /api/payments?userId=xxx
 * Get payment history for a user
 * 
 * Query params:
 * - userId: string (required)
 * - limit: number (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const payments = getUserPaymentHistory(
      userId, 
      limit ? parseInt(limit) : undefined
    );

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('[PAYMENTS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}
