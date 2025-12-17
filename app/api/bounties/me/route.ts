import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * GET /api/bounties/me
 * Get user's joined campaigns and earnings
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Get all participations
    const participations = await prisma.bountyParticipant.findMany({
      where: { userId },
      include: {
        campaign: {
          include: {
            assetLinks: true,
          },
        },
        submissions: {
          orderBy: { submittedAt: 'desc' },
        },
        earnings: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    })

    // Calculate totals
    const totalEarningsCents = participations.reduce(
      (sum, p) => sum + p.earnings.reduce((eSum, e) => eSum + e.amountCents, 0),
      0
    )

    const pendingEarningsCents = participations.reduce(
      (sum, p) => sum + p.earnings.filter(e => e.status === 'PENDING').reduce((eSum, e) => eSum + e.amountCents, 0),
      0
    )

    const availableEarningsCents = participations.reduce(
      (sum, p) => sum + p.earnings.filter(e => e.status === 'AVAILABLE').reduce((eSum, e) => eSum + e.amountCents, 0),
      0
    )

    const paidEarningsCents = participations.reduce(
      (sum, p) => sum + p.earnings.filter(e => e.status === 'PAID').reduce((eSum, e) => eSum + e.amountCents, 0),
      0
    )

    const totalSubmissions = participations.reduce(
      (sum, p) => sum + p.submissions.length,
      0
    )

    return NextResponse.json({
      participations,
      summary: {
        totalCampaigns: participations.length,
        activeCampaigns: participations.filter(p => p.campaign.status === 'ACTIVE').length,
        totalSubmissions,
        earnings: {
          totalCents: totalEarningsCents,
          pendingCents: pendingEarningsCents,
          availableCents: availableEarningsCents,
          paidCents: paidEarningsCents,
        },
      },
    })
  } catch (error) {
    console.error('[BOUNTIES_ME] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user bounties' },
      { status: 500 }
    )
  }
}
