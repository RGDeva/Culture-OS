'use client'

import { useState, useEffect } from 'react'
import { X, ExternalLink, Music, Briefcase, MapPin, Globe, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface UserProfileModalProps {
  userId: string
  onClose: () => void
}

export function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
  const [profile, setProfile] = useState<any | null>(null)
  const [products, setProducts] = useState<any[]>([])
  const [bounties, setBounties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      try {
        // Fetch user profile
        const profileRes = await fetch(`/api/profiles/${userId}`)
        if (profileRes.ok) {
          const profileData = await profileRes.json()
          setProfile(profileData.profile)
        }

        // Fetch user's products
        const productsRes = await fetch(`/api/products?creatorId=${userId}`)
        if (productsRes.ok) {
          const productsData = await productsRes.json()
          setProducts(productsData.products || [])
        }

        // Fetch user's bounties
        const bountiesRes = await fetch(`/api/bounties?creatorId=${userId}`)
        if (bountiesRes.ok) {
          const bountiesData = await bountiesRes.json()
          setBounties(bountiesData.bounties || [])
        }
      } catch (error) {
        console.error('[USER_PROFILE_MODAL] Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <div className="text-green-400 font-mono">LOADING_PROFILE...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl bg-black border-2 border-green-400 p-8 font-mono text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 border border-green-400 hover:bg-green-400 hover:text-black transition-all"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-green-400">PROFILE_NOT_FOUND</p>
        </div>
      </div>
    )
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="h-4 w-4" />
      case 'twitter': return <Twitter className="h-4 w-4" />
      case 'youtube': return <Youtube className="h-4 w-4" />
      case 'linkedin': return <Linkedin className="h-4 w-4" />
      default: return <Globe className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-black border-2 border-green-400 font-mono">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/80 border border-green-400 hover:bg-green-400 hover:text-black transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="border-b-2 border-green-400/30 p-6">
          <div className="flex items-start gap-4">
            {profile.avatarUrl && (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-20 h-20 border-2 border-green-400"
              />
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-green-400 mb-2">{profile.displayName || profile.username}</h2>
              {profile.username && (
                <p className="text-green-400/70 mb-2">@{profile.username}</p>
              )}
              {profile.bio && (
                <p className="text-green-400/80 text-sm">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Location */}
          {(profile.city || profile.country) && (
            <div className="flex items-center gap-2 mt-4 text-sm text-green-400/70">
              <MapPin className="h-4 w-4" />
              <span>{profile.city}{profile.city && profile.country && ', '}{profile.country}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Roles/Skills */}
          {profile.roles && profile.roles.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                &gt; ROLES
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.roles.map((role: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-green-400/10 border border-green-400/30 text-green-400 text-sm"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Genres */}
          {profile.genres && profile.genres.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                <Music className="h-5 w-5" />
                &gt; GENRES
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.genres.map((genre: string, i: number) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-pink-400/10 border border-pink-400/30 text-pink-400 text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Social Links */}
          {profile.socialLinks && Object.keys(profile.socialLinks).length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">&gt; LINKS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(profile.socialLinks).map(([platform, url]: [string, any]) => (
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 border border-green-400/30 hover:border-green-400 hover:bg-green-400/5 transition-all text-green-400"
                    >
                      {getSocialIcon(platform)}
                      <span className="capitalize">{platform}</span>
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </a>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Products */}
          {products.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">&gt; PRODUCTS ({products.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.slice(0, 4).map((product) => (
                  <Link
                    key={product.id}
                    href={`/marketplace?product=${product.id}`}
                    className="border border-green-400/30 hover:border-green-400 p-4 transition-all group"
                  >
                    <h4 className="font-bold text-green-400 group-hover:text-green-300 mb-1">
                      {product.title}
                    </h4>
                    <p className="text-xs text-green-400/60 mb-2 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-400/70">{product.type}</span>
                      <span className="text-green-400 font-bold">${product.priceUSDC}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {products.length > 4 && (
                <Link
                  href={`/marketplace?creator=${userId}`}
                  className="block mt-4 text-center text-green-400 hover:text-green-300 text-sm"
                >
                  View all {products.length} products →
                </Link>
              )}
            </div>
          )}

          {/* Bounties */}
          {bounties.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-3">&gt; BOUNTIES ({bounties.length})</h3>
              <div className="space-y-3">
                {bounties.slice(0, 3).map((bounty) => (
                  <Link
                    key={bounty.id}
                    href={`/network?tab=bounties&bounty=${bounty.id}`}
                    className="block border border-pink-400/30 hover:border-pink-400 p-4 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-pink-400 group-hover:text-pink-300 mb-1">
                          {bounty.title}
                        </h4>
                        <p className="text-xs text-green-400/60 mb-2 line-clamp-1">{bounty.description}</p>
                        <div className="flex items-center gap-3 text-xs text-green-400/70">
                          <span className="px-2 py-1 bg-green-400/10 border border-green-400/30">
                            {bounty.role}
                          </span>
                          {bounty.budgetMinUSDC && (
                            <span>${bounty.budgetMinUSDC} USDC</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs ${
                        bounty.status === 'OPEN' ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {bounty.status}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              {bounties.length > 3 && (
                <Link
                  href={`/network?tab=bounties&creator=${userId}`}
                  className="block mt-4 text-center text-green-400 hover:text-green-300 text-sm"
                >
                  View all {bounties.length} bounties →
                </Link>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t-2 border-green-400/20">
            <Link href={`/profile/${userId}`} className="flex-1">
              <Button className="w-full bg-green-400 text-black hover:bg-green-300 font-mono">
                VIEW_FULL_PROFILE
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
