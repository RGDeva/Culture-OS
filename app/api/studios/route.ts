import { NextRequest, NextResponse } from 'next/server';
import { getAllStudios, createStudio } from '@/lib/stores/studioStore';

/**
 * GET /api/studios
 * List all studios
 */
export async function GET(request: NextRequest) {
  try {
    const studios = getAllStudios();
    return NextResponse.json({ studios });
  } catch (error) {
    console.error('[STUDIOS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studios' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/studios
 * Create a new studio
 * 
 * TODO: Add admin-only check
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    // TODO: Check if user is admin
    // const adminEmails = process.env.NC_ADMIN_EMAILS?.split(',') || [];
    // if (!adminEmails.includes(userEmail)) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

    const studio = createStudio(body);

    console.log('[STUDIOS_API] Studio created:', { studioId: studio.id });

    return NextResponse.json({ success: true, studio });
  } catch (error) {
    console.error('[STUDIOS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create studio' },
      { status: 500 }
    );
  }
}
