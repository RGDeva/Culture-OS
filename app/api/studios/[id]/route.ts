import { NextRequest, NextResponse } from 'next/server';
import { getStudio, updateStudio, deleteStudio } from '@/lib/stores/studioStore';

/**
 * GET /api/studios/[id]
 * Get a single studio by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const studio = getStudio(params.id);

    if (!studio) {
      return NextResponse.json(
        { error: 'Studio not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ studio });
  } catch (error) {
    console.error('[STUDIO_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch studio' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/studios/[id]
 * Update a studio
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const studio = updateStudio(params.id, body);

    if (!studio) {
      return NextResponse.json(
        { error: 'Studio not found' },
        { status: 404 }
      );
    }

    console.log('[STUDIO_API] Studio updated:', { studioId: params.id });

    return NextResponse.json({ success: true, studio });
  } catch (error) {
    console.error('[STUDIO_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update studio' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/studios/[id]
 * Delete a studio
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteStudio(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Studio not found' },
        { status: 404 }
      );
    }

    console.log('[STUDIO_API] Studio deleted:', { studioId: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[STUDIO_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete studio' },
      { status: 500 }
    );
  }
}
