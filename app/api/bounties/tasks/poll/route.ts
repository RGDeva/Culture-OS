import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

/**
 * POST /api/bounties/tasks/poll
 * Cron-friendly endpoint to update submission metrics
 * This is a placeholder for future integration with TikTok/IG/YouTube APIs
 */
export async function POST(request: NextRequest) {
  try {
    // Get all pending submissions that need metric updates
    const submissions = await prisma.bountySubmission.findMany({
      where: {
        status: {
          in: ['PENDING', 'APPROVED'],
        },
      },
      include: {
        participant: {
          include: {
            campaign: true,
          },
        },
      },
      take: 100, // Process in batches
    })

    const updates = []
    const earningsToCreate = []

    for (const submission of submissions) {
      // PLACEHOLDER: In production, this would call platform APIs
      // For now, we'll just update lastCheckedAt
      
      try {
        const currentMetrics = JSON.parse(submission.metricsJson)
        
        // TODO: Fetch real metrics from platform APIs
        // const newMetrics = await fetchPlatformMetrics(submission.postUrl, submission.platform)
        
        // For now, just update the timestamp
        await prisma.bountySubmission.update({
          where: { id: submission.id },
          data: {
            lastCheckedAt: new Date(),
            // metricsJson: JSON.stringify(newMetrics),
          },
        })

        // Check if VIEW milestones were reached
        if (submission.participant.campaign.type === 'VIEW') {
          const rules = JSON.parse(submission.participant.campaign.rulesJson)
          const tiers = rules.tiers || []
          
          // Check each tier to see if views threshold was reached
          for (const tier of tiers) {
            if (currentMetrics.views >= tier.views) {
              // Check if earning already exists for this tier
              const existingEarning = await prisma.bountyEarning.findFirst({
                where: {
                  participantId: submission.participant.id,
                  reasonDataJson: {
                    contains: `"submissionId":"${submission.id}"`,
                  },
                  reasonDataJson: {
                    contains: `"tier":${tier.views}`,
                  },
                },
              })

              if (!existingEarning) {
                // Create earning for this milestone
                earningsToCreate.push({
                  participantId: submission.participant.id,
                  amountCents: tier.payoutCents,
                  reason: 'VIEW_MILESTONE',
                  reasonDataJson: JSON.stringify({
                    submissionId: submission.id,
                    tier: tier.views,
                    actualViews: currentMetrics.views,
                  }),
                  status: 'PENDING',
                })
              }
            }
          }
        }

        updates.push({
          submissionId: submission.id,
          status: 'updated',
        })
      } catch (error) {
        console.error(`[POLL] Error processing submission ${submission.id}:`, error)
        updates.push({
          submissionId: submission.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      }
    }

    // Create all earnings in batch
    if (earningsToCreate.length > 0) {
      await prisma.bountyEarning.createMany({
        data: earningsToCreate,
      })
    }

    return NextResponse.json({
      processed: submissions.length,
      updates,
      earningsCreated: earningsToCreate.length,
      message: 'Metrics polling completed',
    })
  } catch (error) {
    console.error('[BOUNTIES_POLL] Error:', error)
    return NextResponse.json(
      { error: 'Failed to poll metrics' },
      { status: 500 }
    )
  }
}
