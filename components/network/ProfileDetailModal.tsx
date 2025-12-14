'use client'

import { Profile } from '@/types/profile'
import { Button } from '@/components/ui/button'
import { X, MapPin, Building2, Star, Mail, Globe, Music, Instagram, Twitter } from 'lucide-react'
import { calculateXpTier, getTierInfo } from '@/lib/xp-system'
import { TipSection } from '@/components/payments/TipSection'
import { usePrivy } from '@privy-io/react-auth'

interface ProfileDetailModalProps {
  profile: Profile
  isOpen: boolean
  onClose: () => void
}

export function ProfileDetailModal({ profile, isOpen, onClose }: ProfileDetailModalProps) {
  const { user } = usePrivy()
  
  if (!isOpen || !profile) return null

  const xp = profile?.xp || 0
  const tier = calculateXpTier(xp)
  const tierInfo = getTierInfo(tier)
  const isOwnProfile = user?.id === profile?.userId

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-black/80 bg-black/60 backdrop-blur-sm">
      <div className="dark:bg-black bg-white border-2 dark:border-green-400 border-green-600 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 dark:bg-black bg-white border-b dark:border-green-400/30 border-green-600/30 p-6 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold font-mono dark:text-green-400 text-green-700">
                {profile.displayName}
              </h2>
              <span className={`px-3 py-1 text-xs font-bold ${tierInfo.bgColor} ${tierInfo.textColor} ${tierInfo.borderColor} border`}>
                {tierInfo.label}
              </span>
            </div>
            
            {/* Roles */}
            {profile.roles && profile.roles.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.roles.map(role => (
                  <span key={role} className="text-xs px-2 py-1 border border-cyan-400 text-cyan-400 font-mono">
                    {role}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="dark:text-green-400 text-green-700 dark:hover:text-green-300 hover:text-green-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2 font-mono">&gt; BIO</h3>
                <p className="text-green-400/80 font-mono text-sm leading-relaxed">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Looking For */}
            {profile.lookingFor && (
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2 font-mono">&gt; LOOKING_FOR</h3>
                <p className="text-cyan-400/80 font-mono text-sm">
                  {profile.lookingFor}
                </p>
              </div>
            )}

            {/* Location */}
            {(profile.locationCity || profile.locationState || profile.locationCountry) && (
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2 font-mono">&gt; LOCATION</h3>
                <div className="flex items-center gap-2 text-green-400/70 font-mono text-sm">
                  <MapPin className="h-4 w-4" />
                  {profile.locationCity}
                  {profile.locationCity && profile.locationState && ', '}
                  {profile.locationState}
                  {(profile.locationCity || profile.locationState) && profile.locationCountry && ', '}
                  {profile.locationCountry}
                </div>
              </div>
            )}

            {/* Studio */}
            {profile.studioAssociation && profile.studioAssociation !== 'independent' && (
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2 font-mono">&gt; STUDIO</h3>
                <div className="flex items-center gap-2 text-pink-400/70 font-mono text-sm">
                  <Building2 className="h-4 w-4" />
                  {profile.studioAssociation}
                </div>
              </div>
            )}

            {/* Genres */}
            {profile.genres && profile.genres.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2 font-mono">&gt; GENRES</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map(genre => (
                    <span key={genre} className="text-xs px-2 py-1 border border-green-400/30 text-green-400/70 font-mono">
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {profile.tags && profile.tags.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-green-400 mb-2 font-mono">&gt; TAGS</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 bg-green-400/10 border border-green-400/30 text-green-400/70 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            <div>
              <h3 className="text-sm font-bold text-green-400 mb-3 font-mono">&gt; LINKS</h3>
              <div className="grid grid-cols-2 gap-3">
                {profile.email && (
                  <a
                    href={`mailto:${profile.email}`}
                    className="flex items-center gap-2 text-sm text-green-400/70 hover:text-green-400 transition-colors font-mono"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-400/70 hover:text-green-400 transition-colors font-mono"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
                {profile.spotifyUrl && (
                  <a
                    href={profile.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-400/70 hover:text-green-400 transition-colors font-mono"
                  >
                    <Music className="h-4 w-4" />
                    Spotify
                  </a>
                )}
                {profile.instagramHandle && (
                  <a
                    href={`https://instagram.com/${profile.instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-400/70 hover:text-green-400 transition-colors font-mono"
                  >
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </a>
                )}
                {profile.twitterHandle && (
                  <a
                    href={`https://twitter.com/${profile.twitterHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-green-400/70 hover:text-green-400 transition-colors font-mono"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </a>
                )}
              </div>
            </div>

            {/* XP Progress */}
            <div>
              <h3 className="text-sm font-bold text-green-400 mb-3 font-mono">&gt; STATS</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs text-green-400/60 mb-1 font-mono">
                    <span>XP: {xp}</span>
                    <span>{tierInfo.label}</span>
                  </div>
                  <div className="h-2 bg-green-400/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400 transition-all"
                      style={{ width: `${Math.min((xp / tierInfo.maxXp) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs text-green-400/60 mb-1 font-mono">
                    <span>PROFILE_COMPLETION</span>
                    <span>{profile.profileCompletion}%</span>
                  </div>
                  <div className="h-2 bg-green-400/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-400 transition-all"
                      style={{ width: `${profile.profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Tip Section - Only show for other users */}
            {!isOwnProfile && (
              <TipSection
                targetUserId={profile.userId}
                targetUserName={profile.displayName}
              />
            )}

            {/* Connect Button */}
            <Button
              className="w-full bg-green-400 text-black hover:bg-green-300 font-mono font-bold"
            >
              CONNECT
            </Button>

            {/* Message Button */}
            <Button
              variant="outline"
              className="w-full border-green-400 text-green-400 hover:bg-green-400/10 font-mono"
            >
              MESSAGE
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
