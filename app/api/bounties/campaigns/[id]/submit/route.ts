import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * POST /api/bounties/campaigns/[id]/submit
 * Submit proof (social post URL) for a VIEW bounty
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const body = await request.json()
    const { userId, postUrl, platform, initialMetrics } = body

    if (!userId || !postUrl || !platform) {
      return NextResponse.json(
        { error: 'userId, postUrl, and platform are required' },
        { status: 400 }
      )
    }

    // Verify participant exists
    const participant = await prisma.bountyParticipant.findUnique({
      where: {
        campaignId_userId: {
          campaignId,
          userId,
        },
      },
      include: {
        campaign: true,
      },
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'You must join the campaign before submitting' },
        { status: 400 }
      )
    }

    if (participant.campaign.type !== 'VIEW') {
      return NextResponse.json(
        { error: 'Submissions are only for VIEW bounties' },
        { status: 400 }
      )
    }

    if (participant.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Your participation status is not active' },
        { status: 400 }
      )
    }

    // Check for duplicate submission
    const existingSubmission = await prisma.bountySubmission.findFirst({
      where: {
        participantId: participant.id,
        postUrl,
      },
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'This post URL has already been submitted' },
        { status: 400 }
      )
    }

    // Create submission
    const submission = await prisma.bountySubmission.create({
      data: {
        participantId: participant.id,
        postUrl,
        platform: platform.toUpperCase(),
        metricsJson: JSON.stringify(initialMetrics || { views: 0, likes: 0, comments: 0 }),
        status: 'PENDING',
      },
    })

    return NextResponse.json({ 
      submission,
      message: 'Submission created successfully. Metrics will be tracked automatically.',
    }, { status: 201 })
  } catch (error) {
    console.error('[BOUNTIES_SUBMIT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
