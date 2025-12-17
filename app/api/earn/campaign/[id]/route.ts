import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SAMPLE_CAMPAIGNS } from '@/lib/sampleCampaigns'

// GET /api/earn/campaign/[id] - Get single campaign with submissions
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    // Try to get from database
    let campaign: any = null
    let submissions: any[] = []
    
    try {
      campaign = await prisma.campaign.findUnique({
        where: { id },
        include: {
          submissions: {
            orderBy: { reportedViews: 'desc' },
            take: 50,
          },
        },
      })
      
      if (campaign) {
        submissions = campaign.submissions || []
      }
    } catch (dbError) {
      console.warn('[CAMPAIGN] Database query failed:', dbError)
    }

    // Fallback to sample data
    if (!campaign) {
      const sampleCampaign = SAMPLE_CAMPAIGNS.find(c => c.id === id)
      if (sampleCampaign) {
        campaign = {
          ...sampleCampaign,
          submissions: [],
        }
        submissions = []
      }
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields for easier frontend consumption
    let payoutRules = {}
    let requirements = {}
    
    try {
      payoutRules = typeof campaign.payoutRuleJson === 'string' 
        ? JSON.parse(campaign.payoutRuleJson) 
        : campaign.payoutRuleJson
    } catch (e) {
      payoutRules = {}
    }
    
    try {
      requirements = typeof campaign.requirementsJson === 'string'
        ? JSON.parse(campaign.requirementsJson)
        : campaign.requirementsJson
    } catch (e) {
      requirements = {}
    }

    // Build leaderboard from submissions
    const leaderboard = submissions
      .filter((s: any) => s.status === 'APPROVED' || s.status === 'PAID')
      .slice(0, 10)
      .map((s: any, index: number) => ({
        rank: index + 1,
        submissionId: s.id,
        userId: s.userId,
        platform: s.platform,
        views: s.reportedViews,
        url: s.submissionUrl,
      }))

    return NextResponse.json({
      campaign: {
        ...campaign,
        payoutRules,
        requirements,
      },
      submissions,
      leaderboard,
    })
  } catch (error) {
    console.error('[CAMPAIGN] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    )
  }
}
