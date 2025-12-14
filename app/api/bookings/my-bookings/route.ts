import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/bookings/my-bookings?userId=xxx&role=client|provider
 * Get all bookings for a user (as client or provider)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role') || 'client'
    const status = searchParams.get('status')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Build query
    const where: any = role === 'client' 
      ? { clientId: userId }
      : { providerId: userId }

    if (status) {
      where.status = status
    }

    // Fetch bookings
    const bookings = await prisma.booking.findMany({
      where,
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
            roles: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        reviews: true,
      },
      orderBy: {
        scheduledTime: 'desc',
      },
    })

    // Calculate stats
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'PENDING').length,
      confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
      completed: bookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
      totalRevenue: bookings
        .filter(b => b.status === 'COMPLETED')
        .reduce((sum, b) => sum + b.totalPrice, 0),
    }

    return NextResponse.json({
      bookings,
      stats,
    })
  } catch (error: any) {
    console.error('[BOOKINGS] Fetch error:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch bookings',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
