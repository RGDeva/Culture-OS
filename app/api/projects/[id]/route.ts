import { NextRequest, NextResponse } from 'next/server';
import { getProject, updateProject, deleteProject, inviteUserToProject } from '@/lib/stores/projectStore';

/**
 * GET /api/projects/[id]
 * Get a single project by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = getProject(params.id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ project });
  } catch (error) {
    console.error('[PROJECT_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/projects/[id]
 * Update a project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { inviteUserId, ...updateData } = body;

    // Handle user invitation separately
    if (inviteUserId) {
      const project = inviteUserToProject(params.id, inviteUserId);
      if (!project) {
        return NextResponse.json(
          { error: 'Project not found' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, project });
    }

    // Regular update
    const project = updateProject(params.id, updateData);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('[PROJECT_API] Project updated:', { projectId: params.id });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('[PROJECT_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/projects/[id]
 * Delete a project
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = deleteProject(params.id);

    if (!success) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    console.log('[PROJECT_API] Project deleted:', { projectId: params.id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[PROJECT_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
