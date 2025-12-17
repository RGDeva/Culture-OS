import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'
import { sendCollaboratorInvitation } from '@/lib/email'

const prisma = new PrismaClient()

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get('x-user-id') || 'demo-user'
    const projectId = params.id
    const body = await req.json()
    const { email, role, splitPercentage, message } = body

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.collaboratorInvitation.findFirst({
      where: {
        projectId,
        email,
        status: 'PENDING'
      }
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      )
    }

    // Generate unique invitation token
    const token = crypto.randomBytes(32).toString('hex')
    
    // Set expiration to 7 days from now
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    // Create invitation
    const invitation = await prisma.collaboratorInvitation.create({
      data: {
        projectId,
        email,
        invitedBy: userId,
        role: role || 'COLLABORATOR',
        splitPercentage: splitPercentage || 0,
        message,
        token,
        expiresAt
      }
    })

    // Get project details for email (using placeholder for MVP)
    const projectName = `Project ${projectId}`
    const inviterName = 'Team Member'
    const inviterEmail = 'team@noculture.com'

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/invite/${token}`
    
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        await sendCollaboratorInvitation({
          to: email,
          projectName,
          inviterName,
          inviterEmail,
          invitationUrl,
          role: invitation.role,
          splitPercentage: invitation.splitPercentage || undefined,
          message: invitation.message || undefined
        })
      } else {
        console.warn('Email not configured - invitation created but email not sent')
      }
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError)
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        splitPercentage: invitation.splitPercentage,
        status: invitation.status,
        expiresAt: invitation.expiresAt,
        invitationUrl
      }
    })
  } catch (error) {
    console.error('Error creating invitation:', error)
    return NextResponse.json(
      { error: 'Failed to create invitation' },
      { status: 500 }
    )
  }
}

// Get all invitations and collaborators for a project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id

    const [invitations, collaborators] = await Promise.all([
      prisma.collaboratorInvitation.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.projectCollaborator.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' }
      })
    ])

    return NextResponse.json({ invitations, collaborators })
  } catch (error) {
    console.error('Error fetching collaborators:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collaborators' },
      { status: 500 }
    )
  }
}
