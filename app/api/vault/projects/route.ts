import { NextRequest, NextResponse } from 'next/server'
import { createVaultProject, getVaultProjects, getVaultProjectsByUser } from '@/lib/vaultStore'

// GET /api/vault/projects - Get all projects or filter by userId
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const projects = userId ? getVaultProjectsByUser(userId) : getVaultProjects()

  return NextResponse.json({ projects })
}

// POST /api/vault/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, title, tags, previewUrl, stemsUrl, openRoles } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Create the project
    const project = createVaultProject({
      userId,
      title: title.trim(),
      tags: tags || [],
      previewUrl: previewUrl || undefined,
      stemsUrl: stemsUrl || undefined,
      openRoles: openRoles || []
    })

    console.log('[VAULT_API] Project created:', project.id)

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error('[VAULT_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
