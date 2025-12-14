import { NextRequest, NextResponse } from 'next/server'
import { getProjectsByOwner, searchProjects, getVaultStats, createProject } from '@/lib/sessionVaultStore'
import { VaultFilters } from '@/types/sessionVault'

/**
 * GET /api/session-vault/projects
 * Get projects with optional filters
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  
  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    )
  }
  
  // Parse filters
  const filters: VaultFilters = {}
  
  if (searchParams.has('search')) {
    filters.search = searchParams.get('search')!
  }
  
  if (searchParams.has('status')) {
    filters.status = searchParams.get('status')!.split(',') as any
  }
  
  if (searchParams.has('hasStems')) {
    filters.hasStems = searchParams.get('hasStems') === 'true'
  }
  
  if (searchParams.has('hasSession')) {
    filters.hasSession = searchParams.get('hasSession') === 'true'
  }
  
  if (searchParams.has('hasContracts')) {
    filters.hasContracts = searchParams.get('hasContracts') === 'true'
  }
  
  if (searchParams.has('tags')) {
    filters.tags = searchParams.get('tags')!.split(',')
  }
  
  if (searchParams.has('bpmMin') && searchParams.has('bpmMax')) {
    filters.bpmRange = [
      parseInt(searchParams.get('bpmMin')!),
      parseInt(searchParams.get('bpmMax')!)
    ]
  }
  
  if (searchParams.has('roleContext')) {
    filters.roleContext = searchParams.get('roleContext')!.split(',') as any
  }
  
  // Get projects
  const projects = Object.keys(filters).length > 0
    ? searchProjects(userId, filters)
    : getProjectsByOwner(userId)
  
  // Get stats
  const stats = getVaultStats(userId)
  
  return NextResponse.json({
    projects,
    stats,
  })
}

/**
 * POST /api/session-vault/projects
 * Create a new project
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, description, color, status } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      )
    }

    // Create the project
    const project = createProject({
      ownerUserId: userId,
      title: title.trim(),
      notes: description || '',
      color: color || '#00ff41',
      status: status || 'ACTIVE',
      roleContext: 'PRODUCER',
      tags: [],
      hasStems: false,
      hasSession: false,
      hasContracts: false,
      folders: [],
      collaborators: [],
      comments: [],
    })

    console.log('[SESSION_VAULT_API] Project created:', project.id)

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error('[SESSION_VAULT_API] Error creating project:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
