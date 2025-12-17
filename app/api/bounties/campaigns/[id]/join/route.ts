import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * POST /api/bounties/campaigns/[id]/join
 * Join a bounty campaign as a participant
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Check if campaign exists and is active
    const campaign = await prisma.bountyCampaign.findUnique({
      where: { id: campaignId },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      )
    }

    // Check if user already joined
    const existing = await prisma.bountyParticipant.findUnique({
      where: {
        campaignId_userId: {
          campaignId,
          userId,
        },
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'You have already joined this campaign' },
        { status: 400 }
      )
    }

    // Generate unique referral code
    const referralCode = `${campaignId.slice(0, 8)}-${userId.slice(0, 8)}-${Date.now().toString(36)}`.toUpperCase()
    
    // Generate referral URL (for CONVERSION bounties)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
    const referralUrl = campaign.type === 'CONVERSION' 
      ? `${baseUrl}/marketplace?ref=${referralCode}`
      : null

    // Create participant
    const participant = await prisma.bountyParticipant.create({
      data: {
        campaignId,
        userId,
        referralCode,
        referralUrl,
        status: 'ACTIVE',
      },
      include: {
        campaign: true,
      },
    })

    return NextResponse.json({ 
      participant,
      message: 'Successfully joined campaign',
    }, { status: 201 })
  } catch (error) {
    console.error('[BOUNTIES_JOIN] Error:', error)
    return NextResponse.json(
      { error: 'Failed to join campaign' },
      { status: 500 }
    )
  }
}
