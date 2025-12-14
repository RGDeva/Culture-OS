/**
 * Location utilities for bounty recommendations
 */

export interface Coordinates {
  lat: number
  lng: number
}

export interface LocationData {
  city?: string
  country?: string
  coordinates?: Coordinates
}

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(coord2.lat - coord1.lat)
  const dLng = toRad(coord2.lng - coord1.lng)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get user's current location using browser geolocation API
 */
export async function getCurrentLocation(): Promise<Coordinates | null> {
  if (!navigator.geolocation) {
    console.warn('[LOCATION] Geolocation not supported')
    return null
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.error('[LOCATION] Error getting location:', error)
        resolve(null)
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000 // 5 minutes
      }
    )
  })
}

/**
 * Geocode a city/country to coordinates using a geocoding service
 * This is a mock implementation - replace with actual geocoding API
 */
export async function geocodeLocation(
  city?: string,
  country?: string
): Promise<Coordinates | null> {
  if (!city && !country) return null

  // Mock coordinates for common cities (replace with actual API)
  const cityCoordinates: Record<string, Coordinates> = {
    'new york,usa': { lat: 40.7128, lng: -74.0060 },
    'los angeles,usa': { lat: 34.0522, lng: -118.2437 },
    'chicago,usa': { lat: 41.8781, lng: -87.6298 },
    'miami,usa': { lat: 25.7617, lng: -80.1918 },
    'atlanta,usa': { lat: 33.7490, lng: -84.3880 },
    'london,uk': { lat: 51.5074, lng: -0.1278 },
    'paris,france': { lat: 48.8566, lng: 2.3522 },
    'berlin,germany': { lat: 52.5200, lng: 13.4050 },
    'tokyo,japan': { lat: 35.6762, lng: 139.6503 },
    'toronto,canada': { lat: 43.6532, lng: -79.3832 },
    'sydney,australia': { lat: -33.8688, lng: 151.2093 }
  }

  const key = `${city?.toLowerCase()},${country?.toLowerCase()}`
  return cityCoordinates[key] || null
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m away`
  } else if (km < 10) {
    return `${km.toFixed(1)}km away`
  } else if (km < 100) {
    return `${Math.round(km)}km away`
  } else {
    return `${Math.round(km)}km away`
  }
}

/**
 * Get distance category for filtering
 */
export function getDistanceCategory(km: number): string {
  if (km < 5) return 'VERY_CLOSE'
  if (km < 25) return 'NEARBY'
  if (km < 100) return 'LOCAL'
  if (km < 500) return 'REGIONAL'
  return 'DISTANT'
}

/**
 * Sort items by distance from a location
 */
export function sortByDistance<T extends { coordinates?: Coordinates }>(
  items: T[],
  userLocation: Coordinates
): (T & { distance?: number })[] {
  return items
    .map(item => {
      if (!item.coordinates) {
        return { ...item, distance: undefined }
      }
      const distance = calculateDistance(userLocation, item.coordinates)
      return { ...item, distance }
    })
    .sort((a, b) => {
      // Items without coordinates go to the end
      if (a.distance === undefined) return 1
      if (b.distance === undefined) return -1
      return a.distance - b.distance
    })
}

/**
 * Filter items by maximum distance
 */
export function filterByDistance<T extends { coordinates?: Coordinates }>(
  items: T[],
  userLocation: Coordinates,
  maxDistanceKm: number
): T[] {
  return items.filter(item => {
    if (!item.coordinates) return true // Include items without location
    const distance = calculateDistance(userLocation, item.coordinates)
    return distance <= maxDistanceKm
  })
}
