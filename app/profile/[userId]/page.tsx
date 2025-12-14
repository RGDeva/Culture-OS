'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, MapPin, Star, ExternalLink, Music, Instagram, Twitter, Youtube, Globe, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/types/profile'
import { getTierInfo } from '@/lib/xp-system'

export default function ProfileDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true)
        const res = await fetch(`/api/profile?userId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setProfile(data)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    async function fetchMarketplaceItems() {
      try {
        const res = await fetch(`/api/products?creatorId=${userId}`)
        if (res.ok) {
          const data = await res.json()
          setMarketplaceItems(data)
        }
      } catch (error) {
        console.error('Error fetching marketplace items:', error)
      }
    }

    if (userId) {
      fetchProfile()
      fetchMarketplaceItems()
    }
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen font-mono p-8">
        <div className="max-w-6xl mx-auto">
          <div className="dark:text-green-400 text-gray-900">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen font-mono p-8">
        <div className="max-w-6xl mx-auto">
          <div className="dark:text-green-400 text-gray-900">Profile not found</div>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  const tierInfo = getTierInfo(profile.xp || 0)

  return (
    <div className="min-h-screen font-mono p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Button 
            onClick={() => router.back()} 
            variant="outline"
            className="dark:border-green-400 dark:text-green-400 border-gray-400 text-gray-700 font-mono"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> BACK
          </Button>
        </div>

        {/* Profile Header */}
        <div className="border-2 dark:border-green-400/30 border-gray-300 p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 dark:text-green-400 text-gray-900">
                {profile.displayName || 'Anonymous'}
              </h1>
              {profile.handle && (
                <div className="dark:text-green-400/60 text-gray-600 mb-4">@{profile.handle}</div>
              )}
              
              {/* XP Tier Badge */}
              <div 
                className="inline-flex items-center gap-2 px-4 py-2 border-2 font-bold text-sm mb-4"
                style={{ 
                  borderColor: tierInfo.color,
                  color: tierInfo.color 
                }}
              >
                <Star className="h-4 w-4" fill={tierInfo.color} />
                {tierInfo.tier} • {profile.xp || 0} XP
              </div>
            </div>
          </div>

          {/* Roles */}
          {profile.roles && profile.roles.length > 0 && (
            <div className="mb-6">
              <div className="text-sm dark:text-green-400/60 text-gray-600 mb-2">ROLES:</div>
              <div className="flex flex-wrap gap-2">
                {profile.roles.map(role => (
                  <span 
                    key={role}
                    className="px-3 py-1 border-2 dark:border-green-400 border-gray-400 dark:text-green-400 text-gray-700 text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <div className="text-sm dark:text-green-400/60 text-gray-600 mb-2">BIO:</div>
              <p className="dark:text-green-400/80 text-gray-700">{profile.bio}</p>
            </div>
          )}

          {/* Location */}
          {(profile.locationCity || profile.locationCountry) && (
            <div className="flex items-center gap-2 dark:text-green-400/70 text-gray-600 mb-6">
              <MapPin className="h-4 w-4" />
              <span>
                {profile.locationCity && `${profile.locationCity}, `}
                {profile.locationState && `${profile.locationState}, `}
                {profile.locationCountry}
              </span>
            </div>
          )}

          {/* Genres */}
          {profile.genres && profile.genres.length > 0 && (
            <div className="mb-6">
              <div className="text-sm dark:text-green-400/60 text-gray-600 mb-2">GENRES:</div>
              <div className="flex flex-wrap gap-2">
                {profile.genres.map(genre => (
                  <span 
                    key={genre}
                    className="px-2 py-1 text-xs dark:border-green-400/50 border-gray-300 border dark:text-green-400/70 text-gray-600"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Links */}
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-green-400 text-gray-900">&gt; SOCIAL_LINKS</h2>
            
            <div className="space-y-4">
              {profile.spotifyUrl && (
                <a 
                  href={profile.spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border-2 dark:border-green-400/30 border-gray-300 hover:border-green-400 transition-all"
                >
                  <Music className="h-5 w-5 dark:text-green-400 text-gray-700" />
                  <span className="dark:text-green-400 text-gray-700">Spotify</span>
                  <ExternalLink className="h-4 w-4 ml-auto dark:text-green-400/50 text-gray-500" />
                </a>
              )}

              {profile.soundcloudUrl && (
                <a 
                  href={profile.soundcloudUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border-2 dark:border-green-400/30 border-gray-300 hover:border-green-400 transition-all"
                >
                  <Music className="h-5 w-5 dark:text-green-400 text-gray-700" />
                  <span className="dark:text-green-400 text-gray-700">SoundCloud</span>
                  <ExternalLink className="h-4 w-4 ml-auto dark:text-green-400/50 text-gray-500" />
                </a>
              )}

              {profile.instagramUrl && (
                <a 
                  href={profile.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border-2 dark:border-green-400/30 border-gray-300 hover:border-green-400 transition-all"
                >
                  <Instagram className="h-5 w-5 dark:text-green-400 text-gray-700" />
                  <span className="dark:text-green-400 text-gray-700">Instagram</span>
                  <ExternalLink className="h-4 w-4 ml-auto dark:text-green-400/50 text-gray-500" />
                </a>
              )}

              {profile.twitterUrl && (
                <a 
                  href={profile.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border-2 dark:border-green-400/30 border-gray-300 hover:border-green-400 transition-all"
                >
                  <Twitter className="h-5 w-5 dark:text-green-400 text-gray-700" />
                  <span className="dark:text-green-400 text-gray-700">Twitter</span>
                  <ExternalLink className="h-4 w-4 ml-auto dark:text-green-400/50 text-gray-500" />
                </a>
              )}

              {profile.youtubeUrl && (
                <a 
                  href={profile.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border-2 dark:border-green-400/30 border-gray-300 hover:border-green-400 transition-all"
                >
                  <Youtube className="h-5 w-5 dark:text-green-400 text-gray-700" />
                  <span className="dark:text-green-400 text-gray-700">YouTube</span>
                  <ExternalLink className="h-4 w-4 ml-auto dark:text-green-400/50 text-gray-500" />
                </a>
              )}

              {profile.websiteUrl && (
                <a 
                  href={profile.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 border-2 dark:border-green-400/30 border-gray-300 hover:border-green-400 transition-all"
                >
                  <Globe className="h-5 w-5 dark:text-green-400 text-gray-700" />
                  <span className="dark:text-green-400 text-gray-700">Website</span>
                  <ExternalLink className="h-4 w-4 ml-auto dark:text-green-400/50 text-gray-500" />
                </a>
              )}

              {!profile.spotifyUrl && !profile.soundcloudUrl && !profile.instagramUrl && 
               !profile.twitterUrl && !profile.youtubeUrl && !profile.websiteUrl && (
                <div className="text-center py-8 dark:text-green-400/50 text-gray-500">
                  No social links added yet
                </div>
              )}
            </div>
          </div>

          {/* Marketplace Items */}
          <div className="border-2 dark:border-green-400/30 border-gray-300 p-6">
            <h2 className="text-2xl font-bold mb-6 dark:text-green-400 text-gray-900">&gt; MARKETPLACE_ITEMS</h2>
            
            {marketplaceItems.length > 0 ? (
              <div className="space-y-4">
                {marketplaceItems.map(item => (
                  <Link
                    key={item.id}
                    href={`/marketplace/${item.id}`}
                    className="block border-2 dark:border-green-400/30 border-gray-300 p-4 hover:border-green-400 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold dark:text-green-400 text-gray-900">{item.title}</h3>
                      <div className="flex items-center gap-1 dark:text-green-400 text-gray-700">
                        <DollarSign className="h-4 w-4" />
                        <span>{item.priceUSDC}</span>
                      </div>
                    </div>
                    <p className="text-sm dark:text-green-400/70 text-gray-600 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 border dark:border-pink-400 border-pink-500 dark:text-pink-400 text-pink-600">
                        {item.category}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 dark:text-green-400/50 text-gray-500">
                No marketplace items yet
              </div>
            )}
          </div>
        </div>

        {/* Looking For Section */}
        {profile.lookingFor && (
          <div className="border-2 dark:border-cyan-400/30 border-cyan-300 p-6 mt-8 dark:bg-cyan-400/5 bg-cyan-50">
            <h2 className="text-xl font-bold mb-4 dark:text-cyan-400 text-cyan-700">&gt; LOOKING_FOR</h2>
            <p className="dark:text-cyan-400/80 text-cyan-700">{profile.lookingFor}</p>
          </div>
        )}
      </div>
    </div>
  )
}
