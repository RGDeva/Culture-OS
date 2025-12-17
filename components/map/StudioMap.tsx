'use client'

import { useEffect, useState, useRef } from 'react'
import { Navigation, Music2, Building2, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Script from 'next/script'

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

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'gmpx-api-loader': any
      'gmp-map': any
      'gmp-advanced-marker': any
      'gmpx-place-picker': any
    }
  }
  interface Window {
    google: typeof google
  }
}

// Google Maps type definitions
declare const google: {
  maps: {
    LatLng: new (lat: number, lng: number) => any
    Marker: new (options: any) => any
    SymbolPath: {
      CIRCLE: number
    }
    places: {
      PlacesService: new (map: any) => {
        nearbySearch: (
          request: any,
          callback: (results: any[] | null, status: any) => void
        ) => void
      }
      PlacesServiceStatus: {
        OK: string
      }
    }
  }
}

const MASSACHUSETTS_CENTER = { lat: 42.3601, lng: -71.0589 }

export default function StudioMap() {
  const [studios, setStudios] = useState<Studio[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStudio, setSelectedStudio] = useState<Studio | null>(null)
  const [userLocation, setUserLocation] = useState(MASSACHUSETTS_CENTER)
  const [filterType, setFilterType] = useState<'all' | 'recording' | 'rehearsal'>('all')
  const [scriptsLoaded, setScriptsLoaded] = useState(false)
  const mapRef = useRef<any>(null)
  const placePickerRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!scriptsLoaded) return

    const init = async () => {
      try {
        await customElements.whenDefined('gmp-map')
        await customElements.whenDefined('gmpx-place-picker')

        const map = mapRef.current
        const placePicker = placePickerRef.current

        if (!map || !placePicker) return

        if (map.innerMap) {
          map.innerMap.setOptions({
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
        }

        searchNearbyStudios(MASSACHUSETTS_CENTER)

        placePicker.addEventListener('gmpx-placechange', () => {
          const place = placePicker.value
          if (!place || !place.location) return

          if (place.viewport) {
            map.innerMap?.fitBounds(place.viewport)
          } else {
            map.center = `${place.location.lat()},${place.location.lng()}`
            map.zoom = 15
          }

          searchNearbyStudios({ lat: place.location.lat(), lng: place.location.lng() })
        })

        setLoading(false)
      } catch (error) {
        console.error('Error initializing map:', error)
        setLoading(false)
      }
    }

    init()
  }, [scriptsLoaded])

  const searchNearbyStudios = async (location: { lat: number; lng: number }) => {
    try {
      const map = mapRef.current
      if (!map || !map.innerMap) return

      const service = new google.maps.places.PlacesService(map.innerMap)
      const request = {
        location: new google.maps.LatLng(location.lat, location.lng),
        radius: 15000,
        keyword: 'recording studio music studio rehearsal space',
      }

      service.nearbySearch(request, (results: any[] | null, status: any) => {
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

          setStudios(foundStudios)
          addMarkersToMap(foundStudios)
        }
      })
    } catch (error) {
      console.error('Error searching studios:', error)
    }
  }

  const addMarkersToMap = (studisList: Studio[]) => {
    const map = mapRef.current
    if (!map || !map.innerMap) return

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    studisList.forEach((studio) => {
      const marker = new google.maps.Marker({
        position: { lat: studio.lat, lng: studio.lng },
        map: map.innerMap,
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
        map.center = `${studio.lat},${studio.lng}`
        map.zoom = 15
      })

      markersRef.current.push(marker)
    })
  }

  const recenterMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.center = `${userLocation.lat},${userLocation.lng}`
      mapRef.current.zoom = 12
      searchNearbyStudios(userLocation)
    }
  }

  const filteredStudios = studios.filter((studio) => {
    if (filterType === 'all') return true
    if (filterType === 'recording') return studio.types?.some((t) => t.includes('recording'))
    if (filterType === 'rehearsal') return studio.types?.some((t) => t.includes('rehearsal'))
    return true
  })

  return (
    <>
      <Script
        src="https://ajax.googleapis.com/ajax/libs/@googlemaps/extended-component-library/0.6.11/index.min.js"
        type="module"
        onLoad={() => setScriptsLoaded(true)}
      />

      <div className="relative w-full h-screen flex dark:bg-black bg-white">
        <div className="flex-1 relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center dark:bg-black/90 bg-white/90 z-10">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="font-mono dark:text-green-400 text-green-700">LOADING_STUDIOS...</p>
              </div>
            </div>
          )}

          <gmpx-api-loader key="AIzaSyAy6xjUsfb34ncystO3K6mqFa6oknUdtV0" solution-channel="GMP_GE_mapsandplacesautocomplete_v2" />

          <gmp-map ref={mapRef} center="42.3601,-71.0589" zoom="11" map-id="NOCULTURE_MAP" style={{ width: '100%', height: '100%' }}>
            <div slot="control-block-start-inline-start" style={{ padding: '16px' }}>
              <gmpx-place-picker ref={placePickerRef} placeholder="Search for studios..." style={{ width: '400px', fontFamily: 'monospace', fontSize: '14px', border: '2px solid #00ff41', backgroundColor: '#000', color: '#00ff41', padding: '8px' }} />
            </div>
            <gmp-advanced-marker />
          </gmp-map>

          <button onClick={recenterMap} className="absolute bottom-24 right-4 p-3 dark:bg-cyan-400 bg-cyan-600 dark:text-black text-white rounded-full shadow-lg hover:scale-110 transition-transform z-20">
            <Navigation className="h-5 w-5" />
          </button>
        </div>

        <div className="w-96 dark:bg-black bg-white border-l-2 dark:border-green-400 border-green-600 overflow-y-auto">
          <div className="p-4 border-b dark:border-green-400/30 border-green-600/30">
            <h2 className="text-xl font-bold font-mono dark:text-green-400 text-green-700 mb-2">&gt; STUDIOS_NEARBY</h2>
            <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mb-4">{filteredStudios.length} studios found</p>
            <div className="flex gap-2">
              {['all', 'recording', 'rehearsal'].map((type) => (
                <button key={type} onClick={() => setFilterType(type as any)} className={`px-3 py-1 text-xs font-mono border transition-colors ${filterType === type ? 'dark:bg-green-400 bg-green-600 dark:text-black text-white' : 'dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700'}`}>
                  {type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y dark:divide-green-400/20 divide-green-600/20">
            {filteredStudios.length === 0 ? (
              <div className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto mb-4 dark:text-green-400/50 text-green-700/50" />
                <p className="font-mono dark:text-green-400/60 text-green-700/60">
                  {loading ? 'Searching...' : 'No studios found'}
                </p>
              </div>
            ) : (
              filteredStudios.map((studio) => (
                <button key={studio.id} onClick={() => { setSelectedStudio(studio); if (mapRef.current) { mapRef.current.center = `${studio.lat},${studio.lng}`; mapRef.current.zoom = 15; } }} className={`w-full text-left p-4 transition-colors ${selectedStudio?.id === studio.id ? 'dark:bg-green-400/10 bg-green-600/10' : 'hover:dark:bg-green-400/5 hover:bg-green-600/5'}`}>
                  {studio.photoUrl && <img src={studio.photoUrl} alt={studio.name} className="w-full h-32 object-cover mb-3 border dark:border-green-400/30 border-green-600/30" />}
                  <div className="flex items-start gap-2 mb-2">
                    <Music2 className="h-4 w-4 dark:text-green-400 text-green-700 flex-shrink-0 mt-1" />
                    <h3 className="font-mono font-bold dark:text-green-400 text-green-700">{studio.name}</h3>
                  </div>
                  <p className="text-xs font-mono dark:text-green-400/60 text-green-700/60 mb-2">{studio.address}</p>
                  {studio.rating && (
                    <div className="flex items-center gap-1 mb-3">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-mono dark:text-yellow-400 text-yellow-600">{studio.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <Button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps/place/?q=place_id:${studio.placeId}`, '_blank'); }} variant="outline" size="sm" className="w-full dark:border-cyan-400/50 border-cyan-600/50 dark:text-cyan-400 text-cyan-700 font-mono text-xs">
                    VIEW_ON_GOOGLE_MAPS
                  </Button>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
