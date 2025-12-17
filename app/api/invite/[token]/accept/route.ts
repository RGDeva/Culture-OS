import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { sendInvitationAcceptedNotification } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user'
    const { token } = params

    // Find invitation
    const invitation = await prisma.collaboratorInvitation.findUnique({
      where: { token }
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if already accepted
    if (invitation.status === 'ACCEPTED') {
      return NextResponse.json(
        { error: 'Invitation has already been accepted' },
        { status: 400 }
      )
    }

    // Check if expired
    if (new Date() > invitation.expiresAt) {
      await prisma.collaboratorInvitation.update({
        where: { id: invitation.id },
        data: { status: 'EXPIRED' }
      })
      
      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if user is already a collaborator
    const existingCollaborator = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_userId: {
          projectId: invitation.projectId,
          userId
        }
      }
    })

    if (existingCollaborator) {
      return NextResponse.json(
        { error: 'You are already a collaborator on this project' },
        { status: 400 }
      )
    }

    // Create collaborator
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId: invitation.projectId,
        userId,
        role: invitation.role,
        splitPercentage: invitation.splitPercentage,
        canEdit: invitation.role !== 'VIEWER',
        canInvite: invitation.role === 'ADMIN' || invitation.role === 'OWNER',
        canManageSplits: invitation.role === 'ADMIN' || invitation.role === 'OWNER',
        invitedBy: invitation.invitedBy
      }
    })

    // Update invitation status
    await prisma.collaboratorInvitation.update({
      where: { id: invitation.id },
      data: {
        status: 'ACCEPTED',
        acceptedAt: new Date()
      }
    })

    // Send notification to inviter
    try {
      await sendInvitationAcceptedNotification(
        invitation.invitedBy, // This should be the inviter's email
        'User', // Get from User model in production
        userId, // Get actual email from User model
        `Project ${invitation.projectId}` // Get actual project name
      )
    } catch (emailError) {
      console.error('Failed to send acceptance notification:', emailError)
    }

    return NextResponse.json({
      success: true,
      collaborator: {
        id: collaborator.id,
        projectId: collaborator.projectId,
        role: collaborator.role,
        splitPercentage: collaborator.splitPercentage
      }
    })
  } catch (error) {
    console.error('Error accepting invitation:', error)
    return NextResponse.json(
      { error: 'Failed to accept invitation' },
      { status: 500 }
    )
  }
}
