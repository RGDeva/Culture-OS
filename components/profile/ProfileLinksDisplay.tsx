'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Music,
  Youtube,
  ExternalLink,
  Plus,
  Trash2,
  Star,
} from 'lucide-react'
import { ProfileLink, MusicPlatform, PLATFORM_CONFIG } from '@/types/profile-links'
import { AddProfileLinksModal } from './AddProfileLinksModal'

interface ProfileLinksDisplayProps {
  userId: string
  isOwnProfile?: boolean
  compact?: boolean
}

export function ProfileLinksDisplay({
  userId,
  isOwnProfile = false,
  compact = false,
}: ProfileLinksDisplayProps) {
  const [links, setLinks] = useState<ProfileLink[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  
  useEffect(() => {
    fetchLinks()
  }, [userId])
  
  const fetchLinks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/profile/links?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setLinks(data.links || [])
      }
    } catch (error) {
      console.error('[PROFILE_LINKS] Error fetching links:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleDeleteLink = async (linkId: string) => {
    if (!confirm('Remove this link?')) return
    
    try {
      const response = await fetch(`/api/profile/links?userId=${userId}&linkId=${linkId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        await fetchLinks()
      }
    } catch (error) {
      console.error('[PROFILE_LINKS] Error deleting link:', error)
    }
  }
  
  const handleSetPrimary = async (linkId: string) => {
    try {
      const response = await fetch('/api/profile/links', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          linkId,
          updates: { isPrimary: true },
        }),
      })
      
      if (response.ok) {
        await fetchLinks()
      }
    } catch (error) {
      console.error('[PROFILE_LINKS] Error setting primary:', error)
    }
  }
  
  const getPlatformIcon = (platform: MusicPlatform) => {
    switch (platform) {
      case 'spotify':
      case 'apple_music':
      case 'tidal':
      case 'soundcloud':
        return <Music className="h-4 w-4" />
      case 'youtube':
        return <Youtube className="h-4 w-4" />
      default:
        return <ExternalLink className="h-4 w-4" />
    }
  }
  
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin h-6 w-6 border-4 dark:border-green-400 border-green-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    )
  }
  
  // Compact view for profile cards
  if (compact) {
    if (links.length === 0) return null
    
    return (
      <div className="flex flex-wrap gap-2">
        {links.slice(0, 3).map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 border dark:border-green-400/30 border-green-600/40 dark:hover:border-green-400 hover:border-green-600 transition-colors"
            style={{ borderLeftColor: PLATFORM_CONFIG[link.platform].color, borderLeftWidth: '3px' }}
          >
            {getPlatformIcon(link.platform)}
            <span className="text-xs font-mono dark:text-green-400/70 text-green-700/70">
              {PLATFORM_CONFIG[link.platform].name}
            </span>
          </a>
        ))}
        {links.length > 3 && (
          <span className="text-xs font-mono dark:text-green-400/50 text-green-700/50 px-2 py-1">
            +{links.length - 3} more
          </span>
        )}
      </div>
    )
  }
  
  // Full view for profile page
  return (
    <div className="border-2 dark:border-green-400/30 border-green-600/40 p-4 dark:bg-black/50 bg-white/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold font-mono dark:text-green-400 text-green-700">
          &gt; MUSIC_LINKS
        </h3>
        {isOwnProfile && (
          <Button
            onClick={() => setShowAddModal(true)}
            size="sm"
            variant="outline"
            className="dark:border-green-400/50 border-green-600/50 dark:text-green-400 text-green-700 font-mono"
          >
            <Plus className="h-3 w-3 mr-1" />
            ADD
          </Button>
        )}
      </div>
      
      {links.length === 0 ? (
        <div className="text-center py-6">
          <Music className="h-12 w-12 dark:text-green-400/30 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-mono dark:text-green-400/60 text-green-700/70">
            {isOwnProfile ? 'No music links added yet' : 'No music links available'}
          </p>
          {isOwnProfile && (
            <Button
              onClick={() => setShowAddModal(true)}
              size="sm"
              className="mt-3 bg-green-600 text-white hover:bg-green-500 dark:bg-green-400 dark:text-black dark:hover:bg-green-300 font-mono"
            >
              <Plus className="h-3 w-3 mr-1" />
              ADD_FIRST_LINK
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link) => (
            <div
              key={link.id}
              className="border-2 dark:border-green-400/20 border-green-600/30 p-3 flex items-center justify-between"
              style={{ borderLeftColor: PLATFORM_CONFIG[link.platform].color, borderLeftWidth: '4px' }}
            >
              <div className="flex items-center gap-3 flex-1">
                {link.imageUrl && (
                  <img
                    src={link.imageUrl}
                    alt={link.displayName}
                    className="w-10 h-10 object-cover border dark:border-green-400/30 border-green-600/40"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold dark:text-green-400 text-green-700 text-sm">
                      {link.displayName}
                    </span>
                    {link.isPrimary && (
                      <Star className="h-3 w-3 dark:text-yellow-400 text-yellow-600 fill-current" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono dark:text-green-400/60 text-green-700/70">
                    <span>{PLATFORM_CONFIG[link.platform].name}</span>
                    {link.metadata?.followers && (
                      <>
                        <span>•</span>
                        <span>{(link.metadata.followers / 1000).toFixed(0)}K followers</span>
                      </>
                    )}
                    {link.metadata?.monthlyListeners && (
                      <>
                        <span>•</span>
                        <span>{(link.metadata.monthlyListeners / 1000).toFixed(0)}K listeners</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 dark:text-green-400 text-green-700 hover:opacity-70"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                
                {isOwnProfile && (
                  <>
                    {!link.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(link.id)}
                        className="p-2 dark:text-yellow-400/70 text-yellow-600/70 hover:opacity-70"
                        title="Set as primary"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteLink(link.id)}
                      className="p-2 dark:text-red-400/70 text-red-600/70 hover:opacity-70"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Add Links Modal */}
      {isOwnProfile && (
        <AddProfileLinksModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          userId={userId}
          onLinkAdded={fetchLinks}
        />
      )}
    </div>
  )
}
