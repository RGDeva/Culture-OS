import { NextRequest, NextResponse } from 'next/server'
import { Bounty, BountyRole } from '@/types/bounty'
import { calculateDistance, Coordinates } from '@/lib/location-utils'

/**
 * GET /api/bounties/recommendations
 * Get personalized bounty recommendations based on location and role
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get user preferences
    const userLat = searchParams.get('lat')
    const userLng = searchParams.get('lng')
    const userRole = searchParams.get('role') as BountyRole | null
    const maxDistance = searchParams.get('maxDistance') // in km
    const remoteOnly = searchParams.get('remoteOnly') === 'true'

    // Fetch all open bounties (in production, this would be from database)
    const response = await fetch(`${request.nextUrl.origin}/api/bounties?status=OPEN`)
    const data = await response.json()
    let bounties: Bounty[] = data.bounties || []

    // Filter by remote if requested
    if (remoteOnly) {
      bounties = bounties.filter(b => b.remoteOk)
    }

    // Filter by role if specified
    if (userRole) {
      bounties = bounties.filter(b => b.role === userRole)
    }

    // Calculate distances and filter by location if coordinates provided
    if (userLat && userLng) {
      const userLocation: Coordinates = {
        lat: parseFloat(userLat),
        lng: parseFloat(userLng)
      }

      bounties = bounties.map(bounty => {
        if (bounty.coordinates) {
          const distance = calculateDistance(userLocation, bounty.coordinates)
          return { ...bounty, distance }
        }
        // If bounty is remote OK, include it with no distance
        if (bounty.remoteOk) {
          return { ...bounty, distance: undefined }
        }
        return bounty
      })

      // Filter by max distance if specified
      if (maxDistance) {
        const maxDistanceKm = parseFloat(maxDistance)
        bounties = bounties.filter(b => {
          if (b.remoteOk) return true // Always include remote bounties
          if (!b.distance) return false // Exclude bounties without location
          return b.distance <= maxDistanceKm
        })
      }

      // Sort by distance (remote bounties at the end)
      bounties.sort((a, b) => {
        if (a.distance === undefined && b.distance === undefined) return 0
        if (a.distance === undefined) return 1
        if (b.distance === undefined) return -1
        return a.distance - b.distance
      })
    }

    // Calculate recommendation score
    const recommendations = bounties.map(bounty => {
      let score = 100

      // Role match bonus
      if (userRole && bounty.role === userRole) {
        score += 50
      }

      // Distance penalty (closer is better)
      if (bounty.distance !== undefined) {
        if (bounty.distance < 5) score += 30
        else if (bounty.distance < 25) score += 20
        else if (bounty.distance < 100) score += 10
        else score -= Math.min(50, bounty.distance / 10)
      }

      // Remote OK bonus
      if (bounty.remoteOk) {
        score += 15
      }

      // Budget bonus (higher budget = higher score)
      if (bounty.budgetMinUSDC) {
        score += Math.min(30, bounty.budgetMinUSDC / 10)
      }

      // Recency bonus (newer bounties score higher)
      const daysOld = (Date.now() - new Date(bounty.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      if (daysOld < 1) score += 20
      else if (daysOld < 7) score += 10
      else if (daysOld > 30) score -= 10

      return {
        ...bounty,
        recommendationScore: Math.max(0, score)
      }
    })

    // Sort by recommendation score
    recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore)

    return NextResponse.json({
      recommendations: recommendations.slice(0, 20), // Top 20 recommendations
      total: recommendations.length,
      filters: {
        role: userRole,
        maxDistance: maxDistance ? parseFloat(maxDistance) : null,
        remoteOnly,
        hasLocation: !!(userLat && userLng)
      }
    })
  } catch (error) {
    console.error('[BOUNTY_RECOMMENDATIONS_API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    )
  }
}
