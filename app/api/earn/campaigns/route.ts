import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SAMPLE_CAMPAIGNS } from '@/lib/sampleCampaigns'

// GET /api/earn/campaigns - List campaigns with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const campaignType = searchParams.get('campaignType')
    const status = searchParams.get('status')
    const payoutType = searchParams.get('payoutType')
    const featured = searchParams.get('featured')
    const remoteOk = searchParams.get('remoteOk')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Build where clause
    const where: any = {}
    
    if (campaignType) {
      where.campaignType = campaignType
    }
    if (status) {
      where.status = status
    }
    if (payoutType) {
      where.payoutType = payoutType
    }
    if (featured === 'true') {
      where.featured = true
    }
    if (remoteOk === 'true') {
      where.remoteOk = true
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { creatorName: { contains: search } },
      ]
    }

    // Try to get campaigns from database
    let campaigns: any[] = []
    let total = 0
    let fromDatabase = false

    try {
      campaigns = await prisma.campaign.findMany({
        where,
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      })
      
      total = await prisma.campaign.count({ where })
      fromDatabase = true
    } catch (dbError) {
      console.warn('[CAMPAIGNS] Database query failed, using sample data:', dbError)
    }

    // If no campaigns in DB, return sample campaigns
    if (campaigns.length === 0 && !fromDatabase) {
      let filteredSamples = [...SAMPLE_CAMPAIGNS]
      
      if (campaignType) {
        filteredSamples = filteredSamples.filter(c => c.campaignType === campaignType)
      }
      if (status) {
        filteredSamples = filteredSamples.filter(c => c.status === status)
      }
      if (payoutType) {
        filteredSamples = filteredSamples.filter(c => c.payoutType === payoutType)
      }
      if (featured === 'true') {
        filteredSamples = filteredSamples.filter(c => c.featured)
      }
      if (remoteOk === 'true') {
        filteredSamples = filteredSamples.filter(c => c.remoteOk)
      }
      if (search) {
        const searchLower = search.toLowerCase()
        filteredSamples = filteredSamples.filter(c => 
          c.title.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower) ||
          c.creatorName?.toLowerCase().includes(searchLower)
        )
      }
      
      campaigns = filteredSamples.slice(offset, offset + limit)
      total = filteredSamples.length
    }

    // If DB returned empty but we have access, seed sample data
    if (campaigns.length === 0 && fromDatabase) {
      try {
        // Seed sample campaigns
        for (const sample of SAMPLE_CAMPAIGNS) {
          await prisma.campaign.upsert({
            where: { id: sample.id },
            update: {},
            create: {
              id: sample.id,
              creatorId: sample.creatorId,
              creatorName: sample.creatorName,
              title: sample.title,
              description: sample.description,
              campaignType: sample.campaignType,
              status: sample.status,
              budgetCents: sample.budgetCents,
              payoutType: sample.payoutType,
              payoutRuleJson: sample.payoutRuleJson,
              requirementsJson: sample.requirementsJson,
              startAt: sample.startAt,
              endAt: sample.endAt,
              featured: sample.featured,
              imageUrl: sample.imageUrl,
              remoteOk: sample.remoteOk,
              location: sample.location || null,
              linkedProductId: sample.linkedProductId || null,
              commissionPct: sample.commissionPct || null,
            },
          })
        }
        
        // Re-fetch after seeding
        campaigns = await prisma.campaign.findMany({
          where,
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' },
          ],
          take: limit,
          skip: offset,
        })
        total = await prisma.campaign.count({ where })
      } catch (seedError) {
        console.warn('[CAMPAIGNS] Seeding failed:', seedError)
        campaigns = SAMPLE_CAMPAIGNS.slice(offset, offset + limit)
        total = SAMPLE_CAMPAIGNS.length
      }
    }

    return NextResponse.json({
      campaigns,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error('[CAMPAIGNS] Error:', error)
    // Fallback to sample data on any error
    return NextResponse.json({
      campaigns: SAMPLE_CAMPAIGNS,
      total: SAMPLE_CAMPAIGNS.length,
      limit: 50,
      offset: 0,
    })
  }
}

// POST /api/earn/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      creatorId,
      creatorName,
      title,
      description,
      campaignType = 'CONTENT_REWARDS',
      status = 'OPEN',
      budgetCents = 0,
      payoutType = 'PER_VIEWS',
      payoutRuleJson = '{}',
      requirementsJson = '{}',
      startAt,
      endAt,
      featured = false,
      imageUrl,
      remoteOk = true,
      location,
      linkedProductId,
      commissionPct,
    } = body

    if (!creatorId || !title) {
      return NextResponse.json(
        { error: 'creatorId and title are required' },
        { status: 400 }
      )
    }

    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        creatorName,
        title,
        description,
        campaignType,
        status,
        budgetCents,
        payoutType,
        payoutRuleJson: typeof payoutRuleJson === 'string' ? payoutRuleJson : JSON.stringify(payoutRuleJson),
        requirementsJson: typeof requirementsJson === 'string' ? requirementsJson : JSON.stringify(requirementsJson),
        startAt: startAt ? new Date(startAt) : null,
        endAt: endAt ? new Date(endAt) : null,
        featured,
        imageUrl,
        remoteOk,
        location,
        linkedProductId,
        commissionPct,
      },
    })

    return NextResponse.json({ campaign }, { status: 201 })
  } catch (error) {
    console.error('[CAMPAIGNS] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    )
  }
}
