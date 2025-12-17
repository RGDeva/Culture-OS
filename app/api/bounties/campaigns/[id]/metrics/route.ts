import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * GET /api/bounties/campaigns/[id]/metrics
 * Get campaign metrics for creator dashboard
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const { searchParams } = new URL(request.url)
    const creatorId = searchParams.get('creatorId')

    // Verify campaign exists
    const campaign = await prisma.bountyCampaign.findUnique({
      where: { id: campaignId },
      include: {
        participants: {
          include: {
            submissions: true,
            earnings: true,
          },
        },
      },
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Verify creator ownership
    if (creatorId && campaign.creatorId !== creatorId) {
      return NextResponse.json(
        { error: 'Unauthorized: You are not the campaign creator' },
        { status: 403 }
      )
    }

    // Calculate metrics
    const totalParticipants = campaign.participants.length
    const activeParticipants = campaign.participants.filter(p => p.status === 'ACTIVE').length
    
    const totalSubmissions = campaign.participants.reduce(
      (sum, p) => sum + p.submissions.length,
      0
    )
    
    const approvedSubmissions = campaign.participants.reduce(
      (sum, p) => sum + p.submissions.filter(s => s.status === 'APPROVED').length,
      0
    )
    
    const pendingSubmissions = campaign.participants.reduce(
      (sum, p) => sum + p.submissions.filter(s => s.status === 'PENDING').length,
      0
    )

    // Calculate total spend
    const totalSpentCents = campaign.participants.reduce(
      (sum, p) => sum + p.earnings.reduce((eSum, e) => eSum + e.amountCents, 0),
      0
    )

    const pendingPayoutsCents = campaign.participants.reduce(
      (sum, p) => sum + p.earnings.filter(e => e.status === 'PENDING').reduce((eSum, e) => eSum + e.amountCents, 0),
      0
    )

    const paidOutCents = campaign.participants.reduce(
      (sum, p) => sum + p.earnings.filter(e => e.status === 'PAID').reduce((eSum, e) => eSum + e.amountCents, 0),
      0
    )

    // Calculate total views (for VIEW bounties)
    let totalViews = 0
    if (campaign.type === 'VIEW') {
      campaign.participants.forEach(p => {
        p.submissions.forEach(s => {
          try {
            const metrics = JSON.parse(s.metricsJson)
            totalViews += metrics.views || 0
          } catch (e) {
            // Ignore parse errors
          }
        })
      })
    }

    // Calculate ROI placeholder (for CONVERSION bounties)
    let totalRevenueCents = 0
    let conversionCount = 0
    if (campaign.type === 'CONVERSION') {
      // This would be calculated from actual sales data
      // For now, we'll return placeholders
      totalRevenueCents = 0
      conversionCount = 0
    }

    const metrics = {
      campaignId,
      type: campaign.type,
      status: campaign.status,
      budgetCents: campaign.budgetCents,
      totalSpentCents,
      remainingBudgetCents: campaign.budgetCents - totalSpentCents,
      
      participants: {
        total: totalParticipants,
        active: activeParticipants,
      },
      
      submissions: {
        total: totalSubmissions,
        approved: approvedSubmissions,
        pending: pendingSubmissions,
      },
      
      payouts: {
        pendingCents: pendingPayoutsCents,
        paidCents: paidOutCents,
        totalCents: totalSpentCents,
      },
      
      // Type-specific metrics
      ...(campaign.type === 'VIEW' && {
        views: {
          total: totalViews,
          averagePerSubmission: totalSubmissions > 0 ? Math.round(totalViews / totalSubmissions) : 0,
        },
      }),
      
      ...(campaign.type === 'CONVERSION' && {
        conversions: {
          count: conversionCount,
          revenueCents: totalRevenueCents,
          roi: totalSpentCents > 0 ? ((totalRevenueCents - totalSpentCents) / totalSpentCents * 100).toFixed(2) : '0.00',
        },
      }),
    }

    return NextResponse.json({ metrics })
  } catch (error) {
    console.error('[BOUNTIES_METRICS] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign metrics' },
      { status: 500 }
    )
  }
}
