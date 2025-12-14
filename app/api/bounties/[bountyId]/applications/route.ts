import { NextRequest, NextResponse } from 'next/server'
import { BountyApplication, ApplicationStatus } from '@/types/bounty'

// In-memory storage (replace with database in production)
let applications: BountyApplication[] = []

/**
 * GET /api/bounties/[bountyId]/applications
 * Get all applications for a bounty
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { bountyId: string } }
) {
  try {
    const { bountyId } = params
    const bountyApplications = applications.filter(app => app.bountyId === bountyId)

    return NextResponse.json({
      applications: bountyApplications
    })
  } catch (error) {
    console.error('[BOUNTY_APPLICATIONS_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bounties/[bountyId]/applications
 * Submit an application to a bounty
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { bountyId: string } }
) {
  try {
    const { bountyId } = params
    const body = await request.json()

    // Validation
    if (!body.applicantId || !body.applicantName || !body.coverLetter) {
      return NextResponse.json(
        { error: 'Missing required fields: applicantId, applicantName, coverLetter' },
        { status: 400 }
      )
    }

    // Check if user already applied
    const existingApplication = applications.find(
      app => app.bountyId === bountyId && app.applicantId === body.applicantId
    )

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this bounty' },
        { status: 400 }
      )
    }

    // Create application
    const application: BountyApplication = {
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      bountyId,
      applicantId: body.applicantId,
      applicantName: body.applicantName,
      coverLetter: body.coverLetter,
      portfolioUrl: body.portfolioUrl,
      proposedBudget: body.proposedBudget,
      estimatedDeliveryDays: body.estimatedDeliveryDays,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    applications.push(application)

    return NextResponse.json({
      success: true,
      application
    }, { status: 201 })
  } catch (error) {
    console.error('[BOUNTY_APPLICATIONS_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    )
  }
}
