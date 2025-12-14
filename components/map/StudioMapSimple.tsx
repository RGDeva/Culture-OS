'use client'

import { useEffect, useState, useRef } from 'react'
import { Navigation, Music2, Building2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Studio {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  rating?: number
  types?: string[]
  photoUrl?: string
  placeId?: string
}

const CITIES = {
  massachusetts: { name: 'Massachusetts', lat: 42.3601, lng: -71.0589, zoom: 11 },
  newyork: { name: 'New York', lat: 40.7128, lng: -74.0060, zoom: 11 },
  miami: { name: 'Miami', lat: 25.7617, lng: -80.1918, zoom: 11 },
  losangeles: { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, zoom: 10 },
}

const API_KEY = 'AIzaSyAy6xjUsfb34ncystO3K6mqFa6oknUdtV0'

export default function StudioMapSimple() {
  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [filterType, setFilterType] = useState<'all' | 'recording' | 'rehearsal'>('all')
  const [selectedCity, setSelectedCity] = useState<keyof typeof CITIES>('massachusetts')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [sortByDistance, setSortByDistance] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const userMarkerRef = useRef<any>(null)
  const userLocationMarkerRef = useRef<any>(null)

  useEffect(() => {
    console.log('[STUDIO_MAP_SIMPLE] Starting initialization...')
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('[STUDIO_MAP_SIMPLE] Google Maps already loaded')
      initializeMap()
      return
    }

    // Load Google Maps script
    console.log('[STUDIO_MAP_SIMPLE] Loading Google Maps script...')
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('[STUDIO_MAP_SIMPLE] Google Maps script loaded successfully')
      initializeMap()
    }
    
    script.onerror = (e) => {
      console.error('[STUDIO_MAP_SIMPLE] Failed to load Google Maps script:', e)
      setError('Failed to load Google Maps. Please check your internet connection.')
      setLoading(false)
    }
    
    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  const initializeMap = () => {
    if (!mapRef.current) {
      console.error('[STUDIO_MAP_SIMPLE] Map container not found')
      setError('Map container not found')
      setLoading(false)
      return
    }

    try {
      const cityData = CITIES[selectedCity]
      console.log('[STUDIO_MAP_SIMPLE] Creating map instance for', cityData.name)
      
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: cityData.lat, lng: cityData.lng },
        zoom: cityData.zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          { featureType: 'all', elementType: 'geometry', stylers: [{ color: '#0a0a0a' }] },
          { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#00ff41' }] },
          { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#000000' }, { weight: 2 }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#00ff41' }, { weight: 0.5 }] },
          { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#001a0a' }] },
          { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#0d1f0d' }] },
        ],
      })

      googleMapRef.current = map
      console.log('[STUDIO_MAP_SIMPLE] Map created successfully')

      // Add city center marker
      userMarkerRef.current = new google.maps.Marker({
        position: { lat: cityData.lat, lng: cityData.lng },
        map: map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#00ffff',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: `Search Center (${cityData.name})`,
      })

      // Search for studios
      searchNearbyStudios(map, { lat: cityData.lat, lng: cityData.lng })
    } catch (err) {
      console.error('[STUDIO_MAP_SIMPLE] Error creating map:', err)
      setError('Failed to initialize map')
      setLoading(false)
    }
  }

  const searchNearbyStudios = (map: any, location: { lat: number; lng: number }) => {
    console.log('[STUDIO_MAP_SIMPLE] Searching for studios...')
    
    try {
      const service = new google.maps.places.PlacesService(map)
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 15000,
        keyword: 'recording studio music studio rehearsal space',
      }

      service.nearbySearch(request, (results: any, status: any) => {
        console.log('[STUDIO_MAP_SIMPLE] Search status:', status)
        console.log('[STUDIO_MAP_SIMPLE] Results:', results?.length || 0)

        if (status === google.maps.places.PlacesServiceStatus.OK && results) {
          const foundStudios: Studio[] = results.map((place: any, index: number) => ({
            id: place.place_id || `studio_${index}`,
            name: place.name || 'Unknown Studio',
            address: place.vicinity || '',
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0,
            rating: place.rating,
            types: place.types,
            photoUrl: place.photos?.[0]?.getUrl({ maxWidth: 400 }),
            placeId: place.place_id,
          }))

          console.log('[STUDIO_MAP_SIMPLE] Found studios:', foundStudios.length)
          setStudios(foundStudios)
          addMarkersToMap(map, foundStudios)
          setLoading(false)
        } else {
          console.error('[STUDIO_MAP_SIMPLE] Search failed:', status)
          setError(`Places search failed: ${status}`)
          setLoading(false)
        }
      })
    } catch (err) {
      console.error('[STUDIO_MAP_SIMPLE] Error searching:', err)
      setError('Failed to search for studios')
      setLoading(false)
    }
  }

  const addMarkersToMap = (map: any, studisList: Studio[]) => {
    console.log('[STUDIO_MAP_SIMPLE] Adding markers...')
    
    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    studisList.forEach((studio) => {
      const marker = new google.maps.Marker({
        position: { lat: studio.lat, lng: studio.lng },
        map: map,
        title: studio.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#00ff41',
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
      })

      marker.addListener('click', () => {
        setSelectedStudio(studio)
        map.setCenter({ lat: studio.lat, lng: studio.lng })
        map.setZoom(15)
      })

      markersRef.current.push(marker)
    })
  }

  const changeCity = (cityKey: keyof typeof CITIES) => {
    setSelectedCity(cityKey)
    setLoading(true)
    setStudios([])
    setSelectedStudio(null)
    
    const cityData = CITIES[cityKey]
    
    if (googleMapRef.current) {
      console.log('[STUDIO_MAP_SIMPLE] Changing to', cityData.name)
      googleMapRef.current.setCenter({ lat: cityData.lat, lng: cityData.lng })
      googleMapRef.current.setZoom(cityData.zoom)
      
      // Update city center marker
      if (userMarkerRef.current) {
        userMarkerRef.current.setPosition({ lat: cityData.lat, lng: cityData.lng })
        userMarkerRef.current.setTitle(`Search Center (${cityData.name})`)
      }
      
      // Search for studios in new city
      searchNearbyStudios(googleMapRef.current, { lat: cityData.lat, lng: cityData.lng })
    }
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log('[STUDIO_MAP_SIMPLE] Geolocation not supported')
      return
    }

    console.log('[STUDIO_MAP_SIMPLE] Requesting user location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        console.log('[STUDIO_MAP_SIMPLE] User location:', userPos)
        setUserLocation(userPos)
        setSortByDistance(true)

        // Add user location marker
        if (googleMapRef.current) {
          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setMap(null)
          }

          userLocationMarkerRef.current = new google.maps.Marker({
            position: userPos,
            map: googleMapRef.current,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: '#ff00ff',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 3,
            },
            title: 'Your Location',
            zIndex: 1000,
          })

          // Recenter map on user location
          googleMapRef.current.setCenter(userPos)
          googleMapRef.current.setZoom(12)

          // Search for studios near user
          searchNearbyStudios(googleMapRef.current, userPos)
        }
      },
      (error) => {
        console.error('[STUDIO_MAP_SIMPLE] Geolocation error:', error)
        alert('Unable to get your location. Please enable location services.')
      }
    )
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    // Haversine formula to calculate distance in miles
    const R = 3959 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const recenterMap = () => {
    const cityData = CITIES[selectedCity]
    if (googleMapRef.current) {
      googleMapRef.current.setCenter({ lat: cityData.lat, lng: cityData.lng })
      googleMapRef.current.setZoom(cityData.zoom)
    }
  }

  const filteredStudios = studios
    .filter((studio) => {
      if (filterType === 'all') return true
      if (filterType === 'recording') return studio.types?.some((t) => t.includes('recording'))
      if (filterType === 'rehearsal') return studio.types?.some((t) => t.includes('rehearsal'))
      return true
    })
    .map((studio) => {
      // Calculate distance if user location is available
      if (userLocation && sortByDistance) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          studio.lat,
          studio.lng
        )
        return { ...studio, distance }
      }
      return studio
    })
    .sort((a, b) => {
      // Sort by distance if available
      if (sortByDistance && 'distance' in a && 'distance' in b) {
        return (a as any).distance - (b as any).distance
      }
      return 0
    })

  return (
    <div className="relative w-full h-screen flex dark:bg-black bg-white">
      {/* Map Container */}
      <div className="flex-1 relative">
        {loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center dark:bg-black/90 bg-white/90 z-10">
            <div className="text-center">
              <div className="animate-spin h-12 w-12 border-4 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="font-mono dark:text-green-400 text-green-700">LOADING_STUDIOS...</p>
              <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mt-2">
                Check console for details (F12)
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center dark:bg-black/90 bg-white/90 z-10">
            <div className="text-center max-w-md p-6">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-red-500" />
              <p className="font-mono text-red-500 mb-4">{error}</p>
              <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60">
                Check browser console for more details
              </p>
            </div>
          </div>
        )}

        <div ref={mapRef} className="w-full h-full" />

        <button
          onClick={recenterMap}
          className="absolute bottom-24 right-4 p-3 dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white rounded-full shadow-lg hover:scale-110 transition-transform z-20"
          title={`Recenter on ${CITIES[selectedCity].name}`}
        >
          <Navigation className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div className="w-96 dark:bg-black bg-white border-l-2 dark:border-green-400 border-green-600 overflow-y-auto">
        <div className="p-4 border-b dark:border-green-400/30 border-green-600/30">
          <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">
            &gt; STUDIOS_NEARBY
          </h2>
          <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mb-4">
            {filteredStudios.length} studios found in {CITIES[selectedCity].name}
          </p>

          {/* City Filter Buttons */}
          <div className="mb-4">
            <p className="text-xs font-mono dark:text-green-400/80 text-green-700/80 mb-2">CITY:</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(CITIES) as Array<keyof typeof CITIES>).map((cityKey) => (
                <button
                  key={cityKey}
                  onClick={() => changeCity(cityKey)}
                  className={`px-3 py-2 text-xs font-mono border transition-colors ${
                    selectedCity === cityKey
                      ? 'dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white border-cyan-400'
                      : 'dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 hover:dark:bg-green-400/10 hover:bg-green-600/10'
                  }`}
                >
                  {CITIES[cityKey].name.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Precise Location Button */}
          <div className="mb-4">
            <button
              onClick={getUserLocation}
              className={`w-full px-4 py-3 text-sm font-mono border-2 transition-all ${
                sortByDistance
                  ? 'dark:bg-purple-500 bg-purple-600 dark:text-white text-white border-purple-500'
                  : 'dark:border-purple-500/50 border-purple-600/50 dark:text-purple-400 text-purple-700 hover:dark:bg-purple-500/10 hover:bg-purple-600/10'
              }`}
            >
              {sortByDistance ? '📍 SORTED BY YOUR LOCATION' : '📍 USE MY PRECISE LOCATION'}
            </button>
            {userLocation && sortByDistance && (
              <p className="text-xs font-mono dark:text-purple-400/80 text-purple-700/80 mt-2 text-center">
                Showing studios nearest to you
              </p>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div>
            <p className="text-xs font-mono dark:text-green-400/80 text-green-700/80 mb-2">TYPE:</p>
            <div className="flex gap-2">
              {['all', 'recording', 'rehearsal'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-3 py-1 text-xs font-mono border transition-colors ${
                    filterType === type
                      ? 'dark:bg-green-400 bg-green-600 dark:text-black text-white'
                      : 'dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700'
                  }`}
                >
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Studios List */}
        <div className="divide-y dark:divide-green-400/20 divide-green-600/20">
          {filteredStudios.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 dark:text-green-400/50 text-green-700/50" />
              <p className="font-mono dark:text-green-400/60 text-green-700/60">
                {loading ? 'Searching...' : error ? 'Error loading studios' : 'No studios found'}
              </p>
            </div>
          ) : (
            filteredStudios.map((studio) => (
              <button
                key={studio.id}
                onClick={() => {
                  setSelectedStudio(studio)
                  if (googleMapRef.current) {
                    googleMapRef.current.setCenter({ lat: studio.lat, lng: studio.lng })
                    googleMapRef.current.setZoom(15)
                  }
                }}
                className={`w-full text-left p-4 transition-colors ${
                  selectedStudio?.id === studio.id
                    ? 'dark:bg-green-400/10 bg-green-600/10'
                    : 'hover:dark:bg-green-400/5 hover:bg-green-600/5'
                }`}
              >
                {studio.photoUrl && (
                  <img
                    src={studio.photoUrl}
                    alt={studio.name}
                    className="w-full h-32 object-cover mb-3 border dark:border-green-400/30 border-green-600/30"
                  />
                )}
                <div className="flex items-start gap-2 mb-2">
                  <Music2 className="h-4 w-4 dark:text-green-400 text-green-700 flex-shrink-0 mt-1" />
                  <h3 className="font-mono font-bold dark:text-green-400 text-green-700">
                    {studio.name}
                  </h3>
                </div>
                <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mb-2">
                  {studio.address}
                </p>
                <div className="flex items-center gap-3 mb-3">
                  {studio.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-mono dark:text-yellow-400 text-yellow-600">
                        {studio.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {'distance' in studio && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono dark:text-purple-400 text-purple-600 font-bold">
                        {((studio as any).distance).toFixed(1)} mi
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(
                      `https://www.google.com/maps/place/?q=place_id:${studio.placeId}`,
                      '_blank'
                    )
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 font-mono text-xs"
                >
                  VIEW_ON_GOOGLE_MAPS
                </Button>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
