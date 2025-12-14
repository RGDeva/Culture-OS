'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { CreatorProfileOnMap } from '@/types/creator'
import Link from 'next/link'
import { MapPin, ExternalLink } from 'lucide-react'

interface CreatorMapProps {
  profiles: CreatorProfileOnMap[]
  selectedId: string | null
  onSelectProfile: (id: string) => void
}

// Custom marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

// Calculate XP tier
function calculateXpTier(xp: number = 0): string {
  if (xp >= 800) return 'POWER_USER'
  if (xp >= 200) return 'CORE'
  return 'ROOKIE'
}

export default function CreatorMap({ profiles, selectedId, onSelectProfile }: CreatorMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Default center (US)
  const defaultCenter: [number, number] = [39.8283, -98.5795]
  const defaultZoom = 4

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center dark:bg-black bg-gray-100">
        <div className="dark:text-green-400 text-gray-700 font-mono">Loading map...</div>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center dark:bg-black bg-gray-100">
        <div className="dark:text-green-400/60 text-gray-600 font-mono text-center p-8">
          <p className="mb-2">No creators to display</p>
          <p className="text-sm">Adjust filters to see more creators</p>
        </div>
      </div>
    )
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={defaultZoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {profiles.map((profile) => {
        const tier = calculateXpTier(profile.xp)
        const isSelected = selectedId === profile.id
        
        return (
          <Marker
            key={profile.id}
            position={[profile.latitude, profile.longitude]}
            icon={customIcon}
            eventHandlers={{
              click: () => onSelectProfile(profile.id),
              mouseover: () => onSelectProfile(profile.id),
            }}
          >
            <Popup>
              <div className="font-mono p-2 min-w-[220px]">
                <div className="font-bold text-lg mb-2 text-gray-900">
                  {profile.name}
                </div>
                
                {/* Roles */}
                <div className="mb-2">
                  <div className="text-xs text-gray-600 mb-1">ROLES:</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.roles.map(role => (
                      <span 
                        key={role}
                        className="text-xs px-2 py-0.5 border border-pink-500 text-pink-600"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-sm text-gray-600 mb-2">
                  <MapPin className="h-3 w-3" />
                  {profile.city}{profile.city && profile.state && ', '}{profile.state}
                </div>

                {/* Genre */}
                {profile.mainGenre && (
                  <div className="text-sm text-gray-600 mb-2">
                    🎵 {profile.mainGenre}
                  </div>
                )}

                {/* XP Tier */}
                {profile.xp && (
                  <div className="text-xs text-cyan-600 mb-3">
                    {tier} · {profile.xp} XP
                  </div>
                )}

                {/* CTAs */}
                <div className="space-y-2">
                  <Link
                    href={`/network?userId=${profile.id}`}
                    className="block w-full text-center px-3 py-2 bg-green-500 text-white text-xs font-bold hover:bg-green-600 transition-colors"
                  >
                    &gt; VIEW_PROFILE
                  </Link>
                  
                  <Link
                    href={`/marketplace?creatorId=${profile.id}`}
                    className="block w-full text-center px-3 py-2 border-2 border-green-500 text-green-600 text-xs font-bold hover:bg-green-50 transition-colors"
                  >
                    &gt; VIEW_SERVICES
                  </Link>

                  {profile.mainLink && (
                    <a
                      href={profile.mainLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 w-full text-center px-3 py-2 border border-gray-400 text-gray-600 text-xs hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      LINK
                    </a>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
