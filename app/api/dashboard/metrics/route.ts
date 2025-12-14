import { NextRequest, NextResponse } from 'next/server';
import { getDashboardMetrics, getProfileProgress, getConnectedPlatforms } from '@/lib/dashboardMetrics';

/**
 * GET /api/dashboard/metrics?userId=xxx
 * Get all dashboard metrics for a user
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

    const metrics = getDashboardMetrics(userId);
    const progress = getProfileProgress(userId);
    const platforms = getConnectedPlatforms(userId);

    return NextResponse.json({
      metrics,
      progress,
      platforms,
    });
  } catch (error) {
    console.error('[DASHBOARD_METRICS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  }
}
