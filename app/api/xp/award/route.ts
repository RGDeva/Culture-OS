import { NextRequest, NextResponse } from 'next/server';
import { addXp } from '@/lib/profileStore';
import { xpForEvent, XpEvent } from '@/lib/xp';

/**
 * POST /api/xp/award
 * Award XP to a user for an event
 * 
 * Body: { userId: string, event: XpEvent }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, event } = body;

    if (!userId || !event) {
      return NextResponse.json(
        { error: 'userId and event are required' },
        { status: 400 }
      );
    }

    // Get XP amount for event
    const amount = xpForEvent(event as XpEvent);

    // Add XP to user profile
    const profile = addXp(userId, amount);

    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    console.log('[XP_API] Awarded XP:', { userId, event, amount, newTotal: profile.xp });

    return NextResponse.json({ 
      success: true, 
      xp: profile.xp,
      awarded: amount,
      event
    });
  } catch (error) {
    console.error('[XP_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
