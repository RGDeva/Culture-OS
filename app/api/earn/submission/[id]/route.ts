import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// PATCH /api/earn/submission/[id] - Update submission (approve/reject/update views)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    
    const {
      status,
      reportedViews,
      reportedLikes,
      reportedShares,
      notes,
    } = body

    // Get existing submission
    const existing = await prisma.campaignSubmission.findUnique({
      where: { id },
      include: { campaign: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status !== undefined) {
      updateData.status = status
    }
    if (reportedViews !== undefined) {
      updateData.reportedViews = reportedViews
    }
    if (reportedLikes !== undefined) {
      updateData.reportedLikes = reportedLikes
    }
    if (reportedShares !== undefined) {
      updateData.reportedShares = reportedShares
    }
    if (notes !== undefined) {
      updateData.notes = notes
    }

    // Update submission
    const submission = await prisma.campaignSubmission.update({
      where: { id },
      data: updateData,
    })

    // If approved and campaign has PER_VIEWS payout, calculate potential payout
    if (status === 'APPROVED' && existing.campaign.payoutType === 'PER_VIEWS') {
      try {
        const rules = JSON.parse(existing.campaign.payoutRuleJson || '{}')
        const perThousandViews = rules.perThousandViews || 0
        const views = reportedViews ?? existing.reportedViews
        const payoutCents = Math.floor((views / 1000) * perThousandViews)
        
        // Cap payout if max is defined
        const maxPayout = rules.maxPayoutPerSubmission || Infinity
        const finalPayout = Math.min(payoutCents, maxPayout)

        if (finalPayout > 0) {
          // Create payout ledger entry
          await prisma.campaignPayoutLedger.create({
            data: {
              campaignId: existing.campaignId,
              submissionId: id,
              userId: existing.userId,
              amountCents: finalPayout,
              status: 'PENDING',
              reason: `View milestone: ${views.toLocaleString()} views`,
            },
          })
        }
      } catch (payoutError) {
        console.warn('[SUBMISSION] Payout calculation failed:', payoutError)
      }
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('[SUBMISSION] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}

// GET /api/earn/submission/[id] - Get single submission
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const submission = await prisma.campaignSubmission.findUnique({
      where: { id },
      include: { campaign: true },
    })

    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ submission })
  } catch (error) {
    console.error('[SUBMISSION] Get error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}
