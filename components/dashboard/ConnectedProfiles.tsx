'use client'

import { useEffect, useState } from 'react'
import { Music, Music2, Cloud, Instagram } from 'lucide-react'
import Link from 'next/link'

interface ConnectedProfilesProps {
  userId: string
}

interface Platforms {
  spotify: boolean
  appleMusic: boolean
  soundcloud: boolean
  mainSocial: boolean
}

export function ConnectedProfiles({ userId }: ConnectedProfilesProps) {
  const [platforms, setPlatforms] = useState<Platforms | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        const res = await fetch(`/api/dashboard/metrics?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setPlatforms(data.platforms)
        }
      } catch (error) {
        console.error('Failed to fetch platforms:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlatforms()
  }, [userId])

  if (loading) {
    return (
      <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6 animate-pulse">
        <div className="h-6 bg-green-400/20 w-1/2 mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-green-400/10 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!platforms) return null

  const platformList = [
    {
      name: 'Spotify',
      icon: Music,
      connected: platforms.spotify,
      focus: 'spotify'
    },
    {
      name: 'Apple Music',
      icon: Music2,
      connected: platforms.appleMusic,
      focus: 'appleMusic'
    },
    {
      name: 'SoundCloud',
      icon: Cloud,
      connected: platforms.soundcloud,
      focus: 'soundcloud'
    },
    {
      name: 'Main Social',
      icon: Instagram,
      connected: platforms.mainSocial,
      focus: 'social'
    }
  ]

  return (
    <div className="bg-black/50 border-2 border-green-400/30 rounded-lg p-6">
      <h2 className="text-xl font-bold font-mono text-green-400 mb-6">CONNECTED_PROFILES</h2>

      <div className="space-y-3">
        {platformList.map((platform) => (
          <Link
            key={platform.name}
            href={`/profile?focus=${platform.focus}`}
            className="block"
          >
            <div className="flex items-center justify-between p-3 bg-black/30 border border-green-400/20 rounded-lg hover:bg-green-400/5 transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <platform.icon className="h-5 w-5 text-green-400" />
                <span className="text-sm font-mono text-green-400">{platform.name}</span>
              </div>
              <div>
                {platform.connected ? (
                  <span className="px-3 py-1 text-xs font-mono bg-green-400/20 text-green-400 border border-green-400/50 rounded">
                    CONNECTED
                  </span>
                ) : (
                  <span className="px-3 py-1 text-xs font-mono bg-yellow-400/20 text-yellow-400 border border-yellow-400/50 rounded">
                    ADD_LINK
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 text-xs text-green-400/60 font-mono text-center">
        Click any platform to connect or update
      </div>
    </div>
  )
}
