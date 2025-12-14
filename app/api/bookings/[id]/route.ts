import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/bookings/[id]
 * Get booking details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true,
            roles: true,
          },
        },
        provider: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true,
            rating: true,
            roles: true,
            servicesOffered: true,
            hourlyRate: true,
            dayRate: true,
          },
        },
        project: true,
        splits: true,
        reviews: true,
        chat: {
          include: {
            messages: {
              take: 50,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ booking })
  } catch (error: any) {
    console.error('[BOOKINGS] Get error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch booking',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/bookings/[id]
 * Update booking status or details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status, deliverables, completedAt } = body

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { client: true, provider: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update booking
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(deliverables && { deliverables }),
        ...(completedAt && { completedAt: new Date(completedAt) }),
        updatedAt: new Date(),
      },
      include: {
        client: true,
        provider: true,
      },
    })

    // Create notifications based on status change
    if (status && status !== booking.status) {
      const notificationData: any = {
        bookingId: booking.id,
        oldStatus: booking.status,
        newStatus: status,
      }

      // Notify client
      await prisma.notification.create({
        data: {
          userId: booking.clientId,
          type: 'booking_status_change',
          title: `Booking ${status}`,
          message: `Your booking with ${booking.provider.displayName} is now ${status}`,
          data: notificationData,
        },
      })

      // Notify provider
      await prisma.notification.create({
        data: {
          userId: booking.providerId,
          type: 'booking_status_change',
          title: `Booking ${status}`,
          message: `Booking with ${booking.client.displayName} is now ${status}`,
          data: notificationData,
        },
      })
    }

    return NextResponse.json({
      success: true,
      booking: updated,
      message: 'Booking updated successfully',
    })
  } catch (error: any) {
    console.error('[BOOKINGS] Update error:', error)
    return NextResponse.json(
      {
        error: 'Failed to update booking',
        message: error.message,
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/bookings/[id]
 * Cancel/delete booking
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { client: true, provider: true },
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Update status to cancelled instead of deleting
    await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    })

    // Notify both parties
    await prisma.notification.createMany({
      data: [
        {
          userId: booking.clientId,
          type: 'booking_cancelled',
          title: 'Booking Cancelled',
          message: `Your booking with ${booking.provider.displayName} has been cancelled`,
          data: { bookingId: booking.id },
        },
        {
          userId: booking.providerId,
          type: 'booking_cancelled',
          title: 'Booking Cancelled',
          message: `Booking with ${booking.client.displayName} has been cancelled`,
          data: { bookingId: booking.id },
        },
      ],
    })

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
    })
  } catch (error: any) {
    console.error('[BOOKINGS] Delete error:', error)
    return NextResponse.json(
      {
        error: 'Failed to cancel booking',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
