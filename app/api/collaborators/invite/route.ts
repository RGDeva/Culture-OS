import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for invitations (replace with database in production)
const invitations = new Map<string, {
  id: string
  assetId: string
  projectId?: string
  email: string
  role: string
  invitedBy: string
  status: 'pending' | 'accepted' | 'declined'
  createdAt: string
  token: string
}>()

// POST /api/collaborators/invite - Send invitation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { assetId, projectId, email, role, invitedBy, invitedByName } = body
    
    if (!email || !role || !invitedBy) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Generate unique invitation token
    const token = `invite_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const invitation = {
      id: `collab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      assetId: assetId || '',
      projectId: projectId || '',
      email,
      role,
      invitedBy,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
      token,
    }
    
    invitations.set(invitation.id, invitation)
    
    // In production, send actual email here
    console.log('[COLLABORATORS] Invitation created:', {
      email,
      role,
      invitedBy: invitedByName,
      token,
    })
    
    // Simulate email sending
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/invite/${token}`
    console.log('[COLLABORATORS] Invite URL:', inviteUrl)
    
    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        createdAt: invitation.createdAt,
      },
      inviteUrl, // Return URL for testing
    })
  } catch (error) {
    console.error('[COLLABORATORS] Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

// GET /api/collaborators/invite?assetId=xxx or ?projectId=xxx - List invitations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assetId = searchParams.get('assetId')
    const projectId = searchParams.get('projectId')
    
    if (!assetId && !projectId) {
      return NextResponse.json(
        { error: 'assetId or projectId required' },
        { status: 400 }
      )
    }
    
    const filtered = Array.from(invitations.values()).filter(inv => {
      if (assetId) return inv.assetId === assetId
      if (projectId) return inv.projectId === projectId
      return false
    })
    
    return NextResponse.json({
      invitations: filtered.map(inv => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        createdAt: inv.createdAt,
      })),
    })
  } catch (error) {
    console.error('[COLLABORATORS] Error fetching invitations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    )
  }
}

// DELETE /api/collaborators/invite?id=xxx - Cancel invitation
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json(
        { error: 'Invitation id required' },
        { status: 400 }
      )
    }
    
    invitations.delete(id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[COLLABORATORS] Error deleting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    )
  }
}
