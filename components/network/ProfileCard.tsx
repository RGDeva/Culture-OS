'use client'

import { Profile } from '@/types/profile'
import { Button } from '@/components/ui/button'
import { MapPin, Building2, Star } from 'lucide-react'
import { calculateXpTier, getTierInfo } from '@/lib/xp-system'

interface ProfileCardProps {
  profile: Profile
  onViewProfile?: (profile: Profile) => void
}

export function ProfileCard({ profile, onViewProfile }: ProfileCardProps) {
  const xp = profile.xp || 0
  const tier = calculateXpTier(xp)
  const tierInfo = getTierInfo(tier)

  return (
    <div className="border-2 border-green-400/30 dark:border-green-400/30 light:border-gray-300 p-6 hover:border-green-400 dark:hover:border-green-400 light:hover:border-green-600 transition-all bg-black/40 dark:bg-black/40 light:bg-white">
      {/* Header with name and XP tier */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-xl font-bold text-green-400 dark:text-green-400 light:text-gray-900">{profile.displayName}</h3>
        <span className={`px-2 py-1 text-[10px] font-bold ${tierInfo.bgColor} ${tierInfo.textColor} ${tierInfo.borderColor} border`}>
          {tierInfo.label}
        </span>
      </div>

      {/* Roles */}
      {profile.roles && profile.roles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {profile.roles.map(role => (
            <span key={role} className="text-xs px-2 py-1 border border-cyan-400 text-cyan-400">
              {role}
            </span>
          ))}
        </div>
      )}

      {/* Location */}
      {(profile.locationCity || profile.locationState || profile.locationCountry) && (
        <div className="text-sm text-green-400/70 mb-2 flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {profile.locationCity}
          {profile.locationCity && profile.locationState && ', '}
          {profile.locationState}
          {(profile.locationCity || profile.locationState) && profile.locationCountry && ', '}
          {profile.locationCountry}
        </div>
      )}

      {/* Studio Association */}
      {profile.studioAssociation && profile.studioAssociation !== 'independent' && (
        <div className="text-sm text-pink-400/70 mb-2 flex items-center gap-1">
          <Building2 className="h-3 w-3" />
          {profile.studioAssociation}
        </div>
      )}

      {/* Genres */}
      {profile.genres && profile.genres.length > 0 && (
        <div className="text-xs text-green-400/60 mb-3">
          {profile.genres.slice(0, 3).join(', ')}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-sm text-green-400/80 mb-3 line-clamp-2">
          {profile.bio}
        </p>
      )}

      {/* Looking For */}
      {profile.lookingFor && (
        <div className="text-xs text-cyan-400/70 mb-3 italic">
          Looking for: {profile.lookingFor}
        </div>
      )}

      {/* XP Progress */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-green-400/60 mb-1">
          <span>XP: {xp}</span>
          <span>PROFILE: {profile.profileCompletion}%</span>
        </div>
        <div className="h-1 bg-green-400/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-400 transition-all"
            style={{ width: `${profile.profileCompletion}%` }}
          />
        </div>
      </div>

      {/* Action Button */}
      <Button
        size="sm"
        variant="outline"
        className="w-full border-green-400 text-green-400 hover:bg-green-400 hover:text-black font-mono text-xs"
        onClick={() => onViewProfile?.(profile)}
      >
        VIEW_PROFILE
      </Button>
    </div>
  )
}
