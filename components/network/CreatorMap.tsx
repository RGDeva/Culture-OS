'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Profile } from '@/types/profile'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { getTierInfo } from '@/lib/xp-system'

interface CreatorMapProps {
  profiles: Profile[]
}

// Fix for default marker icon
const customIcon = new Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

export default function CreatorMap({ profiles }: CreatorMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filter profiles that have location coordinates
  const profilesWithLocation = profiles.filter(p => 
    p.locationLat && p.locationLng
  )

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

  if (profilesWithLocation.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center dark:bg-black bg-gray-100">
        <div className="dark:text-green-400/60 text-gray-600 font-mono text-center p-8">
          <p className="mb-2">No creators with location data yet</p>
          <p className="text-sm">Creators will appear here once they add their location</p>
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
      
      {profilesWithLocation.map((profile) => {
        const tierInfo = getTierInfo(profile.xp || 0)
        
        return (
          <Marker
            key={profile.userId}
            position={[profile.locationLat!, profile.locationLng!]}
            icon={customIcon}
          >
            <Popup>
              <div className="font-mono p-2 min-w-[200px]">
                <Link 
                  href={`/profile/${profile.userId}`}
                  className="block hover:opacity-80 transition-opacity"
                >
                  <div className="font-bold text-lg mb-2 text-gray-900">
                    {profile.displayName || 'Anonymous'}
                  </div>
                  
                  {profile.handle && (
                    <div className="text-sm text-gray-600 mb-2">
                      @{profile.handle}
                    </div>
                  )}
                  
                  <div 
                    className="inline-flex items-center gap-1 px-2 py-1 border text-xs font-bold mb-2"
                    style={{ 
                      borderColor: tierInfo.color,
                      color: tierInfo.color 
                    }}
                  >
                    <Star className="h-3 w-3" fill={tierInfo.color} />
                    {tierInfo.tier}
                  </div>
                  
                  {profile.roles && profile.roles.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs text-gray-600 mb-1">ROLES:</div>
                      <div className="flex flex-wrap gap-1">
                        {profile.roles.slice(0, 3).map(role => (
                          <span 
                            key={role}
                            className="text-xs px-2 py-0.5 border border-gray-400 text-gray-700"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {profile.locationCity && (
                    <div className="text-sm text-gray-600 mb-2">
                      📍 {profile.locationCity}
                      {profile.locationState && `, ${profile.locationState}`}
                    </div>
                  )}
                  
                  <div className="text-xs text-blue-600 hover:underline mt-2">
                    View Profile →
                  </div>
                </Link>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
