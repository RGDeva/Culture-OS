import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/bookings/create
 * Create a new booking for a service
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      providerId,
      projectId,
      serviceType,
      title,
      description,
      location,
      latitude,
      longitude,
      isRemote,
      scheduledTime,
      durationHours,
      rate,
      currency = 'USD',
    } = body

    // Validation
    if (!clientId || !providerId || !serviceType || !scheduledTime || !durationHours || !rate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if provider exists and has the service
    const provider = await prisma.user.findUnique({
      where: { id: providerId },
    })

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider not found' },
        { status: 404 }
      )
    }

    // Calculate total price
    const totalPrice = rate * durationHours

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        clientId,
        providerId,
        projectId,
        serviceType,
        title: title || `${serviceType} Service`,
        description,
        location,
        latitude,
        longitude,
        isRemote: isRemote || false,
        scheduledTime: new Date(scheduledTime),
        durationHours,
        rate,
        totalPrice,
        currency,
        status: 'PENDING',
      },
      include: {
        client: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true,
          },
        },
        provider: {
          select: {
            id: true,
            displayName: true,
            email: true,
            avatar: true,
            rating: true,
          },
        },
      },
    })

    // Create notification for provider
    await prisma.notification.create({
      data: {
        userId: providerId,
        type: 'booking_request',
        title: 'New Booking Request',
        message: `${provider.displayName} requested ${serviceType} service`,
        data: {
          bookingId: booking.id,
          clientId,
          serviceType,
          scheduledTime,
        },
      },
    })

    // TODO: Send email notification to provider

    return NextResponse.json({
      success: true,
      booking,
      message: 'Booking created successfully',
    })
  } catch (error: any) {
    console.error('[BOOKINGS] Create error:', error)
    return NextResponse.json(
      {
        error: 'Failed to create booking',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
