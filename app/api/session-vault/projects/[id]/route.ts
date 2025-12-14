import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, deleteProject } from '@/lib/sessionVaultStore'
import { getAssetsByProject } from '@/lib/sessionVaultStore'

/**
 * GET /api/session-vault/projects/[id]
 * Get a single project with its assets
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const project = getProject(id)
  
  if (!project) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }
  
  const assets = getAssetsByProject(id)
  
  return NextResponse.json({
    project,
    assets,
  })
}

/**
 * PATCH /api/session-vault/projects/[id]
 * Update a project
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const updated = updateProject(id, body)
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true, project: updated })
  } catch (error) {
    console.error('[SESSION_VAULT_API] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/session-vault/projects/[id]
 * Delete a project and all its assets
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteProject(id)
  
  if (!deleted) {
    return NextResponse.json(
      { error: 'Project not found' },
      { status: 404 }
    )
  }
  
  return NextResponse.json({ success: true })
}
