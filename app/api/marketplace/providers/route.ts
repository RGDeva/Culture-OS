import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/marketplace/providers
 * Search and discover service providers
 * 
 * Query params:
 * - service: Service type filter
 * - location: Location search
 * - radius: Search radius in miles (default: 25)
 * - minRating: Minimum rating filter
 * - maxRate: Maximum hourly rate
 * - availability: Filter by availability
 * - roles: Filter by user roles
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const service = searchParams.get('service')
    const location = searchParams.get('location')
    const radius = parseInt(searchParams.get('radius') || '25')
    const minRating = parseFloat(searchParams.get('minRating') || '0')
    const maxRate = parseFloat(searchParams.get('maxRate') || '999999')
    const roles = searchParams.get('roles')?.split(',')
    const sortBy = searchParams.get('sortBy') || 'rating' // rating, rate, distance

    // Build query
    const where: any = {
      // Only show users with services offered
      servicesOffered: {
        isEmpty: false,
      },
    }

    // Filter by service type
    if (service) {
      where.servicesOffered = {
        has: service,
      }
    }

    // Filter by roles
    if (roles && roles.length > 0) {
      where.roles = {
        hasSome: roles,
      }
    }

    // Filter by rating
    if (minRating > 0) {
      where.rating = {
        gte: minRating,
      }
    }

    // Filter by rate
    if (maxRate < 999999) {
      where.OR = [
        { hourlyRate: { lte: maxRate } },
        { dayRate: { lte: maxRate * 8 } }, // Assume 8-hour day
      ]
    }

    // Fetch providers
    const providers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        handle: true,
        avatar: true,
        bio: true,
        roles: true,
        location: true,
        latitude: true,
        longitude: true,
        hourlyRate: true,
        dayRate: true,
        servicesOffered: true,
        rating: true,
        reviewCount: true,
        verified: true,
        portfolioAssets: true,
        connectedPlatforms: true,
        availabilityCalendar: true,
        _count: {
          select: {
            bookingsAsProvider: true,
            receivedReviews: true,
          },
        },
      },
      take: 100, // Limit results
    })

    // Calculate distance if location provided
    let providersWithDistance = providers
    if (location) {
      // TODO: Implement geocoding and distance calculation
      // For now, just return all providers
      providersWithDistance = providers.map(p => ({
        ...p,
        distance: null,
      }))
    }

    // Sort providers
    const sorted = providersWithDistance.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'rate':
          return (a.hourlyRate || 999999) - (b.hourlyRate || 999999)
        case 'distance':
          // TODO: Implement distance sorting
          return 0
        default:
          return (b.rating || 0) - (a.rating || 0)
      }
    })

    // Calculate aggregations
    const stats = {
      total: sorted.length,
      avgRating: sorted.reduce((sum, p) => sum + (p.rating || 0), 0) / sorted.length,
      avgHourlyRate: sorted.reduce((sum, p) => sum + (p.hourlyRate || 0), 0) / sorted.length,
      servicesAvailable: Array.from(
        new Set(sorted.flatMap(p => p.servicesOffered))
      ),
      rolesAvailable: Array.from(
        new Set(sorted.flatMap(p => p.roles))
      ),
    }

    return NextResponse.json({
      providers: sorted,
      stats,
    })
  } catch (error: any) {
    console.error('[MARKETPLACE] Providers search error:', error)
    return NextResponse.json(
      {
        error: 'Failed to search providers',
        message: error.message,
      },
      { status: 500 }
    )
  }
}
