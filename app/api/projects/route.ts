import { NextRequest, NextResponse } from 'next/server';
import { 
  getAllProjects, 
  getProjectsByOwner, 
  getOpenCollabProjects, 
  createProject 
} from '@/lib/stores/projectStore';
import { addXp } from '@/lib/profileStore';
import { xpForEvent } from '@/lib/xp';

/**
 * GET /api/projects
 * List projects with optional filters
 * 
 * Query params:
 * - userId: filter by owner
 * - visibility: PRIVATE | INVITE_ONLY | OPEN_FOR_COLLAB
 * - status: IDEA | IN_PROGRESS | DONE
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const visibility = searchParams.get('visibility');
    const status = searchParams.get('status');

    let projects = userId 
      ? getProjectsByOwner(userId)
      : visibility === 'OPEN_FOR_COLLAB'
      ? getOpenCollabProjects()
      : getAllProjects();

    // Filter by status if provided
    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    // Filter by visibility if provided (and not already filtered)
    if (visibility && visibility !== 'OPEN_FOR_COLLAB') {
      projects = projects.filter(p => p.visibility === visibility);
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('[PROJECTS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...projectData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    if (!projectData.title) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    // Create project
    const project = createProject(userId, projectData);

    // Award XP for creating project
    addXp(userId, xpForEvent('CREATE_PROJECT'));

    console.log('[PROJECTS_API] Project created:', { projectId: project.id, userId });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('[PROJECTS_API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
