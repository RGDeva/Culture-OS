'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ProfileRole } from '@/types/profile'
import { X, ChevronRight } from 'lucide-react'

interface ProfileSetupCardProps {
  userId: string
  onComplete: () => void
  onSkip: () => void
}

export function ProfileSetupCard({ userId, onComplete, onSkip }: ProfileSetupCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [displayName, setDisplayName] = useState('')
  const [roles, setRoles] = useState<ProfileRole[]>([])
  const [primaryGoal, setPrimaryGoal] = useState('')
  const [locationRegion, setLocationRegion] = useState('')
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [appleMusicUrl, setAppleMusicUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [tiktokUrl, setTiktokUrl] = useState('')
  const [soundcloudUrl, setSoundcloudUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  
  const toggleRole = (role: ProfileRole) => {
    setRoles(prev =>
      prev.includes(role)
        ? prev.filter(r => r !== role)
        : [...prev, role]
    )
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/profile/me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId
        },
        body: JSON.stringify({
          userId,
          displayName,
          roles,
          primaryGoal,
          locationRegion,
          spotifyUrl,
          appleMusicUrl,
          youtubeUrl,
          soundcloudUrl,
          instagramUrl,
          tiktokUrl,
          websiteUrl
        })
      })
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save profile')
      }
      
      console.log('[PROFILE] Profile saved successfully')
      onComplete()
    } catch (err: any) {
      console.error('[PROFILE] Error saving profile:', err)
      setError(err.message || 'Failed to save profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="border-2 dark:border-pink-500 border-pink-600 dark:bg-black/90 bg-pink-50/50 p-4 font-mono mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg dark:text-pink-500 text-pink-700 font-bold">
          <span className="dark:text-green-400 text-green-700">&gt;_</span> FINISH_PROFILE
        </h2>
        <button
          onClick={onSkip}
          className="dark:text-pink-500 text-pink-700 dark:hover:text-pink-400 hover:text-pink-600 transition-colors"
          title="Skip for now"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="text-xs dark:text-green-400/70 text-green-700/70 mb-4">
        Complete your profile to unlock all features
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Display Name */}
        <div>
          <label className="block dark:text-green-400 text-green-700 text-xs mb-1 font-bold">
            NAME *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            className="w-full dark:bg-black bg-white border dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 px-2 py-1.5 text-sm font-mono focus:outline-none dark:focus:border-green-400 focus:border-green-600"
            placeholder="Artist name"
          />
        </div>
        
        {/* Roles - Compact */}
        <div>
          <label className="block dark:text-green-400 text-green-700 text-xs mb-1 font-bold">
            ROLE *
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['ARTIST', 'PRODUCER', 'ENGINEER', 'STUDIO'] as ProfileRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`px-2 py-1.5 border text-xs font-bold transition-colors ${
                  roles.includes(role)
                    ? 'bg-green-600 text-white border-green-600 dark:bg-green-400 dark:text-black dark:border-green-400'
                    : 'dark:bg-black bg-white dark:text-green-400 text-green-700 dark:border-green-400/50 border-green-600/50 dark:hover:border-green-400 hover:border-green-600'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        
        {/* Location - Compact */}
        <div>
          <label className="block dark:text-green-400 text-green-700 text-xs mb-1 font-bold">
            LOCATION
          </label>
          <input
            type="text"
            value={locationRegion}
            onChange={(e) => setLocationRegion(e.target.value)}
            className="w-full dark:bg-black bg-white border dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 px-2 py-1.5 text-sm font-mono focus:outline-none dark:focus:border-green-400 focus:border-green-600"
            placeholder="City, Country"
          />
        </div>
        
        {/* Error */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 px-3 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}
        
        {/* Actions - Compact */}
        <div className="flex gap-2 pt-2">
          <Button
            type="submit"
            disabled={isLoading || !displayName || roles.length === 0}
            className="flex-1 bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono text-sm py-1.5"
          >
            {isLoading ? 'SAVING...' : 'SAVE'}
          </Button>
          <Button
            type="button"
            onClick={onSkip}
            variant="outline"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 dark:hover:bg-green-400/10 hover:bg-green-600/10 font-mono text-sm py-1.5"
          >
            SKIP
          </Button>
        </div>
      </form>
    </div>
  )
}
