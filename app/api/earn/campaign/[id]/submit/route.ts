import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/earn/campaign/[id]/submit - Create a submission
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: campaignId } = params
    const body = await request.json()
    
    const {
      userId,
      submissionUrl,
      originalMediaUrl,
      platform = 'TIKTOK',
      reportedViews = 0,
      notes,
    } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    if (!submissionUrl) {
      return NextResponse.json(
        { error: 'submissionUrl is required' },
        { status: 400 }
      )
    }

    // Verify campaign exists and is open
    let campaign: any = null
    try {
      campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      })
    } catch (dbError) {
      console.warn('[SUBMIT] Database query failed:', dbError)
    }

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    if (campaign.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Campaign is not accepting submissions' },
        { status: 400 }
      )
    }

    // Check if user already submitted this URL
    const existingSubmission = await prisma.campaignSubmission.findFirst({
      where: {
        campaignId,
        userId,
        submissionUrl,
      },
    })

    if (existingSubmission) {
      return NextResponse.json(
        { error: 'You have already submitted this URL' },
        { status: 400 }
      )
    }

    // Create submission
    const submission = await prisma.campaignSubmission.create({
      data: {
        campaignId,
        userId,
        submissionUrl,
        originalMediaUrl,
        platform,
        reportedViews,
        notes,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ submission }, { status: 201 })
  } catch (error) {
    console.error('[SUBMIT] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
