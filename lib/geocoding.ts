/**
 * Geocoding utilities for converting location names to coordinates
 */

interface GeocodingResult {
  lat: number
  lng: number
  city?: string
  state?: string
  country?: string
}

/**
 * Geocode a location using OpenStreetMap Nominatim API (free, no API key required)
 */
export async function geocodeLocation(
  city?: string,
  state?: string,
  country?: string
): Promise<GeocodingResult | null> {
  if (!city && !state && !country) {
    return null
  }

  try {
    // Build query string
    const parts = []
    if (city) parts.push(city)
    if (state) parts.push(state)
    if (country) parts.push(country)
    const query = parts.join(', ')

    // Use Nominatim API (OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NoCulture-OS/1.0' // Required by Nominatim
      }
    })

    if (!response.ok) {
      console.error('[GEOCODING] API error:', response.status)
      return null
    }

    const data = await response.json()

    if (data && data.length > 0) {
      const result = data[0]
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        city: city,
        state: state,
        country: country
      }
    }

    console.warn('[GEOCODING] No results found for:', query)
    return null
  } catch (error) {
    console.error('[GEOCODING] Error:', error)
    return null
  }
}

/**
 * Get approximate coordinates for major cities (fallback)
 */
export function getApproximateCoordinates(
  city?: string,
  country?: string
): GeocodingResult | null {
  const cityMap: Record<string, GeocodingResult> = {
    // US Cities
    'new york,us': { lat: 40.7128, lng: -74.0060, city: 'New York', country: 'US' },
    'los angeles,us': { lat: 34.0522, lng: -118.2437, city: 'Los Angeles', country: 'US' },
    'chicago,us': { lat: 41.8781, lng: -87.6298, city: 'Chicago', country: 'US' },
    'atlanta,us': { lat: 33.7490, lng: -84.3880, city: 'Atlanta', country: 'US' },
    'miami,us': { lat: 25.7617, lng: -80.1918, city: 'Miami', country: 'US' },
    'houston,us': { lat: 29.7604, lng: -95.3698, city: 'Houston', country: 'US' },
    'nashville,us': { lat: 36.1627, lng: -86.7816, city: 'Nashville', country: 'US' },
    
    // International
    'london,uk': { lat: 51.5074, lng: -0.1278, city: 'London', country: 'UK' },
    'toronto,ca': { lat: 43.6532, lng: -79.3832, city: 'Toronto', country: 'CA' },
    'paris,fr': { lat: 48.8566, lng: 2.3522, city: 'Paris', country: 'FR' },
    'berlin,de': { lat: 52.5200, lng: 13.4050, city: 'Berlin', country: 'DE' },
    'tokyo,jp': { lat: 35.6762, lng: 139.6503, city: 'Tokyo', country: 'JP' },
  }

  if (!city || !country) return null

  const key = `${city.toLowerCase()},${country.toLowerCase()}`
  return cityMap[key] || null
}
