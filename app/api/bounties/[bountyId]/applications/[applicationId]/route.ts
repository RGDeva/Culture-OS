import { NextRequest, NextResponse } from 'next/server'
import { ApplicationStatus } from '@/types/bounty'

// This would be shared with the applications route in production
let applications: any[] = []

/**
 * PATCH /api/bounties/[bountyId]/applications/[applicationId]
 * Update application status (accept/reject)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { bountyId: string; applicationId: string } }
) {
  try {
    const { bountyId, applicationId } = params
    const body = await request.json()

    const application = applications.find(app => app.id === applicationId)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update status
    if (body.status) {
      application.status = body.status
      application.updatedAt = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      application
    })
  } catch (error) {
    console.error('[APPLICATION_UPDATE_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bounties/[bountyId]/applications/[applicationId]
 * Withdraw application
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { bountyId: string; applicationId: string } }
) {
  try {
    const { applicationId } = params

    const index = applications.findIndex(app => app.id === applicationId)

    if (index === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    applications.splice(index, 1)

    return NextResponse.json({
      success: true,
      message: 'Application withdrawn'
    })
  } catch (error) {
    console.error('[APPLICATION_DELETE_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to withdraw application' },
      { status: 500 }
    )
  }
}
